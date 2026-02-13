"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, Package, Users, TrendingUp, 
  RefreshCw, Loader2, Clock, User, ExternalLink, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * PONTO DE RESTAURAÇÃO - VERSÃO ESTÁVEL V1
 * Lógica de exclusão de lances e atualização de lote funcionando com RLS desabilitado.
 */
const AdminOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ auctions: 0, lots: 0, users: 0, bids: 0 });
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchStats = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [auctions, lots, users, bidsCount] = await Promise.all([
        supabase.from('auctions').select('*', { count: 'exact', head: true }),
        supabase.from('lots').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true })
      ]);

      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (bidsError) throw bidsError;

      setStats({
        auctions: auctions.count || 0,
        lots: lots.count || 0,
        users: users.count || 0,
        bids: bidsCount.count || 0
      });

      if (bids && bids.length > 0) {
        const userIds = [...new Set(bids.map(b => b.user_id))];
        const lotIds = [...new Set(bids.map(b => b.lot_id))];
        const [profilesRes, lotsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email').in('id', userIds),
          supabase.from('lots').select('id, title').in('id', lotIds)
        ]);
        const profilesMap = (profilesRes.data || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p }), {});
        const lotsMap = (lotsRes.data || []).reduce((acc: any, l) => ({ ...acc, [l.id]: l }), {});
        setRecentBids(bids.map(bid => ({ ...bid, profiles: profilesMap[bid.user_id], lots: lotsMap[bid.lot_id] })));
      } else {
        setRecentBids([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const handleDeleteBid = async (bidId: string, lotId: string, amount: number) => {
    if (!confirm(`Deseja realmente EXCLUIR este lance de ${formatCurrency(amount)}?`)) return;
    setIsDeleting(bidId);
    try {
      const { error: deleteError } = await supabase.from('bids').delete().eq('id', bidId);
      if (deleteError) throw deleteError;

      const { data: nextHighestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newCurrentBid = nextHighestBid?.amount || 0;
      await supabase.from('lots').update({ current_bid: newCurrentBid }).eq('id', lotId);

      toast({ title: "Lance excluído", description: "O registro foi removido e o valor do veículo atualizado." });
      await fetchStats(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro na exclusão", description: error.message });
      fetchStats(true);
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchStats(true);
    const channel = supabase.channel('admin-realtime-stable').on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchStats()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStats]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Backup do AdminOverview</h2>
      <p className="text-sm text-gray-500">Este arquivo é apenas para referência e restauração.</p>
    </div>
  );
};

export default AdminOverview;