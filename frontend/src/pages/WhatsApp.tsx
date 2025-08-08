import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface WhatsAppConnection {
  id: number;
  sessionId: string;
  name: string;
  phoneNumber?: string;
  profileName?: string;
  status: 'DISCONNECTED' | 'CONNECTING' | 'QR_PENDING' | 'CONNECTED' | 'ERROR';
  qrCode?: string;
  lastSeen?: string;
  createdAt: string;
}

export const WhatsApp: React.FC = () => {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    sessionId: '',
    name: ''
  });
  const [qrCodeDialog, setQrCodeDialog] = useState<{
    show: boolean;
    qrCode?: string;
    sessionId?: string;
  }>({ show: false });

  const API_BASE = 'http://localhost:3000/api';

  // Buscar token do localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fazer requisições autenticadas
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Carregar conexões
  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/whatsapp/connections');
      setConnections(data);
    } catch (error) {
      console.error('Erro ao carregar conexões:', error);
      alert('Erro ao carregar conexões WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conexão
  const createConnection = async () => {
    if (!newConnection.sessionId || !newConnection.name) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await apiCall('/whatsapp/connections', {
        method: 'POST',
        body: JSON.stringify(newConnection),
      });
      
      setNewConnection({ sessionId: '', name: '' });
      setShowCreateForm(false);
      await loadConnections();
    } catch (error) {
      console.error('Erro ao criar conexão:', error);
      alert('Erro ao criar conexão WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Conectar WhatsApp
  const connectWhatsApp = async (sessionId: string) => {
    try {
      setLoading(true);
      const result = await apiCall(`/whatsapp/connections/${sessionId}/connect`, {
        method: 'POST',
      });

      if (result.qrCode) {
        setQrCodeDialog({
          show: true,
          qrCode: result.qrCode,
          sessionId
        });
      }

      await loadConnections();
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      alert('Erro ao conectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Desconectar WhatsApp
  const disconnectWhatsApp = async (sessionId: string) => {
    try {
      setLoading(true);
      await apiCall(`/whatsapp/connections/${sessionId}/disconnect`, {
        method: 'POST',
      });
      await loadConnections();
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      alert('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Deletar conexão
  const deleteConnection = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta conexão?')) {
      return;
    }

    try {
      setLoading(true);
      await apiCall(`/whatsapp/connections/${id}`, {
        method: 'DELETE',
      });
      await loadConnections();
    } catch (error) {
      console.error('Erro ao deletar conexão:', error);
      alert('Erro ao deletar conexão');
    } finally {
      setLoading(false);
    }
  };

  // Carregar conexões ao montar componente
  useEffect(() => {
    loadConnections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'text-green-600 bg-green-100';
      case 'CONNECTING': return 'text-yellow-600 bg-yellow-100';
      case 'QR_PENDING': return 'text-blue-600 bg-blue-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'Conectado';
      case 'CONNECTING': return 'Conectando';
      case 'QR_PENDING': return 'Aguardando QR';
      case 'ERROR': return 'Erro';
      default: return 'Desconectado';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
                <p className="text-gray-600 mt-1">Gerencie suas conexões WhatsApp</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                + Nova Conexão
              </button>
            </div>
          </div>

          {/* Lista de Conexões */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conexões Ativas</h2>
            </div>

            {loading && connections.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando...</p>
              </div>
            ) : connections.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Nenhuma conexão WhatsApp configurada</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-green-600 hover:text-green-700"
                >
                  Criar primeira conexão
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {connections.map((connection) => (
                  <div key={connection.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
                          <p className="text-sm text-gray-500">Sessão: {connection.sessionId}</p>
                          {connection.phoneNumber && (
                            <p className="text-sm text-gray-500">Telefone: {connection.phoneNumber}</p>
                          )}
                          {connection.profileName && (
                            <p className="text-sm text-gray-500">Perfil: {connection.profileName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connection.status)}`}>
                          {getStatusText(connection.status)}
                        </span>

                        <div className="flex space-x-2">
                          {connection.status === 'DISCONNECTED' ? (
                            <button
                              onClick={() => connectWhatsApp(connection.sessionId)}
                              disabled={loading}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              Conectar
                            </button>
                          ) : (
                            <button
                              onClick={() => disconnectWhatsApp(connection.sessionId)}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                              Desconectar
                            </button>
                          )}

                          <button
                            onClick={() => deleteConnection(connection.id)}
                            disabled={loading}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para criar nova conexão */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nova Conexão WhatsApp</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Conexão
                </label>
                <input
                  type="text"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: WhatsApp Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Sessão
                </label>
                <input
                  type="text"
                  value={newConnection.sessionId}
                  onChange={(e) => setNewConnection({ ...newConnection, sessionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: session-001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Identificador único para esta conexão
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={createConnection}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Conexão'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar QR Code */}
      {qrCodeDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <h3 className="text-lg font-semibold mb-4">Conectar WhatsApp</h3>
            <p className="text-gray-600 mb-6">
              Escaneie este QR Code com seu WhatsApp para conectar
            </p>
            
            {qrCodeDialog.qrCode && (
              <div className="flex justify-center mb-6">
                <img
                  src={qrCodeDialog.qrCode}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 border rounded"
                />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setQrCodeDialog({ show: false });
                  loadConnections();
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Fechar
              </button>
              
              <button
                onClick={() => {
                  if (qrCodeDialog.sessionId) {
                    connectWhatsApp(qrCodeDialog.sessionId);
                  }
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Gerar Novo QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
