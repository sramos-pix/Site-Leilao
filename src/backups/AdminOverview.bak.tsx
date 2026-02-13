"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, Package, Users, TrendingUp, 
  RefreshCw, Loader2, Clock, User 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    auctions: 0,
    lots: 0,
    users: 0,
    bids: 0
  });
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [auctions, lots, users, bids] = await Promise.all([
        supabase.from('auctions').select('*', { count: 'exact', head: true }),
        supabase.from('lots').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        auctions: auctions.count || 0,
        lots: lots.count || 0,
        users: users.count || 0,
        bids: bids.count || 0
      });

      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          user_id,
          lot_id,
          profiles (
            full_name,
            email
          ),
          lots (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (bidsError) {
        const { data: fallbackData } = await supabase
          .from('bids')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        setRecentBids(fallbackData || []);
      } else {
        setRecentBids(bidsData || []);
      }

    } catch (error) {
      console.error("Erro crítico ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>Backup file - logic preserved</div>
  );
};

export default AdminOverview;