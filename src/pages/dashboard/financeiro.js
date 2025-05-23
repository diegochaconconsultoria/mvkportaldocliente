import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Loader,
  FileText,
  MessageCircle
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

export default function Financeiro() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [titulos, setTitulos] = useState([]);
  const [error, setError] = useState('');

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    todos: true,
    status: 'Todos',
    vencimentoDe: '',
    vencimentoAte: ''
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

  // Função para formatar data da API (AAAAMMDD) para exibição (DD/MM/AAAA)
  const formatDateFromAPI = (dateString) => {
    if (!dateString || dateString === 'Titulos Nao Encontrados') return '-';
    if (dateString.length !== 8) return dateString;
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  // Função para buscar títulos na API
  const buscarTitulos = async () => {
    if (!userData?.codigo) {
      setError('Código do cliente não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError('');
    setTitulos([]);

    try {
      // Preparar dados para a API
      const requestData = {
        Todos: filtros.todos ? 'Sim' : 'Nao',
        CodigoCliente: userData.codigo,
        Status: filtros.todos ? '' : filtros.status,
        DataDe: filtros.todos ? '' : formatDateToAPI(filtros.vencimentoDe),
        DataAte: filtros.todos ? '' : formatDateToAPI(filtros.vencimentoAte)
      };

      console.log('Enviando para API:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCLIDFIN', {
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
        setTitulos(result.Titulos || []);
        if (result.Titulos && result.Titulos.length === 0) {
          setError('Nenhum título encontrado com os filtros selecionados.');
        }
      } else {
        setError('Nenhum título encontrado com os filtros selecionados.');
        setTitulos(result.Titulos || []);
      }

    } catch (err) {
      console.error('Erro ao buscar títulos:', err);
      setError(`Erro ao buscar títulos: ${err.message}`);
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

  // Função para solicitar segunda via via WhatsApp
  const solicitarSegundaVia = (titulo) => {
    const numeroWhatsApp = '5514997782644';
    const dataVencimento = formatDateFromAPI(titulo.Vencimento);
    
    const mensagem = `Ola, Gostaria da segunda via do Boleto do Título ${titulo.NumeroTitulo} Parcela ${titulo.Parcela} Vencimento ${dataVencimento} Nome: ${userData?.nome} CNPJ: ${userData?.cgc} Codigo do Cliente: ${userData?.codigo}`;
    
    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
    
    window.open(urlWhatsApp, '_blank');
  };

  // Verificar se há erro nos dados retornados
  const hasError = titulos.some(t => t.NumeroTitulo === 'Titulos Nao Encontrados');

  // Calcular estatísticas
  const estatisticas = {
    totalTitulos: hasError ? 0 : titulos.length,
    valorTotal: hasError ? 0 : titulos.reduce((sum, t) => sum + (parseFloat(t.Valor) || 0), 0),
    valorPago: hasError ? 0 : titulos.reduce((sum, t) => sum + (parseFloat(t.ValorPago) || 0), 0),
    saldoTotal: hasError ? 0 : titulos.reduce((sum, t) => sum + (parseFloat(t.Saldo) || 0), 0),
    titulosAbertos: hasError ? 0 : titulos.filter(t => parseFloat(t.Saldo) > 0).length,
    titulosPagos: hasError ? 0 : titulos.filter(t => parseFloat(t.Saldo) === 0).length
  };

  return (
    <>
      <Head>
        <title>Financeiro - Portal do Cliente MVK</title>
        <meta name="description" content="Consulte suas informações financeiras" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
                <p className="text-gray-600">Consulte suas informações financeiras e títulos</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (titulos.length > 0 && !hasError) {
                  alert('Exportando dados financeiros...');
                }
              }}
              disabled={titulos.length === 0 || hasError}
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
              {/* Toggle Todos */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filtros.todos}
                      onChange={(e) => updateFiltro('todos', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      filtros.todos ? 'bg-mvk-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        filtros.todos ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                  <span className="ml-3 font-medium text-gray-900">
                    Todos os títulos
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  (Se ativado, ignora os filtros abaixo)
                </span>
              </div>

              {/* Filtros específicos */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${
                filtros.todos ? 'opacity-40' : 'opacity-100'
              }`}>
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Status
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) => updateFiltro('status', e.target.value)}
                    disabled={filtros.todos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Abertos">Abertos</option>
                    <option value="Pagos">Pagos</option>
                  </select>
                </div>

                {/* Vencimento De */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Vencimento De
                  </label>
                  <input
                    type="date"
                    value={filtros.vencimentoDe}
                    onChange={(e) => updateFiltro('vencimentoDe', e.target.value)}
                    disabled={filtros.todos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Vencimento Até */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Vencimento Até
                  </label>
                  <input
                    type="date"
                    value={filtros.vencimentoAte}
                    onChange={(e) => updateFiltro('vencimentoAte', e.target.value)}
                    disabled={filtros.todos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Botão Buscar */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={buscarTitulos}
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

          {/* Estatísticas */}
          {titulos.length > 0 && !hasError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Títulos</p>
                    <p className="text-2xl font-bold text-gray-900">{estatisticas.totalTitulos}</p>
                  </div>
                  <FileText className="w-8 h-8 text-mvk-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatters.currency(estatisticas.valorTotal)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-mvk-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Pago</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatters.currency(estatisticas.valorPago)}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo em Aberto</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatters.currency(estatisticas.saldoTotal)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          )}

          {/* Lista de Títulos */}
          {titulos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasError ? 'Resultado da Busca' : `Títulos Encontrados (${titulos.length})`}
                </h3>
              </div>

              {hasError ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum título encontrado</h3>
                  <p className="text-gray-600">
                    Não foram encontrados títulos com os filtros especificados.
                    Tente ajustar os critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número/Parcela
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emissão
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vencimento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Pago
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saldo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {titulos.map((titulo, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{titulo.NumeroTitulo}</div>
                            <div className="text-sm text-gray-500">Parcela: {titulo.Parcela}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateFromAPI(titulo.Emissao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateFromAPI(titulo.Vencimento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {titulo.Valor && !isNaN(titulo.Valor) ? formatters.currency(parseFloat(titulo.Valor)) : titulo.Valor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {titulo.ValorPago && !isNaN(titulo.ValorPago) ? formatters.currency(parseFloat(titulo.ValorPago)) : titulo.ValorPago}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={`${
                              titulo.Saldo && !isNaN(titulo.Saldo) && parseFloat(titulo.Saldo) > 0 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {titulo.Saldo && !isNaN(titulo.Saldo) ? formatters.currency(parseFloat(titulo.Saldo)) : titulo.Saldo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {titulo.Saldo && !isNaN(titulo.Saldo) && parseFloat(titulo.Saldo) > 0 && (
                              <button 
                                onClick={() => solicitarSegundaVia(titulo)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 ml-auto bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                                title="Solicitar Segunda Via via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Solicitar 2ª Via
                              </button>
                            )}
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
          {titulos.length === 0 && !loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar Títulos Financeiros</h3>
              <p className="text-gray-600">
                Configure os filtros acima e clique em "Buscar" para consultar seus títulos financeiros.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}