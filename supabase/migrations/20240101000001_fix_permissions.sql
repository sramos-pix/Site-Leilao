-- Desabilitar RLS temporariamente para permitir cadastros sem travas de segurança complexas durante o desenvolvimento
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE auctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- Garantir que a tabela de perfis aceite inserções
GRANT ALL ON TABLE profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE auctions TO anon, authenticated, service_role;
GRANT ALL ON TABLE lots TO anon, authenticated, service_role;
GRANT ALL ON TABLE bids TO anon, authenticated, service_role;