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
  Lock
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 gradient-mvk">
          <img
            src="/logomvk.png"
            alt="Logo MVK"
            style={{
              width: '1000px',
              height: '55px',
              objectFit: 'contain',
            
              borderRadius: '8px',
              padding: '4px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.style.cssText = 'width: 80px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #9f2441; font-size: 14px;';
              fallback.textContent = 'MVK';
              e.target.parentNode.appendChild(fallback);
            }}
          />

          {/* Botão X só para mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-4 text-white hover:text-mvk-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info - REMOVIDO */}

        {/* Navigation - FIXO com scroll interno se necessário */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2 border-t border-gray-200">
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
          {/* Área de boas-vindas - alinhada com o header da sidebar */}
          <div className="bg-mvk-50 px-6 py-4 border-b border-gray-100 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-mvk-900 leading-tight">
                {userData?.nome}, bem-vindo ao Portal do Cliente MVK
              </h1>
              <p className="text-mvk-700 text-xs mt-1">
                Aqui você pode acompanhar seus pedidos, notas fiscais e informações financeiras.
              </p>
            </div>

            {/* Botão de Perfil */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="bg-mvk-100 w-8 h-8 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-mvk-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Perfil</span>
              </button>

              {/* Menu Dropdown do Perfil */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {/* Overlay para fechar o menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  
                  <div className="relative z-50 p-6">
                    {/* Meus Dados */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Dados</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
                          <p className="text-sm text-gray-900 mt-1">{userData?.nome}</p>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Código do Cliente</label>
                          <p className="text-sm text-gray-900 mt-1">{userData?.codigo}</p>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email de Acesso</label>
                          <p className="text-sm text-gray-900 mt-1">{userData?.email}</p>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</label>
                          <p className="text-sm text-gray-900 mt-1">{userData?.cgc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group">
                        <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                          <Lock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Trocar Senha</span>
                      </button>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="bg-red-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Sair</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de ações - só o menu mobile se necessário */}
          <div className="lg:hidden flex items-center h-12 px-6 bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-mvk-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content - Com padding-top aumentado para mais espaçamento */}
        <main className="pt-24 lg:pt-24 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}