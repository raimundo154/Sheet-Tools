-- Criar tabela para registrar vendas do Shopify
-- Execute este SQL no painel do Supabase em: SQL Editor

create table vendas (
  id bigint generated always as identity primary key,
  order_id bigint not null unique,
  produto text not null,
  preco numeric(10,2) not null,
  quantidade int not null default 1,
  total numeric(10,2) generated always as (preco * quantidade) stored,
  customer_email text,
  customer_name text,
  order_number text,
  financial_status text default 'pending',
  fulfillment_status text default 'unfulfilled',
  currency text default 'EUR',
  shop_domain text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices para performance
create index idx_vendas_order_id on vendas(order_id);
create index idx_vendas_created_at on vendas(created_at desc);
create index idx_vendas_customer_email on vendas(customer_email);

-- Trigger para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_vendas_updated_at
    before update on vendas
    for each row
    execute function update_updated_at_column();

-- Política RLS (Row Level Security) - opcional se quiser controlar acesso
alter table vendas enable row level security;

-- Política para permitir leitura autenticada
create policy "Permitir leitura para usuários autenticados" on vendas
    for select using (auth.role() = 'authenticated');

-- Política para permitir inserção via service role (webhook)
create policy "Permitir inserção via service role" on vendas
    for insert with check (auth.role() = 'service_role');

-- Comentários para documentação
comment on table vendas is 'Tabela para armazenar vendas recebidas via webhook do Shopify';
comment on column vendas.order_id is 'ID único da ordem no Shopify';
comment on column vendas.produto is 'Nome do produto vendido';
comment on column vendas.preco is 'Preço unitário do produto';
comment on column vendas.quantidade is 'Quantidade vendida';
comment on column vendas.total is 'Total calculado automaticamente (preco * quantidade)';
comment on column vendas.financial_status is 'Status financeiro: pending, paid, partially_paid, refunded, etc.';
comment on column vendas.fulfillment_status is 'Status de fulfillment: fulfilled, partial, unfulfilled, etc.';



