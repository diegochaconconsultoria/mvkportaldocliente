import Cookies from 'js-cookie';

// Chaves para armazenamento
const USER_DATA_KEY = 'userData';
const AUTH_TOKEN_KEY = 'authToken';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

// Funções de autenticação
export const auth = {
  // Fazer login e salvar dados do usuário
  login: (userData) => {
    try {
      // Salvar dados do usuário
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(IS_LOGGED_IN_KEY, 'true');
      
      // Salvar em cookie também (para persistência entre abas)
      Cookies.set(IS_LOGGED_IN_KEY, 'true', { expires: 7 }); // 7 dias
      
      console.log('Login realizado com sucesso:', userData.nome);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error);
      return false;
    }
  },

  // Fazer logout
  logout: () => {
    try {
      // Remover do localStorage
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(IS_LOGGED_IN_KEY);
      
      // Remover cookies
      Cookies.remove(IS_LOGGED_IN_KEY);
      
      console.log('Logout realizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
  },

  // Verificar se está logado
  isAuthenticated: () => {
    try {
      const isLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
      const hasUserData = localStorage.getItem(USER_DATA_KEY) !== null;
      const hasCookie = Cookies.get(IS_LOGGED_IN_KEY) === 'true';
      
      return isLoggedIn && hasUserData && hasCookie;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  },

  // Obter dados do usuário logado
  getUserData: () => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  },

  // Atualizar dados do usuário
  updateUserData: (newData) => {
    try {
      const currentData = auth.getUserData();
      const updatedData = { ...currentData, ...newData };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return false;
    }
  },

  // Verificar se a sessão expirou (implementar quando tiver tokens JWT)
  isSessionValid: () => {
    // Por enquanto, apenas verifica se está autenticado
    // Futuramente, verificar validade do JWT
    return auth.isAuthenticated();
  },

  // Obter token de autenticação (para APIs que precisam)
  getAuthToken: () => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Salvar token de autenticação
  setAuthToken: (token) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      return false;
    }
  }
};

// Hook personalizado para usar a autenticação (para componentes React)
export const useAuth = () => {
  const isAuthenticated = auth.isAuthenticated();
  const userData = auth.getUserData();
  
  return {
    isAuthenticated,
    userData,
    login: auth.login,
    logout: auth.logout,
    updateUserData: auth.updateUserData,
    isSessionValid: auth.isSessionValid
  };
};

// Função para redirecionar baseado no estado de autenticação
export const redirectBasedOnAuth = (router) => {
  const isAuthenticated = auth.isAuthenticated();
  const currentPath = router.pathname;
  
  if (isAuthenticated && currentPath === '/login') {
    // Se está logado e tentando acessar login, redirecionar para dashboard
    router.push('/dashboard');
  } else if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/') {
    // Se não está logado e tentando acessar área protegida, redirecionar para login
    router.push('/login');
  }
};

export default auth;