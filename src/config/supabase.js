import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Verificação de segurança para garantir que as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis do Supabase não foram definidas. Verifique o arquivo .env')
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Configurações de redirecionamento
export const getRedirectUrl = () => {
  // Em produção, usar o domínio real
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheet-tools.com/auth/callback'
  }
  // Em desenvolvimento, usar localhost
  return 'http://localhost:3000/auth/callback'
}

export default supabase
