import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import StockManagerSidebar from '../../components/respoStock/RespoSidebar';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal'; 

const GestionFamilles = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('products');
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pour le modal de suppression
  const [familyToDelete, setFamilyToDelete] = useState(null); // ID de la famille à supprimer

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/familles');
      const familyData = response.data; 
      setFamilies(familyData || []);
      setFilteredFamilies(familyData || []);
    } catch (err) {
      setError('Erreur lors du chargement des familles');
      console.error(err.response?.data || err.message);
      toast.error('Erreur lors du chargement des familles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchFamilies = async () => {
      if (searchTerm.trim()) { // Ne recherche que si searchTerm n'est pas vide ou ne contient que des espaces
        try {
          const response = await api.get('/familles/search', { params: { nom: searchTerm } });
          const searchData = response.data; 
          setFilteredFamilies(searchData || []);
        } catch (err) {
          setError('Erreur lors de la recherche');
          console.error(err.response?.data || err.message);
          toast.error('Erreur lors de la recherche');
        }
      } else {
        // Réinitialiser à toutes les familles si searchTerm est vide
        setFilteredFamilies(families);
      }
    };
    const debounce = setTimeout(() => {
    searchFamilies();
  }, 300);
  return () => clearTimeout(debounce);
  }, [searchTerm, families]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setCurrentFamily(null);
    setFormData({ nom: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (family) => {
    setCurrentFamily(family);
    setFormData({ nom: family.nom, description: family.description });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentFamily) {
        await api.put(`/familles/${currentFamily.id}`, formData);
        await fetchFamilies();
        toast.success('Famille mise à jour avec succès');
      } else {
        const response = await api.post('/familles', formData);
        const newFamily = response.data; // Ajuste si c'est response.data.data
        setFamilies([...families, newFamily]);
        await fetchFamilies();
        toast.success('Famille ajoutée avec succès');
      }
    } catch (err) {
      setError('Erreur lors de l\'opération');
      console.error(err.response?.data || err.message);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  // Ouvre le modal de suppression
  const openDeleteModal = (id) => {
    setFamilyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Ferme le modal de suppression
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFamilyToDelete(null);
  };

  // Confirme la suppression
  const handleDeleteConfirmed = async () => {
    if (!familyToDelete) return;
    try {
      setLoading(true);
      await api.delete(`/familles/${familyToDelete}`);
      setFamilies(families.filter(family => family.id !== familyToDelete));
      toast.success('Famille supprimée avec succès');
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err.response?.data || err.message);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  const handleDelete = (id) => {
    openDeleteModal(id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StockManagerSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gestion des Familles</h2>
              <button
                onClick={openAddModal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={loading}
              >
                <FaPlus className="mr-2" /> Ajouter une famille
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom de famille..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Nom</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></div>
                          Chargement en cours...
                        </div>
                      </td>
                    </tr>
                  ) : filteredFamilies.length > 0 ? (
                    filteredFamilies.map(family => (
                      <tr key={family.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{family.nom}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {family.description || <span className="text-gray-400">Aucune description</span>}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(family)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(family.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
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
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        Aucune famille trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {currentFamily ? 'Modifier la famille' : 'Ajouter une nouvelle famille'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom de la famille *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  ) : null}
                  {currentFamily ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
        loading={loading}
        itemName={'cette famille'} // Affiche le nom si disponible
      />
    </div>
  );
};

export default GestionFamilles;