import { supabase, getRedirectUrl } from '../config/supabase'

// Classe para gerenciar autenticação
class AuthService {
  constructor() {
    this.user = null
    this.session = null
  }
  // Inicializar o serviço e verificar sessão existente
  async initialize() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Erro ao obter sessão:', error)
        this.session = null
        this.user = null
        return null
      }      
      
      if (session && session.user) {
        this.session = session
        this.user = session.user
        console.log('Auth service initialized with user:', session.user.email)
      } else {
        this.session = null
        this.user = null
        console.log('No active session found')
      }      
      
      return session
    } catch (error) {
      console.error('Erro ao inicializar auth service:', error)
      this.session = null
      this.user = null
      return null
    }
  }
  // Login com Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }        }      })

      if (error) {
        console.error('Erro no login com Google:', error)
        throw new Error(error.message)
      }
      return data
    } catch (error) {
      console.error('Erro no signInWithGoogle:', error)
      throw error
    }
  }

  // Login com email e senha (usado após criar conta via função serverless)
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Erro no login (email/senha):', error)
        throw new Error(error.message)
      }

      if (data.session) {
        this.session = data.session
        this.user = data.user
      }

      return data
    } catch (error) {
      console.error('Erro no signInWithEmail:', error)
      throw error
    }
  }

  // Criar conta com email via função serverless (evita email de confirmação do Supabase)
  async createAccountWithEmail(email) {
    try {
      // Gerar uma password temporária para cumprir requisitos do Supabase
      const temporaryPassword = this.generateTemporaryPassword()

      const functionsBase = this.getFunctionsBaseUrl()
      const url = functionsBase
        ? `${functionsBase}/.netlify/functions/create-user`
        : '/.netlify/functions/create-user'

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: temporaryPassword })
      })

      // Tentar interpretar a resposta como JSON; caso contrário, fornecer erro claro
      const contentType = response.headers.get('content-type') || ''
      let result
      if (contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const rawText = await response.text()
        throw new Error(
          `Resposta inválida do servidor (esperado JSON). Dica: execute em desenvolvimento com 'npx netlify dev'. Detalhe: ${rawText.substring(0, 120)}...`
        )
      }

      if (!response.ok || !result?.success) {
        const message = result?.error || 'Falha ao criar conta'
        throw new Error(message)
      }

      // Após criar a conta, efetuar login com email e password temporária
      const login = await this.signInWithEmail(email, temporaryPassword)
      return login
    } catch (error) {
      console.error('Erro no createAccountWithEmail:', error)
      throw error
    }
  }

  getFunctionsBaseUrl() {
    // 1) Se variável de ambiente estiver definida, usar
    const fromEnv = (process.env.REACT_APP_FUNCTIONS_BASE_URL || '').trim()
    if (fromEnv) return fromEnv.replace(/\/$/, '')
    // 2) Heurística para dev: se app está no :3000 (CRA), funções provavelmente estão no :8888 (netlify dev)
    try {
      const { hostname, port } = window.location
      if (hostname === 'localhost') {
        if (port === '3000') return 'http://localhost:8888'
        if (port === '8888') return '' // já está no proxy do netlify dev
      }
    } catch (_) {}
    // 3) Produção: deixar vazio para usar o mesmo domínio
    return ''
  }

  // Gerar senha temporária para o Supabase (usuário não precisará dela)
  generateTemporaryPassword() {
    // Gerar senha segura temporária de 16 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro no logout:', error)
        throw new Error(error.message)
      }
      this.session = null
      this.user = null
      
      return true
    } catch (error) {
      console.error('Erro no signOut:', error)
      throw error
    }  }
  // Obter usuário atual
  getCurrentUser() {
    return this.user
  }
  // Obter sessão atual
  getCurrentSession() {
    return this.session
  }
  // Verificar se o usuário está logado
  isAuthenticated() {
    return !!this.session && !!this.user
  }
  // Atualizar perfil do usuário
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        throw new Error(error.message)
      }
      if (data.user) {
        this.user = data.user
      }
      return data
    } catch (error) {
      console.error('Erro no updateProfile:', error)
      throw error
    }
  }

  // Escutar mudanças na autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.session = session
      this.user = session?.user || null
      
      if (callback) {
        callback(event, session)
      }    })
  }}

// Exportar instância única (singleton)
export const authService = new AuthService()
export default authService
