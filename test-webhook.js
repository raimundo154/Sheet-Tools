// Script para testar o webhook do Shopify
// Execute: node test-webhook.js

const testWebhook = async () => {
  const webhookUrl = 'https://sheet-tools.com/.netlify/functions/shopify-webhook';
  
  console.log('🧪 Testando webhook:', webhookUrl);
  
  // Payload de teste simulando uma ordem do Shopify
  const testOrder = {
    id: Date.now(), // ID único baseado no timestamp
    order_number: Math.floor(Math.random() * 1000) + 1000,
    name: "#TEST" + Math.floor(Math.random() * 1000),
    financial_status: "paid",
    fulfillment_status: "fulfilled", 
    currency: "EUR",
    shop_domain: "minha-loja-teste.myshopify.com",
    customer: {
      email: "teste@example.com",
      first_name: "João",
      last_name: "Silva"
    },
    line_items: [
      {
        title: "Produto Teste Webhook",
        price: "39.99",
        quantity: 2
      },
      {
        title: "Produto Secundário",
        price: "15.50", 
        quantity: 1
      }
    ]
  };

  try {
    console.log('📦 Enviando ordem teste:', testOrder.name);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/create',
        'X-Shopify-Shop-Domain': 'minha-loja-teste.myshopify.com'
      },
      body: JSON.stringify(testOrder)
    });

    const responseText = await response.text();
    
    console.log('\n📊 Resultado do teste:');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCESSO! Webhook funcionando!');
      console.log('🎯 Agora verifique no Supabase se a venda apareceu na tabela vendas');
    } else {
      console.log('\n❌ ERRO! Webhook com problema');
      console.log('🔍 Verifique os logs no Netlify e as variáveis de ambiente');
    }

  } catch (error) {
    console.error('\n💥 ERRO de conexão:');
    console.error('Mensagem:', error.message);
    console.log('\n🔍 Verificações:');
    console.log('1. URL do webhook está correta?');
    console.log('2. Função está deployada no Netlify?');
    console.log('3. Site está online?');
  }
};

// Executar o teste
testWebhook();
