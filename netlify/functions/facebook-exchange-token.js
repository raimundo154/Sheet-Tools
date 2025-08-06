// Netlify Function para trocar código Facebook por access token
// Esta function mantém o App Secret seguro no servidor

exports.handler = async (event, context) => {
  // Permitir apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',
    'Content-Type': 'application/json'
  };

  try {
    // Parse do body
    const { code, redirect_uri } = JSON.parse(event.body);

    if (!code || !redirect_uri) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Código e redirect_uri são obrigatórios' 
        })
      };
    }

    // Configurações do Facebook
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configurações do Facebook não encontradas' 
        })
      };
    }

    // Trocar código por access token
    const tokenUrl = `https://graph.facebook.com/v23.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
      `client_secret=${appSecret}&` +
      `code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erro na troca do token:', tokenData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao trocar código por token',
          details: tokenData.error?.message || 'Erro desconhecido'
        })
      };
    }

    // Obter informações do usuário
    const userUrl = `https://graph.facebook.com/v23.0/me?access_token=${tokenData.access_token}`;
    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();

    // Obter contas de anúncios
    const accountsUrl = `https://graph.facebook.com/v23.0/me/adaccounts?` +
      `fields=id,name,currency,account_status&` +
      `access_token=${tokenData.access_token}`;
    
    const accountsResponse = await fetch(accountsUrl);
    const accountsData = await accountsResponse.json();

    // Retornar dados completos
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        user_id: userData.id,
        user_name: userData.name,
        accounts: accountsData.data || []
      })
    };

  } catch (error) {
    console.error('Erro na function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    };
  }
};