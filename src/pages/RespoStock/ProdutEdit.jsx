import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';
import api from '../../api/axios'; // Ajuste le chemin
import { toast } from 'react-toastify';
import CancelModal from '../../components/Modals/CancelModal'; // Ajuste le chemin

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('products-list');
  const [loading, setLoading] = useState(true);

  // État pour les données dynamiques
  const [families, setFamilies] = useState([]);
  const [subFamilies, setSubFamilies] = useState([]);
  const [tvas, setTvas] = useState([]);
  const [formData, setFormData] = useState({
    reference: '',
    name: '',
    sous_famille_produit_id: '',
    tva_id: '',
    stock_min: ''
  });

  // État pour la modale de confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Charger les données dynamiques et le produit
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [familiesResp, subFamiliesResp, tvasResp, productResp] = await Promise.all([
          api.get('/familles'),
          api.get('/sous-familles'),
          api.get('/tvas'),
          api.get(`/products/${id}`)
        ]);
        setFamilies(familiesResp.data || []);
        setSubFamilies(subFamiliesResp.data || []);
        setTvas(tvasResp.data || []);

        // Accéder à data.data car la réponse est { status, data }
        const product = productResp.data.data; // Correction ici
        if (product) {
          setFormData({
            reference: product.reference || '',
            name: product.name || '',
            sous_famille_produit_id: product.sous_famille_produit_id || '',
            tva_id: product.tva_id || '',
            stock_min: product.stock_min || ''
          });
        } else {
          throw new Error('Produit non trouvé');
        }
      } catch (err) {
        toast.error('Erreur lors du chargement des données : ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Gestion des changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubFamilyChange = (e) => {
    setFormData(prev => ({ ...prev, sous_famille_produit_id: e.target.value }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sous_famille_produit_id || !formData.tva_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/products/${id}`, {
        name: formData.name,
        reference: formData.reference,
        stock_min: parseInt(formData.stock_min) || 0,
        tva_id: parseInt(formData.tva_id),
        sous_famille_produit_id: parseInt(formData.sous_famille_produit_id)
      });
      toast.success('Produit mis à jour avec succès');
      navigate('/stock-manager/products/list');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour : ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'annulation avec modale
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate('/stock-manager/products/list');
  };

  const cancelModal = () => {
    setShowCancelModal(false);
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
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/stock-manager/products/list')}
                  className="mr-4 p-2 rounded-full hover:bg-green-700 transition"
                  disabled={loading}
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Modification du produit</h2>
                  <p className="text-green-100">Modifiez les informations du produit</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence *</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-famille *</label>
                  <select
                    name="sous_famille_produit_id"
                    value={formData.sous_famille_produit_id}
                    onChange={handleSubFamilyChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner une sous-famille</option>
                    {subFamilies.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.nom} ({sub.famille?.nom || 'Sans famille'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%) *</label>
                  <select
                    name="tva_id"
                    value={formData.tva_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner TVA</option>
                    {tvas.map(tva => (
                      <option key={tva.id} value={tva.id}>{tva.taux}%</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock minimum pour alerte</label>
                  <input
                    type="number"
                    name="stock_min"
                    value={formData.stock_min}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                  disabled={loading}
                >
                  <FaSave className="mr-2" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={cancelModal}
        onConfirm={confirmCancel}
      />
    </div>
  );
};

export default ProductEdit;