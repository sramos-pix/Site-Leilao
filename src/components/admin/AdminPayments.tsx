"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Loader2, RefreshCw, Search, Undo2 } from "lucide-react";

type PaymentStatus = "paid" | "unpaid";

const FUNCTION_URL = "https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/mark-lot-payment";

export default function AdminPayments() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const fetchRows = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: lots } = await supabase
        .from("lots")
        .select("id, lot_number, title, ends_at, cover_image_url, status")
        .or(`ends_at.lt.${new Date().toISOString()},status.eq.finished`)
        .order("ends_at", { ascending: false });

      const enriched = [];
      for (const lot of lots || []) {
        const { data: topBids } = await supabase
          .from("bids")
          .select("user_id, amount")
          .eq("lot_id", lot.id)
          .order("amount", { ascending: false })
          .limit(1);

        if (topBids?.[0]) {
          const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", topBids[0].user_id).maybeSingle();
          enriched.push({
            ...lot,
            winner_id: topBids[0].user_id,
            winner_name: profile?.full_name,
            winner_email: profile?.email,
            final_price: topBids[0].amount
          });
        }
      }

      const { data: payments } = await supabase.from("lot_payments").select("*");
      const merged = enriched.map(r => ({
        ...r,
        payment_status: payments?.find(p => p.lot_id === r.id)?.status || "unpaid"
      }));
      
      setRows(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRows(); }, [fetchRows]);

  const setRowStatus = async (row: any, status: PaymentStatus) => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada.");

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lot_id: row.id, user_id: row.winner_id, status }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Erro na operação.");

      toast({ title: "Sucesso!" });
      fetchRows();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = rows.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Gestão de Pagamentos</h2>
        <div className="flex gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-64 rounded-xl" />
          <Button onClick={fetchRows} variant="outline" className="rounded-xl"><RefreshCw size={16} /></Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {isLoading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div> : 
            filtered.map((r) => (
              <div key={r.id} className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={r.cover_image_url} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">#{r.lot_number} - {r.title}</p>
                    <p className="text-xs text-slate-500">{r.winner_name} ({r.winner_email})</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-black">{formatCurrency(r.final_price)}</p>
                  <Badge className={r.payment_status === 'paid' ? "bg-emerald-500" : "bg-orange-500"}>{r.payment_status.toUpperCase()}</Badge>
                  <Button 
                    variant={r.payment_status === 'paid' ? "outline" : "default"}
                    onClick={() => setRowStatus(r, r.payment_status === 'paid' ? 'unpaid' : 'paid')}
                    disabled={isRefreshing}
                    className="rounded-xl"
                  >
                    {r.payment_status === 'paid' ? <Undo2 size={16} /> : <CheckCircle2 size={16} />}
                  </Button>
                </div>
              </div>
            ))
          }
        </div>
      </Card>
    </div>
  );
}