import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt, 
  FaCalendarAlt, FaTruck, FaMoneyBillWave, FaListUl, 
  FaSignInAlt, FaUndo, FaTimes, FaPrint 
} from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const EntryManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('entries');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    produit_nom: '',
    numBond: '',
    codeMarche: '',
    fournisseur: '',
    date: '',
  });

  // Base URL for API
  const WEB_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Fetch entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await api.get('/entrees');
        setEntries(response.data);
        setFilteredEntries(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError('Erreur lors du chargement des entrées : ' + errorMessage);
        toast.error('Erreur lors du chargement des entrées : ' + errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      if (!filters.produit_nom && !filters.numBond && !filters.codeMarche && !filters.fournisseur && !filters.date) {
        setFilteredEntries(entries);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/entrees/filtrer', {
          params: {
            produit_nom: filters.produit_nom,
            numBond: filters.numBond,
            codeMarche: filters.codeMarche,
            fournisseur: filters.fournisseur,
            date: filters.date,
          },
        });
        setFilteredEntries(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError('Erreur lors du filtrage des entrées : ' + errorMessage);
        toast.error('Erreur lors du filtrage des entrées : ' + errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    applyFilters();
  }, [filters, entries]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      produit_nom: '',
      numBond: '',
      codeMarche: '',
      fournisseur: '',
      date: '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' DH';
  };

  // Calculate totals for an entry
  const calculateEntryTotals = (entry) => {
    const totalHT = entry.produits.reduce((sum, produit) => sum + (produit.quantite * produit.prixUnitaire), 0);
    const totalTTC = entry.produits.reduce((sum, produit) => {
      const tvaRate = produit.tva?.taux || 0;
      return sum + (produit.quantite * produit.prixUnitaire * (1 + tvaRate / 100));
    }, 0);
    const totalQuantite = entry.produits.reduce((sum, produit) => sum + produit.quantite, 0);
    return { totalHT, totalTTC, totalQuantite };
  };

  const handleAddEntry = () => {
    navigate('/stock-manager/entries/add');
  };

  const handleEditEntry = (id) => {
    navigate(`/stock-manager/entries/edit/${id}`);
  };

  const handleDeleteEntry = (id) => {
    setEntryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!entryToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/entrees/${entryToDelete}`);
      setEntries(entries.filter(entry => entry.id !== entryToDelete));
      setFilteredEntries(filteredEntries.filter(entry => entry.id !== entryToDelete));
      toast.success('Entrée supprimée avec succès');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Erreur lors de la suppression : ' + errorMessage);
      toast.error('Erreur lors de la suppression : ' + errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const handleViewEntry = async (id) => {
    try {
      const response = await api.get(`/entrees/${id}/bon`, {
        headers: { Accept: 'text/html' },
      });
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Bon d'entrée</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center;">
              <h2>Chargement du bon d'entrée...</h2>
              <p>Veuillez patienter</p>
            </div>
          </body>
        </html>
      `);
      newWindow.document.open();
      newWindow.document.write(response.data);
      newWindow.document.close();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Impossible d\'afficher le bon : ' + errorMessage);
      toast.error('Impossible d\'afficher le bon : ' + errorMessage);
      console.error(err);
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Erreur</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center; color: red;">
              <h2>Erreur lors du chargement du bon</h2>
              <p>${errorMessage}</p>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handlePrintEntry = async (id) => {
    try {
      const response = await api.get(`/entrees/${id}/imprimer`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error('Impossible d\'ouvrir le PDF');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Impossible d\'imprimer le bon : ' + errorMessage);
      toast.error('Impossible d\'imprimer le bon : ' + errorMessage);
      console.error(err);
    }
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEntry(null);
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

      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaSignInAlt className="mr-3" /> Gestion des Entrées
                  </h2>
                  <p className="text-yellow-100">Suivi des entrées de stock</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={resetFilters}
                    className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center font-medium"
                    disabled={loading}
                  >
                    <FaUndo className="mr-2" /> Réinitialiser les filtres
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center font-medium"
                    disabled={loading}
                  >
                    <FaPlus className="mr-2" /> Nouvelle entrée
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="produit_nom"
                      value={filters.produit_nom}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Rechercher par nom"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Bon</label>
                  <div className="relative">
                    <FaFileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="numBond"
                      value={filters.numBond}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Rechercher par numéro"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Marché</label>
                  <div className="relative">
                    <FaFileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="codeMarche"
                      value={filters.codeMarche}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Rechercher par code"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <div className="relative">
                    <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fournisseur"
                      value={filters.fournisseur}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Rechercher par fournisseur"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaFileAlt className="mr-2" /> N° Bon
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code Marché
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" /> Date
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaTruck className="mr-2" /> Fournisseur
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="mr-2" /> Total HT
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="mr-2" /> Total TTC
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => {
                      const { totalHT, totalTTC } = calculateEntryTotals(entry);
                      return (
                        <tr key={entry.id} className="hover:bg-yellow-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-yellow-700">
                            {entry.numBond}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.codeMarche || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(entry.date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{entry.fournisseur?.raisonSocial || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {formatCurrency(totalHT)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {formatCurrency(totalTTC)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openDetailModal(entry)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-100 transition"
                                title="Détails"
                                disabled={loading}
                              >
                                <FaListUl />
                              </button>
                              <button
                                onClick={() => handleEditEntry(entry.id)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                                title="Modifier"
                                disabled={loading}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition"
                                title="Supprimer"
                                disabled={loading}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Aucune entrée trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Détails du bon d'entrée {selectedEntry.numBond}
              </h3>
              <button 
                onClick={closeDetailModal} 
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Informations générales</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Numéro de bon:</span> {selectedEntry.numBond}</p>
                    <p><span className="font-medium">Code Marché:</span> {selectedEntry.codeMarche || 'N/A'}</p>
                    <p><span className="font-medium">Date:</span> {formatDateTime(selectedEntry.date)}</p>
                    <p><span className="font-medium">Fournisseur:</span> {selectedEntry.fournisseur?.raisonSocial || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Totaux</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Quantité Totale:</span> {calculateEntryTotals(selectedEntry).totalQuantite}</p>
                    <p><span className="font-medium">Total HT:</span> {formatCurrency(calculateEntryTotals(selectedEntry).totalHT)}</p>
                    <p><span className="font-medium">Total TTC:</span> {formatCurrency(calculateEntryTotals(selectedEntry).totalTTC)}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-gray-700 mb-3">Produits reçus</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire (MAD)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA (%)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (MAD)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEntry.produits && selectedEntry.produits.length > 0 ? (
                      selectedEntry.produits.map(produit => (
                        <tr key={produit.id}>
                          <td className="px-4 py-2 whitespace-nowrap">{produit.reference || 'N/A'}</td>
                          <td className="px-4 py-2">{produit.name || 'N/A'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right">{produit.quantite || 0}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(produit.prixUnitaire)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right">{produit.tva?.taux || 0}%</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right font-medium">
                            {formatCurrency(produit.quantite * produit.prixUnitaire)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                          Aucun produit associé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => handleViewEntry(selectedEntry.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <FaFileAlt className="mr-2" /> Voir le bon
                </button>
                <button
                  onClick={() => handlePrintEntry(selectedEntry.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <FaPrint className="mr-2" /> Imprimer
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
        loading={loading}
        itemName={`l'entrée ${entries.find(entry => entry.id === entryToDelete)?.numBond || ''}`}
      />
    </div>
  );
};

export default EntryManagement;