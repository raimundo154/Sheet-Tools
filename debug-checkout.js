// Script de debug para testar checkout localmente
// Execute no browser console na página de subscription

async function debugCheckout() {
  console.log('🔍 INICIANDO DEBUG DO CHECKOUT...');
  
  // 1. Verificar user
  const user = authService.getCurrentUser();
  console.log('👤 User:', user);
  
  if (!user) {
    console.error('❌ User não autenticado');
    return;
  }
  
  // 2. Verificar subscription atual
  const subscription = await subscriptionService.getUserActiveSubscription();
  console.log('📊 Subscription atual:', subscription);
  
  // 3. Testar URL da função diretamente
  const functionsBase = subscriptionService.getFunctionsBaseUrl();
  const url = functionsBase
    ? `${functionsBase}/.netlify/functions/create-checkout-session`
    : '/.netlify/functions/create-checkout-session';
    
  console.log('🌐 URL da função:', url);
  
  // 4. Testar se função existe
  try {
    const testResponse = await fetch(url, {
      method: 'OPTIONS'
    });
    console.log('✅ Função existe - Status:', testResponse.status);
  } catch (error) {
    console.error('❌ Erro ao testar função:', error);
  }
  
  // 5. Testar request completo
  const testData = {
    planId: 'f1e2d3c4-b5a6-4d7e-8f9a-b0c1d2e3f4a5',
    stripePriceId: 'price_1RxSxHEEfx7nXgXb7s4vVEVK',
    successUrl: 'https://sheet-tools.com/dashboard?subscription=success',
    cancelUrl: 'https://sheet-tools.com/subscription?subscription=cancelled',
    customerEmail: user.email,
    userId: user.id
  };
  
  console.log('📤 Dados do teste:', testData);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getCurrentSession()?.access_token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response data:', data);
    } else {
      const errorData = await response.json();
      console.error('❌ Error data:', errorData);
    }
  } catch (error) {
    console.error('❌ Erro no request:', error);
  }
}

// Execute no console:
// debugCheckout()

console.log('🔧 Debug script carregado. Execute: debugCheckout()');
