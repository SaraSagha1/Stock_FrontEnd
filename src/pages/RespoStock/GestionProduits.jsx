import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaBox, FaLayerGroup, FaTags, FaPercent, FaCalendarAlt } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import api from '../../api/axios'; // Ajuste le chemin
import { toast } from 'react-toastify';

const GestionProduits = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('products-list');
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [subFamilies, setSubFamilies] = useState([]);
  const [tvas, setTvas] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Recherche par nom ou référence
  const [selectedSubFamilyId, setSelectedSubFamilyId] = useState(''); // Filtre par sous-famille
  const [selectedFamilyId, setSelectedFamilyId] = useState(''); // Filtre par famille
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchFamilies(), fetchSubFamilies(), fetchTvas()])
      .catch(err => {
        setError('Erreur lors du chargement des données : ' + (err.response?.data?.error || err.message));
        console.error('Erreur API :', err);
        toast.error('Erreur lors du chargement des données');
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const productData = response.data; // Ajuste si c'est response.data.data
      setProducts(productData || []);
      setFilteredProducts(productData || []);
    } catch (err) {
      throw err; // Propagé au catch global
    }
  };

  const fetchFamilies = async () => {
    const response = await api.get('/familles');
    setFamilies(response.data || []);
  };

  const fetchSubFamilies = async () => {
    const response = await api.get('/sous-familles');
    setSubFamilies(response.data || []);
  };

  const fetchTvas = async () => {
    const response = await api.get('/tvas');
    setTvas(response.data || []);
  };

  // Filtrer les sous-familles en fonction de la famille sélectionnée
  useEffect(() => {
    if (selectedFamilyId) {
      const filteredSubFamilies = subFamilies.filter(subFamily => subFamily.famille_produit_id === parseInt(selectedFamilyId));
      setSelectedSubFamilyId(''); // Réinitialiser la sous-famille sélectionnée
      setSubFamilies(filteredSubFamilies); // Mettre à jour la liste des sous-familles
    } else {
      fetchSubFamilies(); // Recharger toutes les sous-familles si aucune famille n'est sélectionnée
    }
  }, [selectedFamilyId]);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        const params = {};
        if (searchTerm) {
          params.name = searchTerm; 
          params.reference = searchTerm; // Recherche par nom ou référence
        }
        if (selectedSubFamilyId) params.sous_famille_id = selectedSubFamilyId;
        if (selectedFamilyId) params.famille_id = selectedFamilyId;

        const response = await api.get('/products/search', { params });
        const searchData = response.data; // Ajuste si c'est response.data.data
        console.log('Filtered products:', response.data);
        setFilteredProducts(searchData || []);
      } catch (err) {
        setError('Erreur lors de la recherche : ' + (err.response?.data?.error || err.message));
        console.error('Erreur recherche :', err);
        toast.error('Erreur lors de la recherche : ' + (err.response?.data?.error || 'Problème interne'));
      }
    };
    searchProducts();
  }, [searchTerm, selectedSubFamilyId, selectedFamilyId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddProduct = () => {
    navigate('/stock-manager/products/add');
  };

  const openEditModal = (product) => {
    navigate(`/stock-manager/products/edit/${product.id}`);
  };

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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaBox className="mr-3" /> Gestion des Produits
                  </h2>
                  <p className="text-green-100">Gérez l'inventaire de vos produits</p>
                </div>
                <button
                  onClick={handleAddProduct}
                  className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg flex items-center font-medium"
                  disabled={loading}
                >
                  <FaPlus className="mr-2" /> Nouveau produit
                </button>
              </div>
            </div>

            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recherche par nom ou référence */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par produit ou référence .."
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>

                 {/* Filtre par famille */}
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <select
                    value={selectedFamilyId}
                    onChange={(e) => setSelectedFamilyId(e.target.value)}
                     className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  >
                    <option value="">Toutes les familles</option>
                    {families.map(family => (
                      <option key={family.id} value={family.id}>
                        {family.nom}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Filtre par sous-famille */}
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <select
                    value={selectedSubFamilyId}
                    onChange={(e) => setSelectedSubFamilyId(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  >
                    <option value="">Toutes les sous-familles</option>
                    {subFamilies.map(subFamily => (
                      <option key={subFamily.id} value={subFamily.id}>
                        {subFamily.nom}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {error && <p className="text-red-500 p-4">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaLayerGroup className="mr-2" /> Famille/Sous-famille
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaPercent className="mr-2" /> TVA
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" /> Dates
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></div>
                          Chargement en cours...
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-green-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-600 font-medium">
                          {product.reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.sous_famille?.famille?.nom || 'Inconnue'}</div>
                          <div className="text-sm text-gray-500">{product.sous_famille?.nom || 'Inconnue'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.tva?.taux || 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${product.stock < product.stock_min ? 'text-red-600' : 'text-green-600'}`}>
                            {product.stock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Créé: {formatDate(product.created_at || product.createdAt)}</div>
                          <div>Modifié: {formatDate(product.updated_at || product.updatedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Aucun produit trouvé
                    </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionProduits;