# Solução para Erro de Constraint no Daily ROAS

## Problema Identificado

Ao adicionar produtos manualmente na página Daily ROAS, apareciam os seguintes erros na consola:

```
POST https://dnamxsapwgltxmtokecd.supabase.co/rest/v1/daily_roas_data?on_conflict=user_id%2Cdate%2Cproduct_name&select=* 400 (Bad Request)

Erro ao salvar produto: 
{code: '42P10', details: null, hint: null, message: 'there is no unique or exclusion constraint matching the ON CONFLICT specification'}
```

## Causa do Problema

O erro ocorria porque:

1. **Constraint Única Ausente**: A tabela `daily_roas_data` não tinha uma constraint única para `(user_id, date, product_name)`
2. **Uso de `upsert` com `onConflict`**: O código tentava usar `upsert` com `onConflict: 'user_id,date,product_name'`, mas essa constraint não existia na base de dados
3. **Inconsistência entre Schema e Código**: O schema da base de dados não correspondia ao que o código esperava

## Soluções Implementadas

### 1. **Correção do Serviço (dailyRoasService.js)**

**Antes:**
```javascript
const { data, error } = await supabase
  .from('daily_roas_data')
  .upsert(productData, {
    onConflict: 'user_id,date,product_name'
  })
  .select()
  .single();
```

**Depois:**
```javascript
// Verificar se já existe um produto com o mesmo nome na mesma data
const { data: existingProducts, error: checkError } = await supabase
  .from('daily_roas_data')
  .select('id')
  .eq('user_id', user.user.id)
  .eq('date', product.date)
  .eq('product_name', product.productName);

if (existingProducts && existingProducts.length > 0) {
  // Atualizar produto existente
  const { data, error } = await supabase
    .from('daily_roas_data')
    .update(productData)
    .eq('id', existingProducts[0].id)
    .select()
    .single();
} else {
  // Inserir novo produto
  const { data, error } = await supabase
    .from('daily_roas_data')
    .insert(productData)
    .select()
    .single();
}
```

### 2. **Melhoria do Método formatProductToDB**

- Adicionado parâmetro `includeId` para controlar quando incluir o ID
- Melhor validação do ID para evitar timestamps inválidos
- Separação clara entre inserts e updates

### 3. **Método de Limpeza de Duplicados**

Adicionado método `cleanupDuplicates()` para:
- Identificar produtos duplicados por `(user_id, date, product_name)`
- Manter apenas o registro mais recente
- Eliminar duplicados existentes na base de dados

### 4. **Scripts SQL para Constraint**

Criados scripts SQL para adicionar a constraint única:

**sql/add_unique_constraint.sql:**
```sql
ALTER TABLE daily_roas_data 
ADD CONSTRAINT unique_user_date_product 
UNIQUE(user_id, date, product_name);
```

## Como Aplicar a Solução

### Opção 1: Apenas Código (Recomendado)
A correção do serviço já resolve o problema sem necessidade de alterar a base de dados.

### Opção 2: Com Constraint na Base de Dados
1. Executar o script `sql/add_unique_constraint.sql` no Supabase
2. Isso adicionará a constraint única para prevenir duplicados futuros

### Opção 3: Limpeza de Duplicados Existentes
```javascript
// No console do browser ou em código
const duplicatesRemoved = await dailyRoasService.cleanupDuplicates();
console.log(`Removidos ${duplicatesRemoved} duplicados`);
```

## Benefícios da Solução

1. **✅ Funcionamento Imediato**: O erro de constraint é resolvido
2. **✅ Prevenção de Duplicados**: Lógica robusta para evitar produtos duplicados
3. **✅ Compatibilidade**: Funciona com ou sem constraint na base de dados
4. **✅ Limpeza**: Método para limpar duplicados existentes
5. **✅ Performance**: Queries otimizadas para verificação de existência

## Teste da Solução

1. **Adicionar Produto Novo**: Deve funcionar normalmente
2. **Adicionar Produto Duplicado**: Deve atualizar o existente
3. **Verificar Consola**: Não deve haver mais erros de constraint
4. **Verificar Base de Dados**: Produtos devem ser salvos corretamente

## Arquivos Modificados

- `src/services/dailyRoasService.js` - Correção principal
- `sql/add_unique_constraint.sql` - Script para constraint (opcional)
- `sql/fix_daily_roas_constraint.sql` - Script alternativo (opcional)

## Status

✅ **Problema Resolvido** - O erro de constraint não deve mais aparecer ao adicionar produtos manualmente no Daily ROAS.
