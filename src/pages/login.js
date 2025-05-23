import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Eye, EyeOff, User, Mail, Building, Lock, AlertCircle, Loader } from 'lucide-react';
import { loginCliente } from '@/lib/api';
import { auth } from '@/lib/auth';
import { formatters, validators } from '@/lib/utils';

export default function Login() {
  const router = useRouter();
  
  // Estados do formulário de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    cnpj: '',
    senha: ''
  });
  
  // Estados do formulário de primeiro acesso
  const [primeiroAcessoForm, setPrimeiroAcessoForm] = useState({
    nomeEmpresa: '',
    cnpj: '',
    nomeContato: '',
    telefone: '',
    email: '',
    observacoes: ''
  });
  
  // Estados de controle
  const [showPassword, setShowPassword] = useState(false);
  const [showPrimeiroAcesso, setShowPrimeiroAcesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar se já está logado
  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Função de login
  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Validações básicas
      if (!loginForm.email || !loginForm.cnpj || !loginForm.senha) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Validar formato do email
      if (!validators.email(loginForm.email)) {
        throw new Error('Email inválido');
      }

      // Validar CNPJ
      if (!validators.cnpj(loginForm.cnpj)) {
        throw new Error('CNPJ inválido');
      }

      // Chamar API de login
      const result = await loginCliente(
        loginForm.email, 
        loginForm.senha, 
        loginForm.cnpj
      );

      if (result.sucess) {
        // Login bem-sucedido
        const userData = {
          codigo: result.Codigo,
          nome: result.Nome,
          cgc: result.cgc,
          email: result.email
        };

        // Salvar dados do usuário
        auth.login(userData);

        setSuccess(`Bem-vindo(a), ${result.Nome}!`);
        
        // Redirecionar para dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);

      } else {
        throw new Error('CNPJ, email ou senha incorretos');
      }

    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para solicitar primeiro acesso
  const handlePrimeiroAcesso = async () => {
    setLoading(true);
    setError('');

    try {
      // Validações básicas
      const requiredFields = ['nomeEmpresa', 'cnpj', 'nomeContato', 'telefone', 'email'];
      for (let field of requiredFields) {
        if (!primeiroAcessoForm[field]) {
          throw new Error('Todos os campos obrigatórios devem ser preenchidos');
        }
      }

      // Validar email
      if (!validators.email(primeiroAcessoForm.email)) {
        throw new Error('Email inválido');
      }

      // Validar CNPJ
      if (!validators.cnpj(primeiroAcessoForm.cnpj)) {
        throw new Error('CNPJ inválido');
      }

      // Validar telefone
      if (!validators.telefone(primeiroAcessoForm.telefone)) {
        throw new Error('Telefone inválido');
      }

      // Simular envio (implementar API quando disponível)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Solicitação enviada com sucesso! Entraremos em contato em até 24 horas.');
      setPrimeiroAcessoForm({
        nomeEmpresa: '',
        cnpj: '',
        nomeContato: '',
        telefone: '',
        email: '',
        observacoes: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campos do login
  const updateLoginForm = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cnpj') {
      formattedValue = formatters.cnpj(value);
    }
    
    setLoginForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Atualizar campos do primeiro acesso
  const updatePrimeiroAcessoForm = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cnpj') {
      formattedValue = formatters.cnpj(value);
    } else if (field === 'telefone') {
      formattedValue = formatters.telefone(value);
    }
    
    setPrimeiroAcessoForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Função para simular submit com Enter
  const handleKeyPress = (e, submitFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitFunction();
    }
  };

  return (
    <>
      <Head>
        <title>Login - Portal do Cliente MVK</title>
        <meta name="description" content="Faça login no Portal do Cliente MVK" />
      </Head>

      <div className="min-h-screen gradient-mvk-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/logomvklogin.png"
                alt="Logo MVK"
                width={180}
                height={80}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-mvk-900 mb-2">Portal do Cliente</h1>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {!showPrimeiroAcesso ? (
            /* Formulário de Login */
            <div className="bg-white rounded-xl shadow-lg p-8 border border-mvk-100">
              <h2 className="text-1xl font-semibold text-mvk-900 mb-6 text-center">Entrar</h2>
              
              <div className="space-y-5">
                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-mvk-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm('email', e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="form-input-with-icon"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Campo CNPJ */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    CNPJ *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-mvk-400" />
                    <input
                      type="text"
                      value={loginForm.cnpj}
                      onChange={(e) => updateLoginForm('cnpj', e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="form-input-with-icon"
                      placeholder="00.000.000/0000-00"
                      maxLength="18"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-mvk-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.senha}
                      onChange={(e) => updateLoginForm('senha', e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 transition-colors"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-mvk-400 hover:text-mvk-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Botão de Login */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>

              {/* Link Primeiro Acesso */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowPrimeiroAcesso(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-mvk-600 hover:text-mvk-800 text-sm font-medium hover:underline transition-colors"
                >
                  Primeiro acesso? Clique aqui e solicite seu usuário e senha
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Primeiro Acesso */
            <div className="bg-white rounded-xl shadow-lg p-8 border border-mvk-100">
              <h2 className="text-2xl font-semibold text-mvk-900 mb-6 text-center">Solicitar Acesso</h2>
              
              <div className="space-y-5">
                {/* Nome da Empresa */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={primeiroAcessoForm.nomeEmpresa}
                    onChange={(e) => updatePrimeiroAcessoForm('nomeEmpresa', e.target.value)}
                    className="form-input"
                    placeholder="Razão social da empresa"
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={primeiroAcessoForm.cnpj}
                    onChange={(e) => updatePrimeiroAcessoForm('cnpj', e.target.value)}
                    className="form-input"
                    placeholder="00.000.000/0000-00"
                    maxLength="18"
                  />
                </div>

                {/* Nome do Contato */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    value={primeiroAcessoForm.nomeContato}
                    onChange={(e) => updatePrimeiroAcessoForm('nomeContato', e.target.value)}
                    className="form-input"
                    placeholder="Nome completo do responsável"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={primeiroAcessoForm.telefone}
                    onChange={(e) => updatePrimeiroAcessoForm('telefone', e.target.value)}
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={primeiroAcessoForm.email}
                    onChange={(e) => updatePrimeiroAcessoForm('email', e.target.value)}
                    className="form-input"
                    placeholder="contato@empresa.com"
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-mvk-800 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={primeiroAcessoForm.observacoes}
                    onChange={(e) => updatePrimeiroAcessoForm('observacoes', e.target.value)}
                    className="form-input"
                    placeholder="Informações adicionais (opcional)"
                    rows="3"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPrimeiroAcesso(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="btn-secondary"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handlePrimeiroAcesso}
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Solicitar Acesso'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-mvk-600">
            <p>© 2024 Portal do Cliente MVK. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </>
  );
}