function Docs() {
  return (
    <div>
      <h2>Documentação</h2>
      <p>Centro de documentação e ajuda do sistema</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        textAlign: 'left' 
      }}>
        <h3>Seções de Documentação:</h3>
        <ul>
          <li><strong>API Documentation</strong> - Documentação automática da API (Swagger)</li>
          <li><strong>Guia do Usuário</strong> - Como usar o sistema</li>
          <li><strong>Guia do Desenvolvedor</strong> - Documentação técnica</li>
          <li><strong>FAQ</strong> - Perguntas frequentes</li>
          <li><strong>Changelog</strong> - Histórico de versões</li>
          <li><strong>Troubleshooting</strong> - Resolução de problemas</li>
        </ul>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
          <strong>Links Úteis:</strong>
          <ul>
            <li><a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer">Swagger API Docs</a></li>
            <li><a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer">NestJS Documentation</a></li>
            <li><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React Documentation</a></li>
            <li><a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite Documentation</a></li>
          </ul>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <strong>TODO:</strong>
          <ul>
            <li>Implementar sistema de busca na documentação</li>
            <li>Adicionar exemplos de código interativos</li>
            <li>Criar tutorial passo-a-passo</li>
            <li>Integrar com sistema de versionamento</li>
            <li>Adicionar comentários e feedback dos usuários</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Docs
