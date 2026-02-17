"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gavel, ExternalLink, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

type PaymentStatus = "paid" | "unpaid";

const History = () => {
  const [wins, setWins] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  const fetchWins = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc("get_user_wins", { p_user: user.id });

      if (error) {
        console.error("Erro RPC:", error);
        return;
      }

      const base = (data || []) as any[];

      if (base.length === 0) {
        setWins([]);
        return;
      }

      const lotIds = base.map((l) => l.id);

      const { data: payments, error: payError } = await supabase
        .from("lot_payments")
        .select("lot_id, status, paid_at")
        .eq("user_id", user.id)
        .in("lot_id", lotIds);

      if (payError) {
        console.error("Erro pagamentos:", payError);
        setWins(base);
        return;
      }

      const merged = base.map((lot) => {
        const p = (payments || []).find((x: any) => x.lot_id === lot.id);
        return {
          ...lot,
          payment_status: (p?.status as PaymentStatus) || "unpaid",
          paid_at: p?.paid_at || null,
        };
      });

      setWins(merged);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWins();
  }, [fetchWins]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Meus Arremates</h1>
        <p className="text-slate-500">Veículos onde você detém o maior lance em leilões encerrados.</p>
      </div>

      <div className="grid gap-6">
        {wins.length > 0 ? wins.map((lot) => {
          const paid = lot.payment_status === "paid";

          return (
            <Card key={lot.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 bg-slate-100 shrink-0 relative">
                  <img src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover" alt={lot.title} />
                  <Badge className="absolute top-4 left-4 bg-slate-900/80 text-white">LOTE #{lot.lot_number}</Badge>
                </div>

                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{lot.title}</h3>
                      <p className="text-sm text-slate-400">Encerrado em {new Date(lot.ends_at).toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-500 text-white border-none font-black px-4 py-1 rounded-full text-[10px] tracking-widest">
                        {paid ? "PAGO" : "PENDENTE"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mt-6 gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Valor de Arremate</p>
                      <p className="font-black text-slate-900 text-xl">{formatCurrency(lot.final_price)}</p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <Link to={`/lots/${lot.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold gap-2">
                          <ExternalLink size={16} /> Detalhes
                        </Button>
                      </Link>

                      {paid ? (
                        <Button
                          variant="outline"
                          className="rounded-xl font-black border-slate-200"
                          onClick={() => {/* opcional desfazer */}}
                        >
                          PAGO
                        </Button>
                      ) : (
                        <Button 
                          className="rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => navigate(`/app/checkout/${lot.id}`)}
                        >
                          PAGAR AGORA
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gavel size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum arremate ainda</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Participe dos leilões ativos para encontrar as melhores oportunidades.</p>
            <Link to="/auctions">
              <Button className="bg-slate-900 text-white rounded-xl px-8 font-bold">Explorar Leilões</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default History;