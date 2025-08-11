-- Criação da tabela products no Supabase
-- Esta tabela armazena informações dos produtos dos usuários

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    shipping_time VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    image_url TEXT,
    image_file_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios produtos
CREATE POLICY "Users can view own products" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem produtos
CREATE POLICY "Users can create own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios produtos
CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios produtos
CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- Criar bucket para imagens dos produtos (executar no Storage)
-- Nota: Este comando deve ser executado no dashboard do Supabase Storage
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true);

-- Criar política para o bucket de imagens
-- CREATE POLICY "Users can upload product images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view product images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'product-images');

-- CREATE POLICY "Users can delete own product images" ON storage.objects
--     FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);