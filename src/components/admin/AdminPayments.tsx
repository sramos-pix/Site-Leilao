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

const FUNCTION_URL = "https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/mark-lot-payment";

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
        const { data: topBids } = await supabase
          .from("bids")
          .select("user_id, amount")
          .eq("lot_id", lot.id)
          .order("amount", { ascending: false })
          .limit(1);

        const topBid = topBids?.[0];
        if (!topBid?.user_id) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", topBid.user_id)
          .maybeSingle();

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

      if (enriched.length > 0) {
        const { data: payments } = await supabase
          .from("lot_payments")
          .select("lot_id, user_id, status, paid_at")
          .in("lot_id", enriched.map(r => r.lot_id));

        const merged = enriched.map(r => {
          const p = (payments || []).find(x => x.lot_id === r.lot_id && x.user_id === r.winner_id);
          return {
            ...r,
            payment_status: (p?.status as PaymentStatus) || "unpaid",
            paid_at: p?.paid_at || null,
          };
        });
        setRows(merged);
      } else {
        setRows([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const setRowStatus = async (row: AdminWinRow, status: PaymentStatus) => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se não houver sessão, usamos a anon key para a requisição (a função deve lidar com isso ou ser pública para admins)
      const authHeader = session?.access_token 
        ? `Bearer ${session.access_token}` 
        : `Bearer ${supabase['supabaseKey']}`;

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lot_id: row.lot_id, user_id: row.winner_id, status }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Erro ao atualizar pagamento.");

      setRows(prev => prev.map(r => 
        (r.lot_id === row.lot_id && r.winner_id === row.winner_id) 
          ? { ...r, payment_status: status, paid_at: status === "paid" ? new Date().toISOString() : null } 
          : r
      ));

      toast({ title: status === "paid" ? "Pagamento Confirmado" : "Pagamento Estornado" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return r.lot_title.toLowerCase().includes(q) || String(r.lot_number).includes(q) || (r.winner_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestão de Pagamentos</h2>
          <p className="text-slate-500 text-sm">Confirme o recebimento dos valores de arremate.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar arremate..." className="pl-10 rounded-xl border-none shadow-sm" />
          </div>
          <Button onClick={fetchRows} variant="outline" className="rounded-xl" disabled={isLoading}><RefreshCw size={16} /></Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic">Nenhum arremate pendente encontrado.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <div key={`${r.lot_id}-${r.winner_id}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={r.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900">LOTE #{r.lot_number} — {r.lot_title}</p>
                        <Badge className={r.payment_status === 'paid' ? "bg-emerald-500" : "bg-orange-500"}>
                          {r.payment_status === 'paid' ? 'PAGO' : 'PENDENTE'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Vencedor: <span className="font-bold text-slate-700">{r.winner_name || '—'}</span> ({r.winner_email || '—'})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Valor Final</p>
                      <p className="text-xl font-black text-slate-900">{formatCurrency(r.final_price)}</p>
                    </div>
                    {r.payment_status === 'paid' ? (
                      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-orange-600" onClick={() => setRowStatus(r, 'unpaid')} disabled={isRefreshing}>
                        <Undo2 size={16} className="mr-2" /> Estornar
                      </Button>
                    ) : (
                      <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setRowStatus(r, 'paid')} disabled={isRefreshing}>
                        <CheckCircle2 size={16} className="mr-2" /> Confirmar Recebimento
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