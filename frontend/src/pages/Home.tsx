import { useEffect, useState } from 'react'
import axios from 'axios'

interface ApiStatus {
  status: string
  message: string
  timestamp: string
  version: string
}

function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Implementar verificação de status da API
    const checkApiStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const response = await axios.get(`${apiUrl}`)
        setApiStatus(response.data)
      } catch (err) {
        setError('Erro ao conectar com a API')
        console.error('API connection error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkApiStatus()
  }, [])

  return (
    <div>
      <h2>Dashboard Principal</h2>
      <p>Bem-vindo ao sistema Central Empresa!</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Status da API</h3>
        {loading && <p>Verificando conexão com a API...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {apiStatus && (
          <div>
            <p><strong>Status:</strong> {apiStatus.status}</p>
            <p><strong>Mensagem:</strong> {apiStatus.message}</p>
            <p><strong>Versão:</strong> {apiStatus.version}</p>
            <p><strong>Timestamp:</strong> {new Date(apiStatus.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Próximos Passos</h3>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Implementar autenticação de usuários</li>
          <li>Criar módulos de negócio específicos</li>
          <li>Integrar com banco de dados</li>
          <li>Implementar funcionalidades de chat</li>
          <li>Adicionar documentação automática</li>
          <li>Configurar sistema de rotas dinâmicas</li>
        </ul>
      </div>
    </div>
  )
}

export default Home
