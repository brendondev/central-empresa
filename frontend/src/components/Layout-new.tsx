import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Chat', href: '/chat', current: location.pathname === '/chat' },
    { name: 'Documentação', href: '/docs', current: location.pathname === '/docs' },
    { name: 'Rotas', href: '/rotas', current: location.pathname === '/rotas' },
  ];

  // Adicionar item de usuários se for admin
  if (user && user.role.level <= 1) {
    navigation.push({
      name: 'Usuários',
      href: '/users',
      current: location.pathname === '/users'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold">Central Empresa</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        item.current
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {user && (
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="text-white text-sm mr-4">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-indigo-200 ml-2">({user.role.name})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-500 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-400"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <div className="border-t border-indigo-500 pt-4">
                <div className="text-white text-sm px-3 py-2">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-indigo-200 ml-2">({user.role.name})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left bg-indigo-500 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-400"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
