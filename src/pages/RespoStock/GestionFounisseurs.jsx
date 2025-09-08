import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBuilding, FaEnvelope, FaPhone, FaTimes,FaMapMarkerAlt } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';
import api from '../../api/axios'; 
import { toast } from 'react-toastify'; 
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal'; 

const SupplierManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('suppliers');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    raisonSocial: '',
    email: '',
    adresse: '',
    telephone: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/fournisseurs');
        setSuppliers(response.data || []);
      } catch (err) {
        toast.error('Erreur lors du chargement des fournisseurs : ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Filtrage des fournisseurs
  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.raisonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.adresse && supplier.adresse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.telephone && supplier.telephone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSupplier = () => {
    navigate('/stock-manager/suppliers/add');
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

  const openEditModal = (supplier) => {
    setCurrentSupplier(supplier);
    setFormData({
      raisonSocial: supplier.raisonSocial || '',
      email: supplier.email || '',
      adresse: supplier.adresse || '',
      telephone: supplier.telephone || '',
    });
    setIsEditModalOpen(true);
  };

  // Opérations CRUD avec l'API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentSupplier) {
        // Mise à jour
        const response = await api.put(`/fournisseurs/${currentSupplier.id}`, {
          raisonSocial: formData.raisonSocial,
          email: formData.email,
          adresse: formData.adresse,
          telephone: formData.telephone,
        });
        setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? response.data.data : s));
        toast.success('Fournisseur mis à jour avec succès');
      } else {
        // Ajout (redirection vers la page dédiée)
        // Géré dans AddSupplier, pas ici
      }
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Erreur lors de la modification : ' + (err.response?.data?.message || err.message));
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/fournisseurs/${supplierToDelete.id}`);
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
      toast.success('Fournisseur supprimé avec succès');
    } catch (err) {
      toast.error('Erreur lors de la suppression : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSupplierToDelete(null);
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
            {/* En-tête */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaBuilding className="mr-3" /> Gestion des Fournisseurs
                  </h2>
                  <p className="text-orange-100">Gérez vos partenaires commerciaux</p>
                </div>
                <button
                  onClick={handleAddSupplier}
                  className="bg-white text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg flex items-center font-medium"
                  disabled={loading}
                >
                  <FaPlus className="mr-2" /> Nouveau fournisseur
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="p-6 border-b">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher fournisseurs, emails, adresses, téléphones..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tableau des fournisseurs */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaBuilding className="mr-2" /> Raison Sociale
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2" /> Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" /> Adresse
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaPhone className="mr-2" /> Téléphone
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">Créé le</div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">Modifié le</div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                          <span className="ml-2 text-gray-500">Chargement...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-orange-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {supplier.raisonSocial || 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                          {supplier.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supplier.adresse || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supplier.telephone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(supplier.created_at) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(supplier.updated_at) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
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
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Aucun fournisseur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour modifier */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Modifier le fournisseur
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison Sociale *</label>
                  <input
                    type="text"
                    name="raisonSocial"
                    value={formData.raisonSocial}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  disabled={loading}
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        loading={loading}
        itemName={supplierToDelete?.raisonSocial || 'ce fournisseur'}
      />
    </div>
  );
};

export default SupplierManagement;