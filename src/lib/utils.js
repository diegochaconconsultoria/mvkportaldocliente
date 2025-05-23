// Utilitários para formatação
export const formatters = {
  // Formatar CNPJ
  cnpj: (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 14) {
      return cleanValue.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    return value;
  },

  // Formatar CPF
  cpf: (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 11) {
      return cleanValue.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        '$1.$2.$3-$4'
      );
    }
    return value;
  },

  // Formatar telefone
  telefone: (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 10) {
      return cleanValue.replace(
        /^(\d{2})(\d{4})(\d{4})$/,
        '($1) $2-$3'
      );
    } else if (cleanValue.length <= 11) {
      return cleanValue.replace(
        /^(\d{2})(\d{5})(\d{4})$/,
        '($1) $2-$3'
      );
    }
    return value;
  },

  // Formatar moeda (Real)
  currency: (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  },

  // Formatar data
  date: (value, format = 'dd/MM/yyyy') => {
    if (!value) return '';
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) return '';
    
    if (format === 'dd/MM/yyyy') {
      return date.toLocaleDateString('pt-BR');
    } else if (format === 'dd/MM/yyyy HH:mm') {
      return date.toLocaleString('pt-BR');
    }
    
    return date.toLocaleDateString('pt-BR');
  }
};

// Validadores
export const validators = {
  // Validar email
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar CNPJ
  cnpj: (cnpj) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;
    
    // Algoritmo de validação do CNPJ
    let sum = 0;
    let pos = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(cleanCnpj.charAt(12))) return false;
    
    sum = 0;
    pos = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(cleanCnpj.charAt(13));
  },

  // Validar CPF
  cpf: (cpf) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    
    let result = 11 - (sum % 11);
    if (result === 10 || result === 11) result = 0;
    if (result !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    
    result = 11 - (sum % 11);
    if (result === 10 || result === 11) result = 0;
    return result === parseInt(cleanCpf.charAt(10));
  },

  // Validar senha (mínimo 6 caracteres)
  password: (password) => {
    return password && password.length >= 6;
  },

  // Validar telefone
  telefone: (telefone) => {
    const cleanTelefone = telefone.replace(/\D/g, '');
    return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
  }
};

// Utilitários gerais
export const utils = {
  // Remover acentos
  removeAccents: (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  // Capitalizar primeira letra
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Gerar ID único
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce para otimizar performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Verificar se é mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  },

  // Copiar texto para clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      return false;
    }
  },

  // Formatar bytes para tamanho legível
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Aguardar tempo específico
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Truncar texto
  truncate: (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
};

// Classes CSS dinâmicas
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Constantes do projeto
export const constants = {
  STORAGE_KEYS: {
    USER_DATA: 'userData',
    AUTH_TOKEN: 'authToken',
    IS_LOGGED_IN: 'isLoggedIn',
    THEME: 'theme'
  },
  
  API_ENDPOINTS: {
    LOGIN: '/VKPCLILOGIN',
    CLIENTE_DADOS: '/CLIENTE',
    FATURAS: '/FATURAS',
    PEDIDOS: '/PEDIDOS',
    SOLICITAR_ACESSO: '/SOLICITAR_ACESSO'
  },
  
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    FATURAS: '/dashboard/faturas',
    PEDIDOS: '/dashboard/pedidos',
    PERFIL: '/dashboard/perfil'
  },
  
  TIMEOUTS: {
    API_REQUEST: 10000,
    TOAST_DURATION: 5000,
    REDIRECT_DELAY: 1500
  }
};

export default { formatters, validators, utils, classNames, constants };