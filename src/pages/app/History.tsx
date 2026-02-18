"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gavel, ExternalLink, CheckCircle2, FileText, AlertCircle, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { generateWinningCertificate } from "@/lib/pdf-generator";

const History = () => {
  const [wins, setWins] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();

  const fetchWins = React.useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      const { data, error } = await supabase.rpc("get_user_wins", { p_user: currentUser.id });
      if (error) throw error;

      const base = (data || []) as any[];
      if (base.length === 0) {
        setWins([]);
        return;
      }

      const { data: payments } = await supabase
        .from("lot_payments")
        .select("*")
        .eq("user_id", currentUser.id)
        .in("lot_id", base.map(l => l.id));

      const merged = base.map((lot) => {
        const p = (payments || []).find((x: any) => x.lot_id === lot.id);
        return {
          ...lot,
          // Simulando que o status 'paid' agora significa 'tudo pago'
          // Em um sistema real, você teria colunas 'vehicle_paid' e 'commission_paid'
          vehicle_paid: p?.status === 'paid' || p?.status === 'partial', 
          commission_paid: p?.status === 'paid',
          payment_status: p?.status || "unpaid",
        };
      });

      setWins(merged);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchWins(); }, [fetchWins]);

  if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-orange-500" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Meus Arremates</h1>
        <p className="text-slate-500">Gerencie seus veículos e pendências financeiras.</p>
      </div>

      <div className="grid gap-6">
        {wins.length > 0 ? wins.map((lot) => {
          const commission = lot.final_price * 0.05;
          const isFullyPaid = lot.commission_paid && lot.vehicle_paid;

          return (
            <Card key={lot.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 bg-slate-100 shrink-0 relative">
                  <img src={lot.cover_image_url} className="w-full h-full object-cover" alt={lot.title} />
                  <Badge className="absolute top-4 left-4 bg-slate-900/80 text-white">LOTE #{lot.lot_number}</Badge>
                </div>

                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{lot.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className={lot.vehicle_paid ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-orange-200 text-orange-600"}>
                          Veículo: {lot.vehicle_paid ? 'Quitado' : 'Pendente'}
                        </Badge>
                        <Badge variant="outline" className={lot.commission_paid ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-red-200 text-red-600"}>
                          Comissão (5%): {lot.commission_paid ? 'Quitada' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                    {isFullyPaid && <Badge className="bg-emerald-500 text-white border-none font-bold">LIBERADO</Badge>}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mt-6 gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total do Arremate</p>
                      <p className="font-black text-slate-900 text-xl">{formatCurrency(lot.final_price + commission)}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                      {!lot.commission_paid && (
                        <Button 
                          className="rounded-xl font-black bg-orange-500 hover:bg-orange-600 text-white px-6 shadow-lg shadow-orange-100"
                          onClick={() => navigate(`/app/checkout/${lot.id}?type=commission`)}
                        >
                          <Wallet size={16} className="mr-2" /> PAGAR COMISSÃO ({formatCurrency(commission)})
                        </Button>
                      )}

                      {isFullyPaid ? (
                        <Button 
                          variant="secondary"
                          className="rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 gap-2"
                          onClick={() => generateWinningCertificate(lot, user)}
                        >
                          <FileText size={16} /> BAIXAR NOTA FISCAL
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-50 px-4 py-2 rounded-xl border border-dashed">
                          <AlertCircle size={14} /> Nota liberada após quitação total
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Gavel size={40} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Nenhum arremate</h3>
            <Link to="/auctions"><Button className="mt-4 bg-slate-900 text-white rounded-xl px-8 font-bold">Explorar Leilões</Button></Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default History;