import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaArrowLeft, FaSave, FaTimes, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';
import api from '../../api/axios'; 
import { toast } from 'react-toastify'; 
import CancelModal from '../../components/Modals/CancelModal'; 

const SupplierAdd = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('suppliers');
  const [formData, setFormData] = useState({
    raisonSocial: '',
    email: '',
    adresse: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/fournisseurs', {
        raisonSocial: formData.raisonSocial,
        email: formData.email,
        adresse: formData.adresse,
        telephone: formData.telephone,
      });
      toast.success('Fournisseur ajouté avec succès');
      navigate('/stock-manager/suppliers');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout : ' + (err.response?.data?.message || err.message));
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (formData.raisonSocial || formData.email || formData.adresse || formData.telephone) {
      setShowCancelModal(true);
    } else {
      navigate('/stock-manager/suppliers');
    }
  };

  const confirmCancel = () => {
    navigate('/stock-manager/suppliers');
  };

  const cancelModal = () => {
    setShowCancelModal(false);
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

      {/* Contenu principal */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête avec bouton de retour */}
            <div className="bg-gradient-to-r from-orange-700 to-orange-900 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    onClick={handleBack}
                    className="mr-4 p-2 rounded-full hover:bg-orange-700 transition"
                    disabled={loading}
                  >
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <FaBuilding className="mr-3" /> Ajouter un nouveau fournisseur
                    </h2>
                    <p className="text-orange-100">Enregistrez un nouveau partenaire commercial</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire d'ajout */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaBuilding className="inline mr-2" /> Raison Sociale *
                    </label>
                    <input
                      type="text"
                      name="raisonSocial"
                      value={formData.raisonSocial}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                      placeholder="Nom complet de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaEnvelope className="inline mr-2" /> Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                      placeholder="email@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline mr-2" /> Adresse
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Adresse du fournisseur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaPhone className="inline mr-2" /> Téléphone *
                    </label>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center"
                    disabled={loading}
                  >
                    <FaArrowLeft className="mr-2" /> Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition flex items-center"
                    disabled={loading}
                  >
                    <FaSave className="mr-2" /> Enregistrer
                  </button>
                </div>
              </form>
            </div>
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

export default SupplierAdd;