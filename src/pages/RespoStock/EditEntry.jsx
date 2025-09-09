import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBox, FaTruck, FaHashtag, FaMoneyBillWave, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import CancelModal from '../../components/Modals/CancelModal';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const EntryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('entries');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    numBond: '',
    codeMarche: '',
    date: '',
    fournisseur_id: '',
    produits: [{ produit_id: '', quantite: '', prixUnitaire: '' }],
  });

  // Fetch entry, products, and suppliers on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [entryResponse, productsResponse, suppliersResponse] = await Promise.all([
          api.get(`/entrees/${id}`),
          api.get('/products'),
          api.get('/fournisseurs'),
        ]);
        const entryData = entryResponse.data;
        setEntry(entryData);
        setProducts(productsResponse.data);
        setSuppliers(suppliersResponse.data);
        setFormData({
          numBond: entryData.numBond || '',
          codeMarche: entryData.codeMarche || '',
          date: entryData.date.split('T')[0] || new Date().toISOString().split('T')[0],
          fournisseur_id: entryData.fournisseur_id?.toString() || '',
          produits: entryData.produits?.length > 0
            ? entryData.produits.map(produit => ({
                produit_id: produit.id.toString(),
                quantite: produit.quantite.toString(),
                prixUnitaire: produit.prixUnitaire.toString(),
              }))
            : [{ produit_id: '', quantite: '', prixUnitaire: '' }],
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error('Erreur lors du chargement des données : ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      // Handle product fields
      setFormData(prev => {
        const newProduits = [...prev.produits];
        newProduits[index] = { ...newProduits[index], [name]: value };
        return { ...prev, produits: newProduits };
      });
    } else {
      // Handle main form fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      produits: [...prev.produits, { produit_id: '', quantite: '', prixUnitaire: '' }],
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      produits: prev.produits.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const totalQuantite = formData.produits.reduce((sum, produit) => {
      return sum + (parseInt(produit.quantite) || 0);
    }, 0);

    const totalHT = formData.produits.reduce((sum, produit) => {
      const quantite = parseInt(produit.quantite) || 0;
      const prixUnitaire = parseFloat(produit.prixUnitaire) || 0;
      return sum + (quantite * prixUnitaire);
    }, 0);

    const totalTTC = formData.produits.reduce((sum, produit) => {
      const quantite = parseInt(produit.quantite) || 0;
      const prixUnitaire = parseFloat(produit.prixUnitaire) || 0;
      const selectedProduct = products.find(p => p.id === parseInt(produit.produit_id));
      const tva = selectedProduct?.tva?.taux / 100 || 0;
      return sum + (quantite * prixUnitaire * (1 + tva));
    }, 0);

    return { totalHT, totalTTC, totalQuantite };
  };

  const validateForm = () => {
    if (!formData.numBond || !formData.date || !formData.fournisseur_id) {
      toast.error('Veuillez remplir tous les champs obligatoires (Numéro de bon, Date, Fournisseur)');
      return false;
    }
    if (formData.produits.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return false;
    }
    for (const produit of formData.produits) {
      if (!produit.produit_id || !produit.quantite || !produit.prixUnitaire) {
        toast.error('Veuillez remplir tous les champs pour chaque produit');
        return false;
      }
      if (parseInt(produit.quantite) <= 0 || parseFloat(produit.prixUnitaire) < 0) {
        toast.error('La quantité doit être positive et le prix unitaire ne peut pas être négatif');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        numBond: formData.numBond,
        codeMarche: formData.codeMarche || null,
        date: formData.date,
        fournisseur_id: parseInt(formData.fournisseur_id),
        produits: formData.produits.map(produit => ({
          produit_id: parseInt(produit.produit_id),
          quantite: parseInt(produit.quantite),
          prixUnitaire: parseFloat(produit.prixUnitaire),
        })),
      };

      await api.put(`/entrees/${id}`, payload);
      toast.success('Entrée modifiée avec succès');
      navigate('/stock-manager/stock/entries');
    } catch (err) {
      toast.error('Erreur lors de la modification : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      formData.numBond ||
      formData.codeMarche ||
      formData.fournisseur_id ||
      formData.produits.some(p => p.produit_id || p.quantite || p.prixUnitaire)
    ) {
      setIsCancelModalOpen(true);
    } else {
      navigate('/stock-manager/stock/entries');
    }
  };

  const confirmCancel = () => {
    setIsCancelModalOpen(false);
    navigate('/stock-manager/stock/entries');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' DH';
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RespoSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className={`flex-1 flex justify-center items-center transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/stock-manager/stock/entries')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center mx-auto"
            >
              <FaArrowLeft className="mr-2" /> Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!entry || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RespoSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className={`flex-1 flex justify-center items-center transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <RespoSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex items-center">
                <button
                  onClick={handleCancel}
                  className="mr-4 p-2 rounded-full hover:bg-yellow-700 transition"
                  disabled={loading}
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Modification du bon d'entrée {formData.numBond}</h2>
                  <p className="text-yellow-100">Modifiez les informations de cette entrée</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de bon *</label>
                  <div className="relative">
                    <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="numBond"
                      value={formData.numBond}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                      required
                      placeholder="ENT-2025-XXX"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code marché</label>
                  <div className="relative">
                    <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="codeMarche"
                      value={formData.codeMarche}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                      placeholder="MARCHE-XXX"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'entrée *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
                  <div className="relative">
                    <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="fournisseur_id"
                      value={formData.fournisseur_id}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                      required
                      disabled={loading}
                    >
                      <option value="">Sélectionnez un fournisseur</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.raisonSocial}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700 flex items-center">
                    <FaBox className="mr-2" /> Produits
                  </h3>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                    disabled={loading}
                  >
                    <FaPlus className="mr-2" /> Ajouter un produit
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.produits.map((produit, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                        <div className="relative">
                          <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <select
                            name="produit_id"
                            value={produit.produit_id}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                            required
                            disabled={loading}
                          >
                            <option value="">Sélectionnez un produit</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.reference}) - Stock: {product.stock}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                        <div className="relative">
                          <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="quantite"
                            value={produit.quantite}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                            min="1"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (DH) *</label>
                        <div className="relative">
                          <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="prixUnitaire"
                            value={produit.prixUnitaire}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
                            min="0"
                            step="0.01"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-600 hover:text-red-900 rounded-lg hover:bg-red-100 transition"
                          disabled={loading || formData.produits.length === 1}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              {formData.produits.some(p => p.produit_id && p.quantite && p.prixUnitaire) && (
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <FaMoneyBillWave className="mr-2" /> Résumé
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Quantité Totale</p>
                      <p className="text-xl font-bold">{calculateTotals().totalQuantite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total HT</p>
                      <p className="text-xl font-bold">{formatCurrency(calculateTotals().totalHT)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total TTC</p>
                      <p className="text-xl font-bold text-yellow-600">{formatCurrency(calculateTotals().totalTTC)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center"
                  disabled={loading}
                >
                  <FaArrowLeft className="mr-2" /> Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-500 transition flex items-center"
                  disabled={loading}
                >
                  <FaSave className="mr-2" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        message="Voulez-vous vraiment annuler ? Les modifications ne seront pas enregistrées."
      />
    </div>
  );
};

export default EntryEdit;