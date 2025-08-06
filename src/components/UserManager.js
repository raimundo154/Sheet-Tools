import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import facebookOAuth from '../services/facebookOAuth';

const UserManager = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('facebook_users') || '[]';
    const usersList = JSON.parse(savedUsers);
    setUsers(usersList);
    
    // Verificar se há usuário atual
    const currentAuth = facebookOAuth.getAuthData();
    if (currentAuth) {
      setCurrentUser(currentAuth);
    }
  };

  const saveUsers = (usersList) => {
    localStorage.setItem('facebook_users', JSON.stringify(usersList));
    setUsers(usersList);
  };

  const handleAddUser = async () => {
    try {
      // Fazer login OAuth
      const authResult = await facebookOAuth.openLoginPopup();
      const userAccounts = await facebookOAuth.getUserAdAccounts(authResult.access_token);
      
      if (userAccounts.length === 0) {
        throw new Error('Nenhuma conta de anúncios encontrada');
      }
      
      // Se múltiplas contas, deixar usuário escolher
      // Por simplicidade, pegar a primeira
      const selectedAccount = userAccounts[0];
      const authInfo = facebookOAuth.saveAuthData(authResult, selectedAccount);
      
      // Adicionar à lista de usuários
      const newUser = {
        id: authInfo.userId,
        name: authInfo.accountName,
        accountId: authInfo.adAccountId,
        currency: authInfo.currency,
        addedAt: new Date().toISOString(),
        ...authInfo
      };
      
      const updatedUsers = [...users];
      const existingIndex = updatedUsers.findIndex(u => u.id === newUser.id);
      
      if (existingIndex >= 0) {
        updatedUsers[existingIndex] = newUser;
      } else {
        updatedUsers.push(newUser);
      }
      
      saveUsers(updatedUsers);
      setCurrentUser(authInfo);
      setShowAddUser(false);
      
      if (onUserSelect) {
        onUserSelect(authInfo);
      }
      
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro ao conectar conta: ' + error.message);
    }
  };

  const handleSelectUser = (user) => {
    // Verificar se token ainda é válido
    if (Date.now() > user.expiresAt) {
      alert('Token expirado. Reconecte sua conta.');
      handleRemoveUser(user.id);
      return;
    }
    
    // Salvar como usuário atual
    facebookOAuth.saveAuthData({
      access_token: user.accessToken,
      expires_in: Math.floor((user.expiresAt - Date.now()) / 1000),
      user_id: user.userId
    }, {
      id: user.accountId,
      name: user.accountName,
      currency: user.currency
    });
    
    setCurrentUser(user);
    
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      
      // Se era o usuário atual, limpar
      if (currentUser && currentUser.userId === userId) {
        facebookOAuth.logout();
        setCurrentUser(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const isTokenExpired = (user) => {
    return Date.now() > user.expiresAt;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h2>
            <p className="text-sm text-gray-600">
              Múltiplas contas Facebook Ads conectadas
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddUser(true)}
          className="btn btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Conta
        </button>
      </div>

      {/* Usuário atual */}
      {currentUser && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Conta Ativa</h3>
                <p className="text-sm text-green-700">{currentUser.accountName}</p>
                <p className="text-xs text-green-600">ID: {currentUser.adAccountId}</p>
              </div>
            </div>
            <div className="text-right text-sm text-green-700">
              <p>Expira: {formatDate(currentUser.expiresAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 mb-3">
          Contas Conectadas ({users.length})
        </h3>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhuma conta conectada</p>
            <p className="text-sm">Clique em "Adicionar Conta" para começar</p>
          </div>
        ) : (
          users.map((user) => {
            const expired = isTokenExpired(user);
            const isActive = currentUser && currentUser.userId === user.id;
            
            return (
              <div
                key={user.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isActive 
                    ? 'border-green-300 bg-green-50' 
                    : expired 
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expired ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isActive ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Users className="text-gray-400" size={20} />
                    )}
                    
                    <div>
                      <h4 className="font-medium text-gray-800">{user.accountName}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {user.accountId} • {user.currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Adicionado: {formatDate(user.addedAt)}
                        {expired && <span className="text-red-500 ml-2">• Token Expirado</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isActive && !expired && (
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="btn btn-primary text-sm"
                      >
                        Usar
                      </button>
                    )}
                    
                    {expired && (
                      <button
                        onClick={handleAddUser}
                        className="btn btn-warning text-sm"
                      >
                        Reconectar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="btn btn-danger text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para adicionar usuário */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Conectar Nova Conta</h3>
            <p className="text-gray-600 mb-6">
              Será redirecionado para o Facebook para autorizar o acesso à sua conta de anúncios.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="btn btn-primary"
              >
                Conectar Facebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;