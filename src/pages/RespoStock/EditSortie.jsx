import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import axios from 'axios';

const EditExit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('exits');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);

  // Charger les produits et la sortie à modifier depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!token) {
          setError('Token d\'authentification manquant');
          setLoading(false);
          return;
        }

        // Charger les produits
        const productsResponse = await axios.get('http://localhost:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        setProducts(productsResponse.data);

        // Charger la sortie à modifier
        const exitResponse = await axios.get(`http://localhost:8000/api/sorties/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        const exitData = exitResponse.data;
        setFormData({
          id: exitData.id,
          destination: exitData.destination,
          commentaire: exitData.commentaire || '',
          date: exitData.date.split('T')[0],
          produits: exitData.produits.map(produit => ({
            produit_id: produit.id.toString(),
            quantite: produit.pivot.quantite,
          })),
        });
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProduits = [...formData.produits];
    updatedProduits[index] = { ...updatedProduits[index], [field]: value };
    setFormData({ ...formData, produits: updatedProduits });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      produits: [...formData.produits, { produit_id: '', quantite: 1 }],
    });
  };

  const removeProduct = (index) => {
    if (formData.produits.length === 1) {
      setError('Vous devez sélectionner au moins un produit');
      return;
    }
    const updatedProduits = formData.produits.filter((_, i) => i !== index);
    setFormData({ ...formData, produits: updatedProduits });
  };

  const validateProducts = async () => {
    for (const produit of formData.produits) {
      if (!produit.produit_id) {
        setError('Veuillez sélectionner un produit pour chaque entrée');
        return false;
      }
      if (produit.quantite < 1) {
        setError('La quantité doit être supérieure à 0 pour chaque produit');
        return false;
      }
      const selectedProduct = products.find(p => p.id === parseInt(produit.produit_id));
      if (selectedProduct) {
        try {
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
          const oldExitResponse = await axios.get(`http://localhost:8000/api/sorties/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });
          
          const oldProduit = oldExitResponse.data.produits.find(p => p.id === parseInt(produit.produit_id));
          const oldQuantite = oldProduit ? oldProduit.pivot.quantite : 0;
          const quantiteDifference = produit.quantite - oldQuantite;
          
          if (quantiteDifference > 0 && quantiteDifference > selectedProduct.stock) {
            setError(`Quantité insuffisante pour ${selectedProduct.name}. Stock disponible: ${selectedProduct.stock}`);
            return false;
          }
        } catch (err) {
          console.error('Erreur lors de la vérification du stock:', err);
          // Continuer même si on ne peut pas vérifier le stock
        }
      }
    }
    return true;
  };

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

    if (formData.produits.length === 0) {
      setError('Veuillez ajouter au moins un produit');
      setLoading(false);
      return;
    }

    if (!(await validateProducts())) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const sortieData = {
        destination: formData.destination,
        commentaire: formData.commentaire,
        date: formData.date,
        produits: formData.produits.map(p => ({
          produit_id: parseInt(p.produit_id),
          quantite: parseInt(p.quantite),
        })),
      };

      await axios.put(`http://localhost:8000/api/sorties/${id}`, sortieData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      navigate('/stock-manager/stock/exits');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification de la sortie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData) {
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <button
                onClick={() => navigate('/stock-manager/stock/exits')}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <FaArrowLeft className="mr-2" /> Retour à la liste des sorties
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-8">
                <p className="text-gray-600">Aucune donnée à afficher</p>
                <button
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="mt-4 flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mx-auto"
                >
                  <FaArrowLeft className="mr-2" /> Retour à la liste des sorties
                </button>
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="mr-4 p-2 rounded-full hover:bg-yellow-700 transition"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Modifier la sortie #{formData.id}</h2>
                  <p className="text-yellow-100">Modifier les détails de la sortie de produit</p>
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
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Produits *</label>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus className="mr-1" /> Ajouter un produit
                  </button>
                </div>
                {formData.produits.map((produit, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                      <select
                        name="produit_id"
                        required
                        value={produit.produit_id}
                        onChange={(e) => handleProductChange(index, 'produit_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(prod => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({prod.reference}) - Stock: {prod.stock}
                          </option>
                        ))}
                      </select>
                      {produit.produit_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock disponible: {products.find(p => p.id === parseInt(produit.produit_id))?.stock || 0}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        name="quantite"
                        min="1"
                        max={products.find(p => p.id === parseInt(produit.produit_id))?.stock}
                        required
                        value={produit.quantite}
                        onChange={(e) => handleProductChange(index, 'quantite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <FaTrash className="mr-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                 Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Enregistrer les modifications
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

export default EditExit;