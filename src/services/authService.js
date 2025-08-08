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
        return null
      }
      
      if (session) {
        this.session = session
        this.user = session.user
      }
      
      return session
    } catch (error) {
      console.error('Erro ao inicializar auth service:', error)
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
          }
        }
      })

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

  // Enviar magic link por email
  async signInWithMagicLink(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            // Dados adicionais do usuário podem ser incluídos aqui
            source: 'sheet-tools-login'
          }
        }
      })

      if (error) {
        console.error('Erro ao enviar magic link:', error)
        
        // Tratamento específico para erro de servidor de email
        if (error.status === 500 || error.message.includes('Error sending confirmation email')) {
          throw new Error('Serviço de email temporariamente indisponível. Tente fazer login com Google ou entre em contato com o suporte.')
        }
        
        // Tratamento específico para rate limit de email
        if (error.status === 429 || error.message.includes('rate limit exceeded')) {
          throw new Error('Muitas tentativas de envio de email. Aguarde alguns minutos e tente novamente, ou use o login com Google.')
        }
        
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro no signInWithMagicLink:', error)
      
      // Se for erro de rede ou servidor
      if (error.message.includes('Error sending confirmation email') || error.status === 500) {
        throw new Error('Serviço de email temporariamente indisponível. Tente fazer login com Google.')
      }
      
      throw error
    }
  }

  // Verificar código OTP do email
  async verifyOtp(email, token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        console.error('Erro ao verificar OTP:', error)
        throw new Error(error.message)
      }

      if (data.session) {
        this.session = data.session
        this.user = data.user
      }

      return data
    } catch (error) {
      console.error('Erro no verifyOtp:', error)
      throw error
    }
  }

  // Criar usuário com email e senha
  async signUpWithEmail(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            full_name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            source: 'sheet-tools-signup'
          }
        }
      })

      if (error) {
        console.error('Erro no cadastro:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro no signUpWithEmail:', error)
      throw error
    }
  }

  // Login com email e senha
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Erro no login:', error)
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
    }
  }

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

  // Redefinir senha
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getRedirectUrl()}/reset-password`
      })

      if (error) {
        console.error('Erro ao redefinir senha:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro no resetPassword:', error)
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
      }
    })
  }
}

// Exportar instância única (singleton)
export const authService = new AuthService()
export default authService
