import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaPercent, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';
import api from '../../api/axios'; // Ajuste le chemin
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal'; // Ajuste le chemin

const TVAManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('tva');
  const [loading, setLoading] = useState(true);

  const [tvaList, setTvaList] = useState([]);
  const [filteredTvaList, setFilteredTvaList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTva, setCurrentTva] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tvaToDelete, setTvaToDelete] = useState(null);

  // Charger les données depuis le backend
  useEffect(() => {
    const fetchTvaList = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tvas');
        setTvaList(response.data || []);
        console.log('Données initiales:', response.data); // Débogage
      } catch (err) {
        toast.error('Erreur lors du chargement des TVA : ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchTvaList();
  }, []);

  // Filtrer les TVA en fonction de la recherche avec vérification
  useEffect(() => {
    const filtered = tvaList.filter(tva => {
      const nom = tva.nom || '';
      const taux = tva.taux || '';
      return (
        nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taux.toString().includes(searchTerm)
      );
    });
    setFilteredTvaList(filtered);
  }, [searchTerm, tvaList]);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTVA = () => {
    setCurrentTva(null);
    setFormData({ name: '', rate: '' });
    setIsAddModalOpen(true);
  };

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

  const openEditModal = (tva) => {
    setCurrentTva(tva);
    setFormData({
      name: tva.nom || '',
      rate: tva.taux || '',
    });
    setIsEditModalOpen(true);
  };

  // Opérations CRUD avec le backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentTva) {
        // Mise à jour
        const response = await api.put(`/tvas/${currentTva.id}`, {
          nom: formData.name || currentTva.nom,
          taux: parseFloat(formData.rate) || currentTva.taux,
        });
        console.log('Réponse PUT:', response.data); // Débogage
        if (response.data.tva && response.data.tva.id) {
          setTvaList(tvaList.map(t => t.id === currentTva.id ? response.data.tva : t));
        } else {
          throw new Error('Réponse API invalide');
        }
        toast.success('TVA mise à jour avec succès');
        setIsEditModalOpen(false);
      } else {
        // Ajout
        const response = await api.post('/tvas', {
          nom: formData.name,
          taux: parseFloat(formData.rate),
        });
        console.log('Réponse POST:', response.data); // Débogage
        if (response.data && response.data.id) {
          setTvaList([...tvaList, response.data]);
        } else if (response.data.tva && response.data.tva.id) {
          setTvaList([...tvaList, response.data.tva]);
        } else {
          throw new Error('Réponse API invalide');
        }
        toast.success('TVA ajoutée avec succès');
        setIsAddModalOpen(false);
      }
    } catch (err) {
      toast.error('Erreur lors de la modification : ' + (err.response?.data?.message || err.message || err.message));
      console.error('Erreur détaillée:', err); // Débogage
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    const tva = tvaList.find(t => t.id === id);
    setTvaToDelete(tva);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/tvas/${tvaToDelete.id}`);
      setTvaList(tvaList.filter(tva => tva.id !== tvaToDelete.id));
      toast.success('TVA supprimée avec succès');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error(err.response.data.message || 'Erreur lors de la suppression');
      } else {
        toast.error('Impossible de supprimer cette TVA : elle est utilisée par des produits. Supprimez ou mettez à jour les produits associés d\'abord.');
      }
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTvaToDelete(null);
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
                    <FaPercent className="mr-3" /> Gestion des TVA
                  </h2>
                  <p className="text-green-100">Configurez les taux de TVA applicables</p>
                </div>
                <button
                  onClick={handleAddTVA}
                  className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg flex items-center font-medium"
                  disabled={loading}
                >
                  <FaPlus className="mr-2" /> Nouveau taux
                </button>
              </div>
            </div>

            <div className="p-6 border-b">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou taux..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaPercent className="mr-2" /> Taux
                      </div>
                    </th>
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
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                          <span className="ml-2 text-gray-500">Chargement...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTvaList.length > 0 ? (
                    filteredTvaList.map(tva => (
                      <tr key={tva.id} className="hover:bg-green-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {tva.nom || 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                          {tva.taux ? `${tva.taux}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Créé: {formatDate(tva.created_at) || 'N/A'}</div>
                          <div>Modifié: {formatDate(tva.updated_at) || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(tva)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(tva.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition"
                              title="Supprimer"
                              disabled={loading}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Aucun taux de TVA trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Modifier le taux de TVA</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux (%) *</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  disabled={loading}
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Ajouter un nouveau taux de TVA</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux (%) *</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  disabled={loading}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        loading={loading}
        itemName={tvaToDelete?.nom || 'ce taux de TVA'}
      />
    </div>
  );
};

export default TVAManagement;