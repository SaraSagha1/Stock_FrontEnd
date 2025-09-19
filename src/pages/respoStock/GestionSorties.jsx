import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt, 
  FaCalendarAlt, FaBoxes , FaSitemap, FaPrint, FaUndo, 
  FaSignOutAlt as FaExit, FaTimes, FaSpinner, FaExclamationCircle,
  FaCheckCircle, FaLock, FaSignInAlt, FaSync, FaServer,
  FaBuilding, FaComment
} from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';

const ExitManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('exits');
  const [selectedExit, setSelectedExit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // États pour les données
  const [exits, setExits] = useState([]);
  const [filteredExits, setFilteredExits] = useState([]);
  const [products, setProducts] = useState([]);

  // Filtres
  const [filters, setFilters] = useState({
    produit: '',
    destination: '',
    date: ''
  });

  // Récupérer le token d'authentification
  const getAuthToken = () => {
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;
    
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) return sessionToken;
    
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
      fetchExits();
      fetchProducts();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [isAuthenticated, authChecked]);

  // Charger les produits depuis l'API
  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error('Erreur lors du chargement des produits');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError(err.message);
    }
  };

  // Charger les sorties depuis l'API
  const fetchExits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = 'http://localhost:8000/api/sorties';
      console.log('🌐 Connexion à:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      console.log('📋 Status:', response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('La réponse API n\'est pas un tableau');
      }
      
      setExits(data);
      setFilteredExits(data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur fetchExits:', err);
      setError(err.message);
      setLoading(false);
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
      const testUrl = 'http://localhost:8000/api/sorties';
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

  // Options uniques pour les filtres
  const productNames = [...new Set(
    exits.flatMap(exit => 
      exit.produits.map(produit => produit.name)
    ).filter(Boolean)
  )];
  
  const destinations = [...new Set(exits.map(exit => exit.destination).filter(Boolean))];

  // Appliquer les filtres
  useEffect(() => {
    let result = [...exits];
    
    if (filters.produit) {
      result = result.filter(exit => 
        exit.produits.some(produit => 
          produit.name.toLowerCase().includes(filters.produit.toLowerCase())
        )
      );
    }
    
    if (filters.destination) {
      result = result.filter(exit => 
        exit.destination && exit.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
        
    if (filters.date) {
      const date = new Date(filters.date);
      result = result.filter(exit => new Date(exit.date) <= date);
    }
    
    setFilteredExits(result);
  }, [filters, exits]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      produit: '',
      destination: '',
      date: ''
    });
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleAddExit = () => {
    navigate('/stock-manager/exits/add');
  };

  const handleEditExit = (id) => {
    navigate(`/stock-manager/exits/edit/${id}`);
  };

  const handleDeleteExit = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:8000/api/sorties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        setExits(exits.filter(exit => exit.id !== id));
        setFilteredExits(filteredExits.filter(exit => exit.id !== id));
        setIsDeleteModalOpen(false);
        setEntryToDelete(null);
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      setError(err.message);
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    }
  };

  const openDeleteModal = (exit) => {
    setEntryToDelete(exit);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const openDetailModal = (exit) => {
    setSelectedExit(exit);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleViewReceipt = (id) => {
    const token = getAuthToken();
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    const newWindow = window.open('', '_blank');
    
    newWindow.document.write(`
      <html>
        <head><title>Chargement du bon de sortie...</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
          <div style="text-align: center;">
            <h2>Chargement du bon de sortie...</h2>
            <p>Veuillez patienter</p>
          </div>
        </body>
      </html>
    `);
    
    fetch(`http://localhost:8000/api/sorties/${id}/bon`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/html',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du bon');
      }
      return response.text();
    })
    .then(html => {
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
    })
    .catch(err => {
      newWindow.document.open();
      newWindow.document.write(`
        <html>
          <head><title>Erreur</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center; color: red;">
              <h2>Erreur lors du chargement du bon</h2>
              <p>${err.message}</p>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      setError('Impossible d\'afficher le bon: ' + err.message);
    });
  };

  const handlePrintReceipt = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`http://localhost:8000/api/sorties/${id}/imprimer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de l\'impression');
      }
    } catch (err) {
      setError('Impossible d\'imprimer le reçu: ' + err.message);
    }
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
                  <p className="text-gray-600">Vous devez être connecté pour accéder à la gestion des sorties.</p>
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
                    onClick={fetchExits}
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
          {!error && exits.length > 0 && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>✅ Connecté - {exits.length} sorties chargées</span>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaExit className="mr-3" /> Gestion des Sorties
                  </h2>
                  <p className="text-yellow-100">Traçabilité des mouvements de stock sortant</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchExits}
                    className="flex items-center bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-800 transition"
                    title="Actualiser"
                  >
                    <FaSync className="mr-2" /> Actualiser
                  </button>
                  <button
                    onClick={handleAddExit}
                    className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center font-medium"
                  >
                    <FaPlus className="mr-2" /> Nouvelle sortie
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <select
                    name="produit"
                    value={filters.produit}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Tous</option>
                    {productNames.map((product, index) => (
                      <option key={index} value={product}>{product}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <select
                    name="destination"
                    value={filters.destination}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Toutes</option>
                    {destinations.map((destination, index) => (
                      <option key={index} value={destination}>{destination}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                       <div className="flex items-center">
                        <FaFileAlt className="mr-2" /> Produits
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaBoxes className="mr-2" />Quantité Totale
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                      <FaBuilding className="mr-2" />
                      Destination
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                      <FaComment className="mr-2" />
                      Commentaire</div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" /> Date
                      </div>
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
                  ) :filteredExits.length > 0 ? (
                    filteredExits.map(exit => (
                      <tr key={exit.id} className="hover:bg-yellow-50 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {exit.produits.length > 0 
                              ? exit.produits.map(p => `${p.name}`)
                              : 'Aucun produit'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exit.produits.reduce((sum, p) => sum + p.pivot.quantite, 0)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            {exit.destination || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center">
                            {exit.commentaire || 'Aucun commentaire'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(exit.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openDetailModal(exit)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-100 transition"
                              title="Détails"
                            >
                              <FaFileAlt />
                            </button>
                            <button
                              onClick={() => handleViewReceipt(exit.id)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                              title="Voir le bon"
                            >
                              <FaSearch />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(exit.id)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-100 transition"
                              title="Imprimer"
                            >
                              <FaPrint />
                            </button>
                            <button
                              onClick={() => handleEditExit(exit.id)}
                              className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-100 transition"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openDeleteModal(exit)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {exits.length === 0 ? 'Aucune sortie enregistrée' : 'Aucune sortie trouvée avec les filtres actuels'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isDetailModalOpen && selectedExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Détails de la sortie #{selectedExit.id}
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
                    <p><span className="font-medium">Créé le:</span> {formatDateTime(selectedExit.created_at)}</p>
                    <p><span className="font-medium">Modifié le:</span> {formatDateTime(selectedExit.updated_at)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Détails des produits</h4>
                  <div className="space-y-2">
                    {selectedExit.produits.length > 0 ? (
                      selectedExit.produits.map(produit => (
                        <p key={produit.id}>
                          <span className="font-medium">{produit.name}:</span> {produit.pivot.quantite} unités
                        </p>
                      ))
                    ) : (
                      <p>Aucun produit associé</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Destination</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FaBuilding className="mr-2 text-gray-400" />
                      <span>{selectedExit.destination || 'Non spécifiée'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Commentaire</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FaComment className="mr-2 text-gray-400" />
                      <span>{selectedExit.commentaire || 'Aucun commentaire'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => handlePrintReceipt(selectedExit.id)}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  <FaPrint className="mr-2" />
                  Imprimer le reçu
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && entryToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteExit(entryToDelete.id)}
          title="Confirmer la suppression"
          message={`Voulez-vous vraiment supprimer la sortie #${entryToDelete.id} ? Cette action est irréversible.`}
        />
      )}
    </div>
  );
};

export default ExitManagement;