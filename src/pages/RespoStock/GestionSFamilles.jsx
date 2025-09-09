import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import api from '../../api/axios'; 
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';

const GestionSFamilles = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('subfamilies');
  const [subFamilies, setSubFamilies] = useState([]);
  const [families, setFamilies] = useState([]); 
  const [filteredSubFamilies, setFilteredSubFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Filtre par nom de sous-famille
  const [familySearchTerm, setFamilySearchTerm] = useState(''); // Filtre par nom de famille
  const [selectedFamilyId, setSelectedFamilyId] = useState(''); // ID de la famille sélectionnée (dérivé de familySearchTerm)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubFamily, setCurrentSubFamily] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '', famille_produit_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subFamilyToDelete, setSubFamilyToDelete] = useState(null);

  // Charger les familles et sous-familles
  useEffect(() => {
    fetchFamilies();
    fetchSubFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const response = await api.get('/familles/search', { params: { nom: familySearchTerm } });
      setFamilies(response.data || []);
      // Mettre à jour selectedFamilyId si une seule famille correspond
      if (response.data.length === 1) {
        setSelectedFamilyId(response.data[0].id);
      } else {
        setSelectedFamilyId(''); // Réinitialiser si plusieurs ou aucune famille
      }
    } catch (err) {
      console.error('Erreur lors du chargement des familles', err);
      toast.error('Erreur lors du chargement des familles');
    }
  };

  const fetchSubFamilies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sous-familles');
      const subFamilyData = response.data; 
      setSubFamilies(subFamilyData || []);
      setFilteredSubFamilies(subFamilyData || []);
    } catch (err) {
      setError('Erreur lors du chargement des sous-familles');
      console.error(err.response?.data || err.message);
      toast.error('Erreur lors du chargement des sous-familles');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les sous-familles en fonction de la recherche et de la famille sélectionnée
  useEffect(() => {
    const searchSubFamilies = async () => {
      try {
        const params = {};
        if (searchTerm) params.nom = searchTerm;
        if (selectedFamilyId) params.famille_id = selectedFamilyId;

        const response = await api.get('/sous-familles/search', { params });
        setFilteredSubFamilies(response.data || []);
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error(err.response?.data || err.message);
        toast.error('Erreur lors de la recherche');
      }
    };
    searchSubFamilies();
  }, [searchTerm, selectedFamilyId]);

  // Mettre à jour la liste des familles lors de la recherche
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFamilies();
    }, 300); // Débouncer de 300ms pour éviter trop de requêtes
    return () => clearTimeout(debounce);
  }, [familySearchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setCurrentSubFamily(null);
    setFormData({
      nom: '',
      description: '',
      famille_produit_id: families.length > 0 ? families[0].id : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (subFamily) => {
    setCurrentSubFamily(subFamily);
    setFormData({
      nom: subFamily.nom,
      description: subFamily.description,
      famille_produit_id: subFamily.famille_produit_id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentSubFamily) {
        await api.put(`/sous-familles/${currentSubFamily.id}`, formData);
        await fetchSubFamilies();
        toast.success('Sous-famille mise à jour avec succès');
      } else {
        const response = await api.post('/sous-familles', formData);
        const newSubFamily = response.data; 
        setSubFamilies([...subFamilies, newSubFamily]);
        await fetchSubFamilies();
        toast.success('Sous-famille ajoutée avec succès');
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

  const openDeleteModal = (id) => {
    setSubFamilyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSubFamilyToDelete(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!subFamilyToDelete) return;
    try {
      setLoading(true);
      await api.delete(`/sous-familles/${subFamilyToDelete}`);
      setSubFamilies(subFamilies.filter(subFamily => subFamily.id !== subFamilyToDelete));
      toast.success('Sous-famille supprimée avec succès');
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
      <RespoSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gestion des Sous-Familles</h2>
              <button
                onClick={openAddModal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={loading}
              >
                <FaPlus className="mr-2" /> Ajouter une sous-famille
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Recherche par nom de sous-famille */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom de sous-famille ..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Recherche par nom de famille */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom de famille ..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={familySearchTerm}
                  onChange={(e) => setFamilySearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Nom</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Famille</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></div>
                          Chargement en cours...
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubFamilies.length > 0 ? (
                    filteredSubFamilies.map(subFamily => (
                      <tr key={subFamily.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{subFamily.nom}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {subFamily.description || <span className="text-gray-400">Aucune description</span>}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{subFamily.famille?.nom || 'Inconnue'}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(subFamily)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(subFamily.id)}
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
                      <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                        Aucune sous-famille trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {currentSubFamily ? 'Modifier la sous-famille' : 'Ajouter une nouvelle sous-famille'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom de la sous-famille *</label>
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
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Famille associée *</label>
                <select
                  name="famille_produit_id"
                  value={formData.famille_produit_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                >
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>{family.nom}</option>
                  ))}
                </select>
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
                  {currentSubFamily ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
        loading={loading}
        itemName={currentSubFamily?.nom || 'cette sous-famille'}
      />
    </div>
  );
};

export default GestionSFamilles;