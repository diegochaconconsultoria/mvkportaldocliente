import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://192.168.0.251:8410/rest',
  timeout: parseInt(process.env.API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar Basic Auth
const username = process.env.API_USERNAME || 'admin';
const password = process.env.API_PASSWORD || 'msmvk';
const authString = Buffer.from(`${username}:${password}`).toString('base64');

api.defaults.headers.common['Authorization'] = `Basic ${authString}`;

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    console.log('Fazendo requisição para:', config.url);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.status, error.response?.data);
    
    // Tratar erros específicos
    if (error.response?.status === 401) {
      console.error('Erro de autenticação - verificar credenciais');
    } else if (error.response?.status === 404) {
      console.error('Endpoint não encontrado');
    } else if (error.response?.status >= 500) {
      console.error('Erro interno do servidor');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Conexão recusada - servidor indisponível');
    }
    
    return Promise.reject(error);
  }
);

// Função de login
export const loginCliente = async (email, senha, cnpj) => {
  try {
    const response = await api.post('/VKPCLILOGIN', {
      email: email,
      Pass: senha,
      Cgc: cnpj.replace(/\D/g, '') // Remove formatação do CNPJ
    });

    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erro na comunicação com o servidor'
    );
  }
};

// Função para buscar dados do cliente (implementar quando tiver o endpoint)
export const buscarDadosCliente = async (codigo) => {
  try {
    const response = await api.get(`/CLIENTE/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do cliente:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erro ao buscar dados do cliente'
    );
  }
};

// Função para buscar faturas (implementar quando tiver o endpoint)
export const buscarFaturas = async (codigo) => {
  try {
    const response = await api.get(`/FATURAS/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erro ao buscar faturas'
    );
  }
};

// Função para solicitar primeiro acesso (implementar quando tiver o endpoint)
export const solicitarPrimeiroAcesso = async (dadosEmpresa) => {
  try {
    const response = await api.post('/SOLICITAR_ACESSO', dadosEmpresa);
    return response.data;
  } catch (error) {
    console.error('Erro ao solicitar acesso:', error);
    throw new Error(
      error.response?.data?.message || 
      'Erro ao solicitar acesso'
    );
  }
};

// Função para testar conectividade
export const testarConectividade = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Erro de conectividade:', error);
    return false;
  }
};

export default api;