import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
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
  Search
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      auth.logout();
      router.push('/login');
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: User,
      href: '/dashboard',
      color: 'text-mvk-600'
    },
    {
      name: 'Pedidos',
      icon: ShoppingCart,
      href: '/dashboard/pedidos',
      color: 'text-mvk-600'
    },
    {
      name: 'Notas Fiscais',
      icon: FileText,
      href: '/dashboard/notas-fiscais',
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

  if (!userData) {
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - FIXA COM CONTEÚDO FIXO */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        {/* Header da Sidebar - FIXO */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 gradient-mvk">
          <div className="flex items-center gap-3">
            <Image
              src="/logomvk.png"
              alt="Logo MVK"
              width={32}
              height={24}
              className="bg-white rounded p-1"
            />
            <span className="font-semibold text-white">Portal MVK</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-mvk-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info - FIXO */}
        <div className="p-6 border-b border-gray-200 bg-mvk-50">
          <div className="flex items-center gap-3">
            <div className="bg-mvk-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-mvk-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-mvk-900 text-sm leading-tight break-words">{userData?.nome}</p>
              <p className="text-xs text-mvk-600 truncate mt-1">{userData?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation - FIXO com scroll interno se necessário */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-mvk-50 text-mvk-700 border-r-2 border-mvk-700' 
                      : 'text-gray-700 hover:bg-mvk-50 hover:text-mvk-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-mvk-700' : item.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group mt-8"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header - FIXO */}
        <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-mvk-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mvk-500 focus:border-mvk-500 w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-mvk-600">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 bg-mvk-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="bg-mvk-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-mvk-600" />
                </div>
                <span className="hidden sm:block font-medium text-gray-900">
                  {userData?.nome?.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Com padding-top para compensar header fixo */}
        <main className="pt-16 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}