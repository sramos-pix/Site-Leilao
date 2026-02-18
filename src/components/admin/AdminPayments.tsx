"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Loader2, RefreshCw, Car, Wallet, Undo2 } from "lucide-react";

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
        .select("id, lot_number, title, ends_at, cover_image_url, status, final_price, current_bid")
        .or(`status.eq.finished`)
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
      const merged = enriched.map(r => {
        const p = payments?.find(pay => pay.lot_id === r.id);
        return {
          ...r,
          payment_status: p?.status || "unpaid"
        };
      });
      
      setRows(merged);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRows(); }, [fetchRows]);

  const updateStatus = async (row: any, newStatus: string) => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão não encontrada. Faça login novamente.");

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          lot_id: row.id, 
          user_id: row.winner_id, 
          status: newStatus 
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao atualizar status no servidor");
      }

      toast({ title: "Status atualizado com sucesso!" });
      await fetchRows();
    } catch (err: any) {
      console.error("Erro na atualização:", err);
      toast({ 
        variant: "destructive", 
        title: "Falha na atualização", 
        description: "O banco de dados não aceitou este status. Verifique as permissões." 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = rows.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestão Financeira</h2>
          <p className="text-slate-500 text-sm">Confirme recebimentos de veículos e comissões.</p>
        </div>
        <div className="flex gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar veículo..." className="w-64 rounded-xl" />
          <Button onClick={fetchRows} variant="outline" className="rounded-xl"><RefreshCw size={16} /></Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {isLoading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div> : 
            filtered.map((r) => {
              // Simplificando a lógica para usar apenas 'paid' e 'unpaid' conforme a restrição do banco
              const isPaid = r.payment_status === 'paid';
              const commission = r.final_price * 0.05;

              return (
                <div key={r.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={r.cover_image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">#{r.lot_number} - {r.title}</p>
                      <p className="text-xs text-slate-500">{r.winner_name} • {r.winner_email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 flex-1 lg:flex-none">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Valor Veículo</p>
                      <p className="font-black text-slate-900">{formatCurrency(r.final_price)}</p>
                      <Button 
                        size="sm"
                        variant={isPaid ? "outline" : "default"}
                        className={cn("w-full rounded-lg gap-2 h-9", isPaid ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "bg-slate-900")}
                        onClick={() => updateStatus(r, isPaid ? 'unpaid' : 'paid')}
                        disabled={isRefreshing}
                      >
                        {isPaid ? <Undo2 size={14} /> : <Car size={14} />}
                        {isPaid ? 'Estornar' : 'Confirmar Tudo'}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Comissão (5%)</p>
                      <p className="font-black text-orange-600">{formatCurrency(commission)}</p>
                      <div className="h-9 flex items-center justify-center">
                        <Badge variant="outline" className={cn("border-none font-bold", isPaid ? "text-emerald-600" : "text-slate-300")}>
                          {isPaid ? "PAGO" : "PENDENTE"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
          {!isLoading && filtered.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic">Nenhum arremate finalizado encontrado.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}