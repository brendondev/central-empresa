function Rotas() {
  return (
    <div>
      <h2>Gerenciamento de Rotas</h2>
      <p>Sistema de configuração e monitoramento de rotas</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        textAlign: 'left' 
      }}>
        <h3>Funcionalidades do Sistema de Rotas:</h3>
        <ul>
          <li><strong>Configuração Dinâmica</strong> - Adicionar/remover rotas em tempo real</li>
          <li><strong>Monitoramento</strong> - Status e performance das rotas</li>
          <li><strong>Logs</strong> - Histórico de acessos e erros</li>
          <li><strong>Permissões</strong> - Controle de acesso por usuário/grupo</li>
          <li><strong>Rate Limiting</strong> - Controle de taxa de requisições</li>
          <li><strong>Cache</strong> - Configuração de cache por rota</li>
        </ul>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h4>Rotas Atuais do Sistema:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Rota</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Descrição</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>/</td>
                <td style={{ padding: '8px' }}>Página inicial</td>
                <td style={{ padding: '8px', color: 'green' }}>✅ Ativa</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>/chat</td>
                <td style={{ padding: '8px' }}>Sistema de chat</td>
                <td style={{ padding: '8px', color: 'orange' }}>🚧 Em desenvolvimento</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>/docs</td>
                <td style={{ padding: '8px' }}>Documentação</td>
                <td style={{ padding: '8px', color: 'green' }}>✅ Ativa</td>
              </tr>
              <tr>
                <td style={{ padding: '8px' }}>/rotas</td>
                <td style={{ padding: '8px' }}>Gerenciamento de rotas</td>
                <td style={{ padding: '8px', color: 'green' }}>✅ Ativa</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <strong>TODO:</strong>
          <ul>
            <li>Implementar CRUD de rotas dinâmicas</li>
            <li>Adicionar sistema de middleware configurável</li>
            <li>Criar dashboard de monitoramento em tempo real</li>
            <li>Implementar sistema de alertas</li>
            <li>Adicionar testes automatizados para rotas</li>
            <li>Criar backup/restore de configurações</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Rotas
