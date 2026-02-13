-- Configurações de Anti-Sniper no Leilão
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS anti_sniping_enabled BOOLEAN DEFAULT true;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS anti_sniping_trigger_minutes INTEGER DEFAULT 2; -- minutos finais que ativam a regra
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS anti_sniping_extend_seconds INTEGER DEFAULT 120; -- quanto tempo estende (2 min)
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS anti_sniping_max_extensions INTEGER DEFAULT 10;

-- Controle de extensões no Lote
ALTER TABLE lots ADD COLUMN IF NOT EXISTS extensions_count INTEGER DEFAULT 0;

-- Tabela de Faixas de Incremento (Opcional, mas recomendado para flexibilidade)
CREATE TABLE IF NOT EXISTS increment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auctions(id),
    min_value NUMERIC NOT NULL,
    max_value NUMERIC,
    increment_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);