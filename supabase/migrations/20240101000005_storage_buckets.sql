-- 1. Cria o bucket 'public' se ele não existir e marca como público
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite que qualquer pessoa veja as imagens (necessário para o logo e banner aparecerem no site para os visitantes)
CREATE POLICY "Imagens publicas" ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- 3. Permite que usuários autenticados (você, como admin) façam upload de novas imagens
CREATE POLICY "Upload de imagens" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'public');

-- 4. Permite que usuários autenticados atualizem imagens existentes
CREATE POLICY "Atualizar imagens" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'public');

-- 5. Permite que usuários autenticados deletem imagens
CREATE POLICY "Deletar imagens" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'public');