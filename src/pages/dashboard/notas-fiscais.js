import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Eye,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotasFiscais() {
  const router = useRouter();
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Dados mock - substituir por API real
  const notasFiscaisMock = [
    {
      numero: 'NF-001234',
      data: '2024-05-19',
      valor: 2500.00,
      status: 'Emitida',
      chaveNfe: '35240512345678000100550010001234561123456789',
      vencimento: '2024-06-19',
      arquivo: 'nf-001234.pdf'
    },
    {
      numero: 'NF-001235',
      data: '2024-05-17',
      valor: 1800.50,
      status: 'Enviada',
      chaveNfe: '35240512345678000100550010001235671234567890',
      vencimento: '2024-06-17',
      arquivo: 'nf-001235.pdf'
    },
    {
      numero: 'NF-001236',
      data: '2024-05-15',
      valor: 3200.00,
      status: 'Processando',
      chaveNfe: '35240512345678000100550010001236781234567891',
      vencimento: '2024-06-15',
      arquivo: null
    },
    {
      numero: 'NF-001237',
      data: '2024-05-12',
      valor: 950.75,
      status: 'Cancelada',
      chaveNfe: '35240512345678000100550010001237891234567892',
      vencimento: '',
      arquivo: null
    },
    {
      numero: 'NF-001238',
      data: '2024-05-10',
      valor: 4100.00,
      status: 'Emitida',
      chaveNfe: '35240512345678000100550010001238901234567893',
      vencimento: '2024-06-10',
      arquivo: 'nf-001238.pdf'
    }
  ];

  useEffect(() => {
    // Verificar autenticação
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Simular carregamento de dados
    setTimeout(() => {
      setNotasFiscais(notasFiscaisMock);
      setLoading(false);
    }, 1000);
  }, [router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Emitida':
        return 'bg-green-100 text-green-800';
      case 'Enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Processando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotas = notasFiscais.filter(nota => {
    const matchesSearch = nota.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || nota.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (arquivo) => {
    // Simular download - implementar com URL real da API
    alert(`Download do arquivo: ${arquivo}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notas fiscais...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Notas Fiscais - Portal do Cliente MVK</title>
        <meta name="description" content="Consulte suas notas fiscais" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais</h1>
                <p className="text-gray-600">Consulte e baixe suas notas fiscais</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Lista
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por número da nota fiscal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="todos">Todos os status</option>
                  <option value="Processando">Processando</option>
                  <option value="Emitida">Emitida</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Notas</p>
                  <p className="text-2xl font-bold text-gray-900">{notasFiscais.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emitidas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notasFiscais.filter(n => n.status === 'Emitida').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processando</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notasFiscais.filter(n => n.status === 'Processando').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatters.currency(notasFiscais.reduce((sum, n) => sum + n.valor, 0))}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Notas Fiscais List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Suas Notas Fiscais ({filteredNotas.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Emissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotas.map((nota) => (
                    <tr key={nota.numero} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{nota.numero}</div>
                          <div className="text-xs text-gray-500 truncate w-32">{nota.chaveNfe}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatters.date(nota.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatters.currency(nota.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(nota.status)}`}>
                          {nota.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nota.vencimento ? formatters.date(nota.vencimento) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                          {nota.arquivo && (
                            <button 
                              onClick={() => handleDownload(nota.arquivo)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredNotas.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal encontrada</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Você ainda não possui notas fiscais cadastradas'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}