import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  User, 
  Menu, 
  X, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  MessageCircle, 
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatters } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      auth.logout();
      router.push('/login');
    }
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mvk-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Portal do Cliente MVK</title>
        <meta name="description" content="Dashboard do Portal do Cliente MVK" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Portal MVK</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate">{userData?.nome}</p>
                <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group mt-8"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair</span>
            </button>
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden sm:block relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-900">
                    {userData?.nome?.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6">
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
                  <div className="bg-green-100 p-3 rounded-full">
                    <FileText className="w-6 h-6 text-green-600" />
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
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
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
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-orange-600" />
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                            pedido.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                            'bg-blue-100 text-blue-800'
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
                      <div className={`p-3 rounded-full ${
                        item.color === 'text-blue-600' ? 'bg-blue-100' :
                        item.color === 'text-green-600' ? 'bg-green-100' :
                        item.color === 'text-purple-600' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
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
          </main>
        </div>
      </div>
    </>
  );
}