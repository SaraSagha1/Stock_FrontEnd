// pages/StockManager/StockManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaSync, FaListUl, FaWarehouse,
  FaUndo, FaTimes, FaExclamationTriangle, FaDatabase,
  FaServer, FaCheckCircle, FaLock, FaSignInAlt,
  FaSpinner, FaExclamationCircle, FaFileExport // Ajout de FaFileExport
} from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';

const StockManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('stock-status');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [exportLoading, setExportLoading] = useState(false); // État pour le chargement de l'export
  
  const [stock, setStock] = useState([]);
  const [filters, setFilters] = useState({ 
    produit: '', 
    qteMin: '', 
    qteMax: '' 
  });
  const [filteredStock, setFilteredStock] = useState([]);

  // Récupérer le token d'authentification depuis différents storage
  const getAuthToken = () => {
    // LocalStorage
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;
    
    // SessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) return sessionToken;
    
    // Cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    return cookieToken || null;
  };

  // Vérifier l'authentification
  const checkAuthentication = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      // Tester le token avec une requête simple
      const testResponse = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (testResponse.ok) {
        setIsAuthenticated(true);
        setDebugInfo('✅ Authentification réussie');
      } else {
        setIsAuthenticated(false);
        setDebugInfo('❌ Token invalide ou expiré');
        // Nettoyer les tokens invalides
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
      }
      
      setAuthChecked(true);
      
    } catch (err) {
      console.error('Erreur vérification auth:', err);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setDebugInfo('❌ Erreur de vérification d\'authentification');
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && authChecked) {
      fetchStock();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [isAuthenticated, authChecked]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = 'http://localhost:8000/api/stockView';
      console.log('🌐 Connexion à:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      console.log('📋 Status:', response.status);
      
      if (response.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Le serveur retourne une réponse non-JSON');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('La réponse API n\'est pas un tableau');
      }
      
      const transformedData = data.map(item => ({
        id: item.id,
        produit_id: item.produit_id,
        qteEntree: item.qteEntree || 0,
        qteSortie: item.qteSortie || 0,
        valeurStock: item.valeurStock || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        produit: item.produit || {
          id: item.produit_id,
          name: 'Produit inconnu',
          reference: 'N/A',
          price: '0.00',
          stock: 0,
          stock_min: 0
        }
      }));
      
      setStock(transformedData);
      setFilteredStock(transformedData);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Erreur fetchStock:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fonction pour exporter le stock
  const handleExportStock = async () => {
    try {
      setExportLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Obtenir l'année actuelle
      const currentYear = new Date().getFullYear();
      
      const exportUrl = `http://localhost:8000/api/stock/export-stock/${currentYear}`;
      
      const response = await fetch(exportUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'export: ${response.status}`);
      }
      
      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport-stock-${currentYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportLoading(false);
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'export:', err);
      setError(`Erreur lors de l'export: ${err.message}`);
      setExportLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleRetry = () => {
    setError(null);
    checkAuthentication();
  };

  const testApiConnection = async () => {
    try {
      setLoading(true);
      const testUrl = 'http://localhost:8000/api/stockView';
      const token = getAuthToken();
      
      let info = `🔍 Test de connexion API:\n`;
      info += `URL: ${testUrl}\n`;
      info += `Token: ${token ? 'Présent' : 'Absent'}\n`;
      
      const response = await fetch(testUrl, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        } : {
          'Accept': 'application/json',
        }
      });
      
      info += `Status: ${response.status}\n`;
      
      if (response.ok) {
        info += `✅ API accessible\n`;
      } else {
        const text = await response.text();
        info += `❌ Erreur: ${text.substring(0, 100)}...\n`;
      }
      
      setDebugInfo(info);
    } catch (testError) {
      setDebugInfo(`❌ Impossible de se connecter: ${testError.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = [...stock];
    
    if (filters.produit) {
      result = result.filter(item => 
        item.produit && item.produit.name && 
        item.produit.name.toLowerCase().includes(filters.produit.toLowerCase())
      );
    }
    
    if (filters.qteMin) {
      const qteMin = parseInt(filters.qteMin);
      result = result.filter(item => (item.qteEntree || 0) >= qteMin);
    }
    
    if (filters.qteMax) {
      const qteMax = parseInt(filters.qteMax);
      result = result.filter(item => (item.qteEntree || 0) <= qteMax);
    }
    
    setFilteredStock(result);
  }, [filters, stock]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ produit: '', qteMin: '', qteMax: '' });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 DH';
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' DH';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const openDetailModal = (item) => {
    setSelectedStock(item);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const calculerStockActuel = (item) => {
    return (item.qteEntree || 0) - (item.qteSortie || 0);
  };

  if (!isAuthenticated && authChecked) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RespoSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
                <div className="text-center mb-6">
                  <FaLock className="text-4xl text-yellow-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentification Requise</h2>
                  <p className="text-gray-600">Vous devez être connecté pour accéder à la gestion du stock.</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <FaSignInAlt className="mr-2" />
                    Se connecter
                  </button>
                  
                  <button
                    onClick={testApiConnection}
                    className="w-full flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    <FaServer className="mr-2" />
                    Tester la connexion API
                  </button>

                  <button
                    onClick={handleRetry}
                    className="w-full flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    <FaSync className="mr-2" />
                    Réessayer
                  </button>
                </div>

                {debugInfo && (
                  <details className="mt-6">
                    <summary className="cursor-pointer font-medium text-gray-700">Détails techniques</summary>
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">{debugInfo}</pre>
                    </div>
                  </details>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">ℹ️ Information</h3>
                  <p className="text-sm text-blue-700">
                    Si vous pensez avoir déjà un compte, vérifiez que vous êtes connecté dans un autre onglet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <RespoSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaExclamationCircle className="mr-2" />
                  <div>
                    <p className="font-bold">Erreur</p>
                    <p>{error}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={fetchStock}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    <FaSync className="mr-1" /> Réessayer
                  </button>
                  <button 
                    onClick={handleLoginRedirect}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <FaSignInAlt className="mr-1" /> Reconnexion
                  </button>
                </div>
              </div>
            </div>
          )}

          {!error && stock.length > 0 && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>✅ Connecté - {stock.length} produits chargés</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                     Etat du Stock
                  </h2>
                  <p className="text-yellow-100">Données en direct depuis la base de données</p>
                </div>
                <div className="flex space-x-3">
                  {/* Bouton d'exportation */}
                  <button
                    onClick={handleExportStock}
                    disabled={exportLoading}
                    className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center font-medium"
                    title="Exporter le stock"
                  >
                    {exportLoading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaFileExport className="mr-2" />
                    )}
                    {exportLoading ? 'Export en cours...' : 'Exporter'}
                  </button>
                  
                  <button
                    onClick={fetchStock}
                    className="flex items-center bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-800 transition"
                    title="Actualiser"
                  >
                    <FaSync className="mr-2" /> Actualiser
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom Produit</label>
                  <input
                    type="text"
                    name="produit"
                    value={filters.produit}
                    onChange={handleFilterChange}
                    placeholder="Filtrer par nom produit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qté Entrée Min</label>
                  <input
                    type="number"
                    name="qteMin"
                    value={filters.qteMin}
                    onChange={handleFilterChange}
                    placeholder="Quantité minimum"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qté Entrée Max</label>
                  <input
                    type="number"
                    name="qteMax"
                    value={filters.qteMax}
                    onChange={handleFilterChange}
                    placeholder="Quantité maximum"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  <FaUndo className="mr-2" />
                  Réinitialiser les filtres
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qté Entrée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qté Sortie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière Modif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredStock.length > 0 ? (
                    filteredStock.map(item => {
                      const stockActuel = calculerStockActuel(item);
                      return (
                        <tr key={item.id} className="hover:bg-blue-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-yellow-700">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.produit?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {item.produit?.reference || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-600 font-medium">
                              {item.qteEntree || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-red-600 font-medium">
                              {item.qteSortie || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            <span className={stockActuel <= 0 ? 'text-red-600' : 'text-green-600'}>
                              {stockActuel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(item.valeurStock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openDetailModal(item)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-100 transition"
                                title="Détails"
                              >
                                <FaListUl />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        {stock.length === 0 ? 'Aucune donnée de stock disponible' : 'Aucun résultat avec les filtres actuels'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isDetailModalOpen && selectedStock && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="text-lg font-bold text-gray-800">
                    Détails du stock #{selectedStock.id}
                  </h3>
                  <button 
                    onClick={closeDetailModal} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Informations générales</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">ID Stock:</span> {selectedStock.id}</p>
                        <p><span className="font-medium">Produit:</span> {selectedStock.produit?.name || 'N/A'}</p>
                        <p><span className="font-medium">Référence:</span> {selectedStock.produit?.reference || 'N/A'}</p>
                         <p><span className="font-medium">Créé le:</span> {formatDate(selectedStock.created_at)}</p>
                        <p><span className="font-medium">Dernière Modif:</span> {formatDate(selectedStock.updated_at)}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Mouvements de stock</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Quantité entrée:</span> {selectedStock.qteEntree || 0}</p>
                        <p><span className="font-medium">Quantité sortie:</span> {selectedStock.qteSortie || 0}</p>
                        <p><span className="font-medium">Stock actuel:</span> 
                          <span className={calculerStockActuel(selectedStock) <= 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {' '}{calculerStockActuel(selectedStock)}
                          </span>
                        </p>
                        <p><span className="font-medium">Valeur stock:</span> {formatCurrency(selectedStock.valeurStock)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeDetailModal}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;