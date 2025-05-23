import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotasFiscais() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState([]);
  const [error, setError] = useState('');
  const [loadingNF, setLoadingNF] = useState({});

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    todos: true,
    dataDe: '',
    dataAte: '',
    numeroNota: ''
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
    if (!dateString || dateString === 'Nota nao encontrada') return '-';
    if (dateString.length !== 8) return dateString;
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  // Função para download da Nota Fiscal
  const baixarNotaFiscal = async (chaveAcesso, index) => {
    setLoadingNF(prev => ({ ...prev, [index]: true }));

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
      setLoadingNF(prev => ({ ...prev, [index]: false }));
    }
  };

  // Função para buscar notas fiscais na API
  const buscarNotas = async () => {
    if (!userData?.codigo) {
      setError('Código do cliente não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError('');
    setNotas([]);

    try {
      // Preparar dados para a API
      const requestData = {
        Todos: filtros.todos ? 'Sim' : 'Nao',
        CodigoCliente: userData.codigo,
        Nota: filtros.todos ? '' : filtros.numeroNota,
        DataDe: filtros.todos ? '' : formatDateToAPI(filtros.dataDe),
        DataAte: filtros.todos ? '' : formatDateToAPI(filtros.dataAte)
      };

      console.log('Enviando para API:', requestData);

      // Preparar headers com Basic Auth
      const authString = btoa('admin:msmvk');
      
      const response = await fetch('https://192.168.0.251:8410/rest/VKPCLILNF', {
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
        setNotas(result.Notas || []);
        if (result.Notas && result.Notas.length === 0) {
          setError('Nenhuma nota fiscal encontrada com os filtros selecionados.');
        }
      } else {
        setError('Nenhuma nota fiscal encontrada com os filtros selecionados.');
        setNotas(result.Notas || []);
      }

    } catch (err) {
      console.error('Erro ao buscar notas fiscais:', err);
      setError(`Erro ao buscar notas fiscais: ${err.message}`);
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

  // Verificar se há erro nos dados retornados
  const hasError = notas.some(n => n.Numero === 'Nota nao encontrada');

  // Calcular estatísticas
  const estatisticas = {
    totalNotas: hasError ? 0 : notas.length,
    valorTotal: hasError ? 0 : notas.reduce((sum, n) => sum + (parseFloat(n.ValorNF) || 0), 0)
  };

  return (
    <>
      <Head>
        <title>Notas Fiscais - Portal do Cliente MVK</title>
        <meta name="description" content="Consulte suas notas fiscais" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6 max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais</h1>
                <p className="text-gray-600">Consulte e baixe suas notas fiscais</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (notas.length > 0 && !hasError) {
                  alert('Exportando lista de notas fiscais...');
                }
              }}
              disabled={notas.length === 0 || hasError}
              className="flex items-center gap-2 bg-mvk-600 text-white px-4 py-2 rounded-lg hover:bg-mvk-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
              <div className="flex items-center gap-3 flex-wrap">
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
                    Todas as notas fiscais
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
                {/* Data De */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Data De
                  </label>
                  <input
                    type="date"
                    value={filtros.dataDe}
                    onChange={(e) => updateFiltro('dataDe', e.target.value)}
                    disabled={filtros.todos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Data Até */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Data Até
                  </label>
                  <input
                    type="date"
                    value={filtros.dataAte}
                    onChange={(e) => updateFiltro('dataAte', e.target.value)}
                    disabled={filtros.todos}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>

                {/* Número da Nota Fiscal */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Número da Nota Fiscal
                  </label>
                  <input
                    type="text"
                    value={filtros.numeroNota}
                    onChange={(e) => updateFiltro('numeroNota', e.target.value)}
                    disabled={filtros.todos}
                    placeholder="Ex: 1345798"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Botão Buscar */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={buscarNotas}
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
          {notas.length > 0 && !hasError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Notas</p>
                    <p className="text-2xl font-bold text-gray-900">{estatisticas.totalNotas}</p>
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
            </div>
          )}

          {/* Lista de Notas Fiscais */}
          {notas.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasError ? 'Resultado da Busca' : `Notas Fiscais Encontradas (${notas.length})`}
                </h3>
              </div>

              {hasError ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal encontrada</h3>
                  <p className="text-gray-600">
                    Não foram encontradas notas fiscais com os filtros especificados.
                    Tente ajustar os critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Emissão
                        </th>
                        <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operação
                        </th>
                        <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chave NFe
                        </th>
                        <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notas.map((nota, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap truncate">
                            <div className="text-sm font-medium text-gray-900">#{nota.Numero}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateFromAPI(nota.Emissao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {nota.ValorNF && !isNaN(nota.ValorNF) ? formatters.currency(parseFloat(nota.ValorNF)) : nota.ValorNF}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="truncate" title={nota.Operacao}>
                              {nota.Operacao}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="truncate font-mono text-xs" title={nota.chavenf}>
                              {nota.chavenf}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {nota.chavenf && nota.chavenf !== 'Nota nao encontrada' && (
                              <button 
                                onClick={() => baixarNotaFiscal(nota.chavenf, index)}
                                disabled={loadingNF[index]}
                                className="flex items-center gap-1 text-mvk-600 hover:text-mvk-900 ml-auto bg-mvk-50 px-3 py-1 rounded-lg hover:bg-mvk-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingNF[index] ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Baixando...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    Baixar NF
                                  </>
                                )}
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
          {notas.length === 0 && !loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar Notas Fiscais</h3>
              <p className="text-gray-600">
                Configure os filtros acima e clique em "Buscar" para consultar suas notas fiscais.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}