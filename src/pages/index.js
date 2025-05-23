import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  MessageCircle, 
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados mock para demonstração (substituir por dados reais da API)
  const [dashboardData, setDashboardData] = useState({
    pedidosAbertos: 3,
    notasPendentes: 2,
    valorEmAberto: 15750.80,
    ultimaCompra: '2024-05-15',
    pedidosRecentes: [
      { id: '12345', data: '2024-05-20', valor: 2500.00, status: 'Em andamento' },
      { id: '12346', data: '2024-05-18', valor: 1800.50, status: 'Entregue' },
      { id: '12347', data: '2024-05-15', valor: 3200.00, status: 'Processando' }
    ],
    notasRecentes: [
      { numero: 'NF-001234', data: '2024-05-19', valor: 2500.00, status: 'Emitida' },
      { numero: 'NF-001235', data: '2024-05-17', valor: 1800.50, status: 'Enviada' }
    ]
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
    setLoading(false);

    // Aqui você faria a chamada para carregar dados do dashboard da API
    // loadDashboardData(user.codigo);
  }, [router]);

  const menuItems = [
    {
      name: 'Pedidos',
      icon: ShoppingCart,
      href: '/dashboard/pedidos',
      badge: dashboardData.pedidosAbertos,
      color: 'text-mvk-600'
    },
    {
      name: 'Notas Fiscais',
      icon: FileText,
      href: '/dashboard/notas-fiscais',
      badge: dashboardData.notasPendentes,
      color: 'text-mvk-600'
    },
    {
      name: 'Financeiro',
      icon: CreditCard,
      href: '/dashboard/financeiro',
      color: 'text-mvk-600'
    },
    {
      name: 'SAC',
      icon: MessageCircle,
      href: '/dashboard/sac',
      color: 'text-mvk-600'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mvk-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Portal do Cliente MVK</title>
        <meta name="description" content="Dashboard do Portal do Cliente MVK" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo, {userData?.nome?.split(' ')[0]}!
            </h2>
            <p className="text-gray-600">
              Aqui você pode acompanhar seus pedidos, notas fiscais e informações financeiras.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Abertos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.pedidosAbertos}</p>
                </div>
                <div className="bg-mvk-100 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-mvk-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notas Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.notasPendentes}</p>
                </div>
                <div className="bg-mvk-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-mvk-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor em Aberto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatters.currency(dashboardData.valorEmAberto)}
                  </p>
                </div>
                <div className="bg-mvk-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-mvk-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Última Compra</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatters.date(dashboardData.ultimaCompra)}
                  </p>
                </div>
                <div className="bg-mvk-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-mvk-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
                  <Link 
                    href="/dashboard/pedidos"
                    className="text-mvk-600 hover:text-mvk-800 text-sm font-medium"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.pedidosRecentes.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Pedido #{pedido.id}</p>
                        <p className="text-sm text-gray-600">{formatters.date(pedido.data)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatters.currency(pedido.valor)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pedido.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                          pedido.status === 'Em andamento' ? 'bg-mvk-100 text-mvk-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pedido.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notas Fiscais Recentes</h3>
                  <Link 
                    href="/dashboard/notas-fiscais"
                    className="text-mvk-600 hover:text-mvk-800 text-sm font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.notasRecentes.map((nota) => (
                    <div key={nota.numero} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{nota.numero}</p>
                        <p className="text-sm text-gray-600">{formatters.date(nota.data)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatters.currency(nota.valor)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          nota.status === 'Enviada' ? 'bg-green-100 text-green-800' :
                          'bg-mvk-100 text-mvk-800'
                        }`}>
                          {nota.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-mvk-100">
                      <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.name === 'Pedidos' ? 'Consultar pedidos' :
                         item.name === 'Notas Fiscais' ? 'Ver notas fiscais' :
                         item.name === 'Financeiro' ? 'Consultar financeiro' :
                         'Falar com suporte'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}