function NotFound() {
  return (
    <div>
      <h2>Página Não Encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        border: '1px solid #ff6b6b', 
        borderRadius: '8px',
        backgroundColor: '#ffe0e0'
      }}>
        <h3>404 - Not Found</h3>
        <p>Possíveis soluções:</p>
        <ul style={{ textAlign: 'left', marginLeft: '2rem' }}>
          <li>Verifique se a URL está correta</li>
          <li>Volte para a <a href="/">página inicial</a></li>
          <li>Use o menu de navegação acima</li>
          <li>Entre em contato com o suporte se o problema persistir</li>
        </ul>
      </div>
    </div>
  )
}

export default NotFound
