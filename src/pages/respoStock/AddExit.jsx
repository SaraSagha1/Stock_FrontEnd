import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import axios from 'axios';

const AddExit = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('exits');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    produit_id: '',
    destination: '',
    commentaire: '',
    quantite: 1,
    date: new Date().toISOString().split('T')[0],
  });

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const response = await axios.get('http://localhost:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        setProducts(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === parseInt(formData.produit_id));
  };

  const selectedProduct = getSelectedProduct();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Valider les données
    if (!formData.destination) {
      setError('La destination est obligatoire');
      setLoading(false);
      return;
    }

    if (!formData.produit_id) {
      setError('Veuillez sélectionner un produit');
      setLoading(false);
      return;
    }

    if (formData.quantite < 1) {
      setError('La quantité doit être supérieure à 0');
      setLoading(false);
      return;
    }

    // Vérifier le stock
    if (selectedProduct && formData.quantite > selectedProduct.stock) {
      setError(`Quantité insuffisante en stock. Stock disponible: ${selectedProduct.stock}`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const sortieData = {
        produit_id: parseInt(formData.produit_id),
        destination: formData.destination,
        commentaire: formData.commentaire,
        quantite: parseInt(formData.quantite),
        date: formData.date,
      };

      await axios.post('http://localhost:8000/api/sorties', sortieData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Redirection après soumission réussie
      navigate('/stock-manager/stock/exits');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la sortie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <RespoSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="mr-4 p-2 rounded-full hover:bg-yellow-700 transition"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Nouvelle sortie de stock</h2>
                  <p className="text-yellow-100">Enregistrer une nouvelle sortie de produit</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mt-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Service ou destination du produit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de sortie *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                  <select
                    name="produit_id"
                    required
                    value={formData.produit_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.reference}) - Stock: {prod.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                  <input
                    type="number"
                    name="quantite"
                    min="1"
                    max={selectedProduct ? selectedProduct.stock : undefined}
                    required
                    value={formData.quantite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  {selectedProduct && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stock disponible: {selectedProduct.stock}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                  <textarea
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Commentaire optionnel"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <FaTimes className="mr-2" /> Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Enregistrer la sortie
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExit;