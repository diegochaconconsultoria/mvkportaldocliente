import '@/styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/auth';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação quando a página carregar
    const checkAuth = () => {
      const isAuthenticated = auth.isAuthenticated();
      const currentPath = router.pathname;
      
      // Páginas que não precisam de autenticação
      const publicPages = ['/', '/login'];
      
      if (!isAuthenticated && !publicPages.includes(currentPath)) {
        // Se não está logado e tentando acessar página protegida
        router.push('/login');
      } else if (isAuthenticated && currentPath === '/login') {
        // Se está logado e tentando acessar login
        router.push('/dashboard');
      }
    };

    // Verificar na primeira carga
    checkAuth();

    // Verificar quando a rota mudar
    router.events.on('routeChangeComplete', checkAuth);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', checkAuth);
    };
  }, [router]);

  // Verificar se a sessão ainda é válida periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.isAuthenticated() && !auth.isSessionValid()) {
        // Sessão expirou
        auth.logout();
        router.push('/login');
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [router]);

  return <Component {...pageProps} />;
}