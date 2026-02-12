-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela de Leilões
create table if not exists public.auctions (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
    starts_at timestamp with time zone not null,
    ends_at timestamp with time zone not null,
    location text,
    buyer_fee_percent numeric default 5,
    requires_deposit boolean default false,
    deposit_amount numeric default 0,
    anti_sniping_enabled boolean default true,
    anti_sniping_extend_seconds integer default 120,
    anti_sniping_max_extensions integer default 10,
    min_increment_default numeric default 500,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Lotes (Veículos)
create table if not exists public.lots (
    id uuid default uuid_generate_v4() primary key,
    auction_id uuid references public.auctions(id) on delete cascade,
    lot_number integer not null,
    title text not null,
    brand text,
    model text,
    version text,
    year integer,
    mileage_km integer,
    fuel text,
    transmission text,
    color text,
    plate_masked text,
    vin_masked text,
    condition_notes text,
    start_bid numeric not null,
    current_bid numeric,
    min_increment numeric,
    ends_at timestamp with time zone not null,
    images text[] default '{}',
    extensions_count integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Lances
create table if not exists public.bids (
    id uuid default uuid_generate_v4() primary key,
    lot_id uuid references public.lots(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    amount numeric not null,
    created_at timestamp with time zone default now()
);

-- Tabela de Pagamentos/Depósitos
create table if not exists public.payments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    auction_id uuid references public.auctions(id) on delete cascade,
    amount numeric not null,
    status text default 'pending' check (status in ('pending', 'paid', 'failed')),
    stripe_payment_intent_id text,
    created_at timestamp with time zone default now()
);

-- Habilitar Realtime para lances e lotes
alter publication supabase_realtime add table public.lots;
alter publication supabase_realtime add table public.bids;

-- Políticas de Segurança (RLS)
alter table public.auctions enable row level security;
alter table public.lots enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;

-- Leitura pública para leilões e lotes
create policy "Leilões são visíveis para todos" on public.auctions for select using (true);
create policy "Lotes são visíveis para todos" on public.lots for select using (true);
create policy "Lances são visíveis para todos" on public.bids for select using (true);

-- Apenas usuários autenticados podem dar lances
create policy "Usuários autenticados podem criar lances" on public.bids for insert with check (auth.role() = 'authenticated');

-- Usuários podem ver seus próprios pagamentos
create policy "Usuários veem seus próprios pagamentos" on public.payments for select using (auth.uid() = user_id);

-- Trigger para atualizar o current_bid no lote quando um lance é feito
create or replace function public.handle_new_bid()
returns trigger as $$
begin
    update public.lots
    set current_bid = new.amount,
        updated_at = now()
    where id = new.lot_id;
    return new;
end;
$$ language plpgsql;

create trigger on_new_bid
    after insert on public.bids
    for each row execute function public.handle_new_bid();