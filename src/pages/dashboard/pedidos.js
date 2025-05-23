import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Loader,
  AlertCircle,
  X,
  CheckCircle,
  Clock,
  Truck,
  Factory,
  Receipt,
  ExternalLink
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

export default function Pedidos() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  
  // Estados do popup de detalhes
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [detalhesPedido, setDetalhesPedido] = useState(null);
  const [errorDetalhes, setErrorDetalhes] = useState('');
  const [numeroPedidoAtual, setNumeroPedidoAtual] = useState('');

  // Estados do popup de produção
  const [showProducao, setShowProducao] = useState(false);
  const [loadingProducao, setLoadingProducao] = useState(false);
  const [detalhesProducao, setDetalhesProducao] = useState(null);
  const [errorProducao, setErrorProducao] = useState('');
  const [numeroPedidoProducao, setNumeroPedidoProducao] = useState('');

  // Estados para download da NF
  const [loadingNF, setLoadingNF] = useState(false);

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    todosPedidos: true,
    dataInicio: '',
    dataFim: '',
    numeroPedido: '',
    numeroProposta: ''
  });

  useEffect(() => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Carregar dados do usuário
    const user = auth.getUserData();
    setUserData(user);
  }, [router]);

  // Função para formatar data para AAAAMMDD
  const formatDateToAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Função para download da Nota Fiscal
  const baixarNotaFiscal = async (chaveAcesso) => {
    setLoadingNF(true);

    try {
      const requestData = {
        chaveacesso: chaveAcesso
      };

      console.log('Buscando PDF da Nota Fiscal:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCLIPNF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta da API NF:', result);

      if (result.PDF64) {
        // Converter base64 para blob
        const binaryString = atob(result.PDF64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        
        // Criar URL para download
        const url = window.URL.createObjectURL(blob);
        
        // Criar elemento de download
        const link = document.createElement('a');
        link.href = url;
        link.download = `Nota_Fiscal_${chaveAcesso.substring(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Download da NF realizado com sucesso');
      } else {
        throw new Error('PDF não encontrado na resposta da API');
      }

    } catch (err) {
      console.error('Erro ao baixar nota fiscal:', err);
      alert(`Erro ao baixar nota fiscal: ${err.message}`);
    } finally {
      setLoadingNF(false);
    }
  };

  // Função para buscar detalhes da produção
  const buscarDetalhesProducao = async (numeroPedido) => {
    setLoadingProducao(true);
    setErrorProducao('');
    setDetalhesProducao(null);
    setNumeroPedidoProducao(numeroPedido);
    setShowProducao(true);

    try {
      const requestData = {
        Pedido: numeroPedido
      };

      console.log('Buscando detalhes da produção:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCDETPRD', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação: ${response.status}`);
      }

      const result = await response.json();
      console.log('Detalhes da produção:', result);

      if (result.success) {
        setDetalhesProducao(result);
      } else {
        setErrorProducao('Não foi possível carregar os detalhes da produção.');
      }

    } catch (err) {
      console.error('Erro ao buscar detalhes da produção:', err);
      setErrorProducao(`Erro ao buscar detalhes da produção: ${err.message}`);
    } finally {
      setLoadingProducao(false);
    }
  };

  // Função para buscar detalhes do pedido
  const buscarDetalhesPedido = async (numeroPedido) => {
    setLoadingDetalhes(true);
    setErrorDetalhes('');
    setDetalhesPedido(null);
    setNumeroPedidoAtual(numeroPedido); // Salvar o número do pedido atual
    setShowDetalhes(true);

    try {
      const requestData = {
        pedido: numeroPedido
      };

      console.log('Buscando detalhes do pedido:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCLIDPED', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação: ${response.status}`);
      }

      const result = await response.json();
      console.log('Detalhes do pedido:', result);

      setDetalhesPedido(result);

    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
      setErrorDetalhes(`Erro ao buscar detalhes: ${err.message}`);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Função para buscar pedidos na API
  const buscarPedidos = async () => {
    if (!userData?.codigo) {
      setError('Código do cliente não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError('');
    setPedidos([]);

    try {
      // Preparar dados para a API
      const requestData = {
        CodigoCliente: userData.codigo,
        Todos: filtros.todosPedidos ? 'Sim' : 'Nao',
        Datainicio: filtros.todosPedidos ? '' : formatDateToAPI(filtros.dataInicio),
        Datafim: filtros.todosPedidos ? '' : formatDateToAPI(filtros.dataFim),
        Proposta: filtros.todosPedidos ? '' : filtros.numeroProposta,
        Pedido: filtros.todosPedidos ? '' : filtros.numeroPedido
      };

      console.log('Enviando para API:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCLILPED', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta da API:', result);

      if (result.success) {
        setPedidos(result.pedido || []);
        if (result.pedido && result.pedido.length === 0) {
          setError('Nenhum pedido encontrado com os filtros selecionados.');
        }
      } else {
        setError('Nenhum pedido encontrado com os filtros selecionados.');
        setPedidos(result.pedido || []);
      }

    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError(`Erro ao buscar pedidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar filtros
  const updateFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Timeline dos status
  const getTimelineSteps = (status, detalhesPedido) => {
    if (!status || !status[0]) return [];

    const statusData = status[0];
    
    return [
      {
        name: 'Conferido',
        completed: statusData.conferido === 'Sim',
        icon: CheckCircle,
        description: 'Pedido conferido e validado'
      },
      {
        name: 'Produção Iniciada',
        completed: statusData.producaoiniciada === 'Sim',
        icon: Factory,
        description: 'Produção foi iniciada',
        showProducaoLink: statusData.producaoiniciada === 'Sim' && detalhesPedido?.Op === 'OPGERADA'
      },
      {
        name: 'Produção Concluída',
        completed: statusData.Producaoconcluida === 'Sim',
        icon: Package,
        description: 'Produção finalizada'
      },
      {
        name: 'Faturado',
        completed: statusData.faturado === 'Sim',
        icon: Receipt,
        description: 'Pedido faturado'
      },
      {
        name: 'Expedido',
        completed: statusData.expedido === 'Sim',
        icon: Truck,
        description: 'Pedido expedido para entrega'
      }
    ];
  };

  // Função para obter cor da porcentagem
  const getPercentageColor = (percentage) => {
    if (percentage === 100) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Verificar se há erro nos dados retornados
  const hasError = pedidos.some(p => p.Numero === 'pedido nao encontrado');

  return (
    <>
      <Head>
        <title>Pedidos - Portal do Cliente MVK</title>
        <meta name="description" content="Consulte seus pedidos" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-mvk-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
                <p className="text-gray-600">Consulte e acompanhe seus pedidos</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (pedidos.length > 0 && !hasError) {
                  alert('Exportando lista de pedidos...');
                }
              }}
              disabled={pedidos.length === 0 || hasError}
              className="flex items-center gap-2 bg-mvk-600 text-white px-4 py-2 rounded-lg hover:bg-mvk-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Pesquisa</h3>
            
            <div className="space-y-4">
              {/* Toggle Todos os Pedidos */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filtros.todosPedidos}
                      onChange={(e) => updateFiltro('todosPedidos', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      filtros.todosPedidos ? 'bg-mvk-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        filtros.todosPedidos ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                  <span className="ml-3 font-medium text-gray-900">
                    Todos os pedidos
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  (Se ativado, ignora os filtros abaixo)
                </span>
              </div>

              {/* Filtros específicos */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${
                filtros.todosPedidos ? 'opacity-40' : 'opacity-100'
              }`}>
                {/* Data Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => updateFiltro('dataInicio', e.target.value)}
                    disabled={filtros.todosPedidos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Data Fim */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => updateFiltro('dataFim', e.target.value)}
                    disabled={filtros.todosPedidos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Número do Pedido */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Número do Pedido
                  </label>
                  <input
                    type="text"
                    value={filtros.numeroPedido}
                    onChange={(e) => updateFiltro('numeroPedido', e.target.value)}
                    disabled={filtros.todosPedidos}
                    placeholder="Ex: 051054"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Número da Proposta */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Número da Proposta
                  </label>
                  <input
                    type="text"
                    value={filtros.numeroProposta}
                    onChange={(e) => updateFiltro('numeroProposta', e.target.value)}
                    disabled={filtros.todosPedidos}
                    placeholder="Ex: 18479"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Botão Buscar */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={buscarPedidos}
                  disabled={loading}
                  className="flex items-center gap-2 bg-mvk-600 text-white px-6 py-2 rounded-lg hover:bg-mvk-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Resumo estatístico */}
          {pedidos.length > 0 && !hasError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{pedidos.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-mvk-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatters.currency(pedidos.reduce((sum, p) => sum + (p.Valor || 0), 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-mvk-600" />
                </div>
              </div>
            </div>
          )}

          {/* Lista de Pedidos */}
          {pedidos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasError ? 'Resultado da Busca' : `Pedidos Encontrados (${pedidos.length})`}
                </h3>
              </div>

              {hasError ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">
                    Não foram encontrados pedidos com os filtros especificados.
                    Tente ajustar os critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proposta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pedidos.map((pedido, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{pedido.Numero}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{pedido.Proposta}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pedido.Data}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {pedido.Operacao}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pedido.Valor ? formatters.currency(pedido.Valor) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => buscarDetalhesPedido(pedido.Numero)}
                              className="text-mvk-600 hover:text-mvk-900 flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Estado inicial - nenhuma busca realizada */}
          {pedidos.length === 0 && !loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar Pedidos</h3>
              <p className="text-gray-600">
                Configure os filtros acima e clique em "Buscar" para consultar seus pedidos.
              </p>
            </div>
          )}
        </div>

        {/* Popup de Detalhes do Pedido */}
        {showDetalhes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Popup */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Detalhes do Pedido</h2>
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Conteúdo do Popup */}
              <div className="p-6">
                {loadingDetalhes && (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-mvk-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando detalhes do pedido...</p>
                  </div>
                )}

                {errorDetalhes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700">{errorDetalhes}</span>
                  </div>
                )}

                {detalhesPedido && !loadingDetalhes && (
                  <div className="space-y-6">
                    {/* Informações Gerais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Proposta</label>
                          <p className="text-lg font-semibold text-gray-900">{detalhesPedido.proposta}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Tipo de Operação</label>
                          <p className="text-gray-900">{detalhesPedido.tipooperacao}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Transportadora</label>
                          <p className="text-gray-900">{detalhesPedido.transportadora || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Valor Total</label>
                          <p className="text-lg font-semibold text-mvk-600">
                            {formatters.currency(detalhesPedido.totalpedido)}
                          </p>
                        </div>
                        {detalhesPedido.chaveacesso && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Chave de Acesso NFe</label>
                            <p className="text-gray-900 text-xs font-mono break-all mb-2">{detalhesPedido.chaveacesso}</p>
                            {/* Link para download da NF */}
                            <button
                              onClick={() => baixarNotaFiscal(detalhesPedido.chaveacesso)}
                              disabled={loadingNF}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1"
                            >
                              {loadingNF ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Baixando...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Clique aqui para consultar a Nota Fiscal
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link de Montagem */}
                    {detalhesPedido.LinkMontagem && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-800">Link de Montagem Disponível</h4>
                            <a 
                              href={detalhesPedido.LinkMontagem} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Abrir link de montagem
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline de Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Pedido</h3>
                      <div className="space-y-4">
                        {getTimelineSteps(detalhesPedido.status, detalhesPedido).map((step, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              step.completed 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <step.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${
                                  step.completed ? 'text-green-800' : 'text-gray-500'
                                }`}>
                                  {step.name}
                                </h4>
                                {step.completed && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{step.description}</p>
                              
                              {/* Link para detalhes da produção */}
                              {step.showProducaoLink && (
                                <button
                                  onClick={() => buscarDetalhesProducao(numeroPedidoAtual)}
                                  className="mt-2 text-mvk-600 hover:text-mvk-800 text-sm font-medium underline flex items-center gap-1"
                                >
                                  <Factory className="w-4 h-4" />
                                  Clique aqui para detalhar a produção do seu pedido
                                </button>
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              step.completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {step.completed ? 'Concluído' : 'Pendente'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Popup */}
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetalhes(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup de Detalhes da Produção */}
        {showProducao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Popup */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Detalhes da Produção</h2>
                  <p className="text-sm text-gray-600">Pedido: #{numeroPedidoAtual}</p>
                </div>
                <button
                  onClick={() => setShowProducao(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Conteúdo do Popup */}
              <div className="p-6">
                {loadingProducao && (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-mvk-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando detalhes da produção...</p>
                  </div>
                )}

                {errorProducao && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700">{errorProducao}</span>
                  </div>
                )}

                {detalhesProducao && !loadingProducao && (
                  <div className="space-y-6">
                    {/* Resumo da Produção */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Total de Itens</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {detalhesProducao.Produtos ? detalhesProducao.Produtos.length : 0}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Produção Total</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {detalhesProducao.Produtos ? 
                            detalhesProducao.Produtos.reduce((sum, p) => sum + (p.TotalProd || 0), 0) : 0
                          }
                        </p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Pendente</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">
                          {detalhesProducao.Produtos ? 
                            detalhesProducao.Produtos.reduce((sum, p) => sum + (p.TotalPend || 0), 0) : 0
                          }
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Factory className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Progresso Médio</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {detalhesProducao.Produtos && detalhesProducao.Produtos.length > 0 ? 
                            Math.round(detalhesProducao.Produtos.reduce((sum, p) => sum + (p.Procentagem || 0), 0) / detalhesProducao.Produtos.length) : 0
                          }%
                        </p>
                      </div>
                    </div>

                    {/* Lista de Produtos */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos em Produção</h3>
                      
                      {detalhesProducao.Produtos && detalhesProducao.Produtos.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produto
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descrição
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qtd Venda
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ordens
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produzido
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pendente
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progresso
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {detalhesProducao.Produtos.map((produto, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {produto.Item}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {produto.Produto}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      <div className="max-w-xs truncate" title={produto.Descricao}>
                                        {produto.Descricao}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {produto.Qtdvenda} {produto.Unidade}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {produto.TotalOrdens}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                      {produto.TotalProd}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                      {produto.TotalPend}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                          <div 
                                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${produto.Procentagem}%` }}
                                          ></div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPercentageColor(produto.Procentagem)}`}>
                                          {produto.Procentagem}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto em produção</h3>
                          <p className="text-gray-600">Não há produtos sendo produzidos para este pedido.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Popup */}
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowProducao(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}