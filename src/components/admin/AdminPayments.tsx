"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Loader2, RefreshCw, Search, Undo2 } from "lucide-react";

type PaymentStatus = "paid" | "unpaid";

type AdminWinRow = {
  lot_id: string;
  lot_number: number;
  lot_title: string;
  ends_at: string;
  final_price: number;
  cover_image_url?: string | null;
  winner_id: string;
  winner_name?: string | null;
  winner_email?: string | null;
  payment_status: PaymentStatus;
  paid_at?: string | null;
};

const FUNCTION_URL =
  "https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/mark-lot-payment";

function statusBadge(status: PaymentStatus) {
  if (status === "paid") {
    return (
      <Badge className="bg-emerald-600 text-white border-none rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
        PAGO
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-100 text-orange-700 border-none rounded-full px-3 py-1 text-[10px] font-black tracking-widest">
      PENDENTE
    </Badge>
  );
}

async function callMarkPayment({
  lotId,
  userId,
  status,
}: {
  lotId: string;
  userId: string;
  status: PaymentStatus;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: (supabase as any)?.supabaseKey || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lot_id: lotId, user_id: userId, status }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }

  if (!res.ok) {
    throw new Error(json?.error || text || "Erro ao atualizar pagamento.");
  }

  return json;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<AdminWinRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const fetchRows = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: lots, error: lotsError } = await supabase
        .from("lots")
        .select("id, lot_number, title, ends_at, cover_image_url, status")
        .or(`ends_at.lt.${new Date().toISOString()},status.eq.finished`)
        .order("ends_at", { ascending: false })
        .limit(40);

      if (lotsError) throw lotsError;

      const enriched: AdminWinRow[] = [];

      for (const lot of lots || []) {
        const { data: topBids, error: bidError } = await supabase
          .from("bids")
          .select("user_id, amount, created_at")
          .eq("lot_id", lot.id)
          .order("amount", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(1);

        if (bidError) throw bidError;
        const topBid = topBids?.[0];
        if (!topBid?.user_id) continue;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", topBid.user_id)
          .maybeSingle();

        if (profileError) throw profileError;

        enriched.push({
          lot_id: lot.id,
          lot_number: lot.lot_number,
          lot_title: lot.title,
          ends_at: lot.ends_at,
          final_price: topBid.amount,
          cover_image_url: lot.cover_image_url,
          winner_id: topBid.user_id,
          winner_name: profile?.full_name || null,
          winner_email: profile?.email || null,
          payment_status: "unpaid",
          paid_at: null,
        });
      }

      if (enriched.length === 0) {
        setRows([]);
        return;
      }

      const lotIds = enriched.map((r) => r.lot_id);

      const { data: payments, error: payError } = await supabase
        .from("lot_payments")
        .select("lot_id, user_id, status, paid_at")
        .in("lot_id", lotIds);

      if (payError) throw payError;

      const merged = enriched.map((r) => {
        const p = (payments || []).find(
          (x: any) => x.lot_id === r.lot_id && x.user_id === r.winner_id,
        );
        return {
          ...r,
          payment_status: (p?.status as PaymentStatus) || "unpaid",
          paid_at: p?.paid_at || null,
        };
      });

      setRows(merged);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.lot_title.toLowerCase().includes(q) ||
      String(r.lot_number).includes(q) ||
      (r.winner_name || "").toLowerCase().includes(q) ||
      (r.winner_email || "").toLowerCase().includes(q)
    );
  });

  const setRowStatus = async (row: AdminWinRow, status: PaymentStatus) => {
    setIsRefreshing(true);
    try {
      await callMarkPayment({ lotId: row.lot_id, userId: row.winner_id, status });

      setRows((prev) =>
        prev.map((r) =>
          r.lot_id === row.lot_id && r.winner_id === row.winner_id
            ? {
                ...r,
                payment_status: status,
                paid_at: status === "paid" ? new Date().toISOString() : null,
              }
            : r,
        ),
      );

      toast({
        title: status === "paid" ? "Pagamento marcado como PAGO" : "Pagamento desmarcado",
        description:
          status === "paid"
            ? "O painel do usuário vai mostrar como pago."
            : "O painel do usuário volta para pendente.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Pagamentos</h2>
          <p className="text-slate-500 text-sm">
            Marque como <span className="font-bold">pago</span> após confirmar o recebimento.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lote, nº, usuário..."
              className="pl-10 bg-white border-none shadow-sm rounded-xl"
            />
          </div>
          <Button
            onClick={fetchRows}
            variant="outline"
            className="rounded-xl border-slate-200 font-black"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-100">
          <CardTitle className="text-sm font-black tracking-wide text-slate-700">
            Arremates encerrados (top lance)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center bg-white">
              <Loader2 className="animate-spin text-orange-500" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white">
              <p className="text-slate-900 font-black">Nada para mostrar</p>
              <p className="text-slate-500 text-sm">Sem arremates encerrados com lances.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {filtered.map((r) => (
                <div
                  key={`${r.lot_id}:${r.winner_id}`}
                  className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={
                          r.cover_image_url ||
                          "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200"
                        }
                        alt={r.lot_title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-black text-slate-900 truncate">
                          LOTE #{r.lot_number} — {r.lot_title}
                        </p>
                        {statusBadge(r.payment_status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Vencedor:{" "}
                        <span className="font-bold text-slate-700">
                          {r.winner_name || "—"}
                        </span>{" "}
                        <span className="text-slate-400">({r.winner_email || "—"})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                        Valor (top lance)
                      </p>
                      <p className="font-black text-slate-900">
                        {formatCurrency(r.final_price)}
                      </p>
                    </div>

                    {r.payment_status === "paid" ? (
                      <Button
                        variant="outline"
                        className="rounded-xl font-black border-slate-200"
                        onClick={() => setRowStatus(r, "unpaid")}
                        disabled={isRefreshing}
                      >
                        <Undo2 size={16} className="mr-2" />
                        Desfazer
                      </Button>
                    ) : (
                      <Button
                        className="rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setRowStatus(r, "paid")}
                        disabled={isRefreshing}
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Marcar como pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}