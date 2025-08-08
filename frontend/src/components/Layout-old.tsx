import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <div className="container">
      <h1>Central Empresa</h1>
      
      <nav className="nav">
        <Link to="/" className={isActive('/')}>
          Home
        </Link>
        <Link to="/chat" className={isActive('/chat')}>
          Chat
        </Link>
        <Link to="/docs" className={isActive('/docs')}>
          Documentação
        </Link>
        <Link to="/rotas" className={isActive('/rotas')}>
          Rotas
        </Link>
      </nav>

      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
