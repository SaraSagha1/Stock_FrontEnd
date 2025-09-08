// pages/StockManager/ExitManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt, 
  FaCalendarAlt, FaUser, FaSitemap, FaPrint ,FaUndo, FaSignOutAlt as FaExit,FaTimes
} from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';

const ExitManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('exits');
  const [selectedExit, setSelectedExit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Données mockées
  const [exits, setExits] = useState([
    {
      id: 1,
      numBon: 'SORT-2023-001',
      dateSortie: '2023-06-15T14:30:00',
      employe: {
        id: 101,
        nom: 'Ahmed Benali',
        matricule: 'EMP-2020-101',
        organigramme: 'IT/Développement'
      },
      produits: [
        { 
          reference: 'PROD-IT-001', 
          name: 'Ordinateur portable', 
          quantity: 2,
        },
        { 
          reference: 'PROD-IT-002', 
          name: 'Souris sans fil', 
          quantity: 2,
        }
      ],
      statut: 'validée'
    },
    {
      id: 2,
      numBon: 'SORT-2023-002',
      dateSortie: '2023-06-10T09:15:00',
      employe: {
        id: 205,
        nom: 'Fatima Zahra',
        matricule: 'EMP-2019-205',
        organigramme: 'RH/Formation'
      },
      produits: [
        { 
          reference: 'PROD-BURO-001', 
          name: 'Cahier A4', 
          quantity: 10,
        },
        { 
          reference: 'PROD-BURO-002', 
          name: 'Stylos', 
          quantity: 20,
        }
      ],
      statut: 'validée'
    }
  ]);

  // Filtres
  const [filters, setFilters] = useState({
    produit: '',
    employe: '',
    organigramme: '',
    dateFrom: '',
    dateTo: '',
    statut: ''
  });

  const [filteredExits, setFilteredExits] = useState([]);

  // Options uniques pour les filtres
  const products = [...new Set(exits.flatMap(exit => exit.produits.map(p => p.name)))];
  const employees = [...new Set(exits.map(exit => exit.employe.nom))];
  const organigrammes = [...new Set(exits.map(exit => exit.employe.organigramme))];
  const statuts = [...new Set(exits.map(exit => exit.statut))];

  // Appliquer les filtres
  useEffect(() => {
    let result = [...exits];
    
    if (filters.produit) {
      result = result.filter(exit => 
        exit.produits.some(p => p.name.includes(filters.produit)))
    }
    
    if (filters.employe) {
      result = result.filter(exit => exit.employe.nom.includes(filters.employe));
    }
    
    if (filters.organigramme) {
      result = result.filter(exit => exit.employe.organigramme.includes(filters.organigramme));
    }
    
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      result = result.filter(exit => new Date(exit.dateSortie) >= dateFrom);
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      result = result.filter(exit => new Date(exit.dateSortie) <= dateTo);
    }
    
    if (filters.statut) {
      result = result.filter(exit => exit.statut === filters.statut);
    }
    
    setFilteredExits(result);
  }, [filters, exits]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      produit: '',
      employe: '',
      organigramme: '',
      dateFrom: '',
      dateTo: '',
      statut: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddExit = () => {
    navigate('/stock-manager/exits/add');
  };

  const handleEditExit = (id) => {
    navigate(`/stock-manager/exits/edit/${id}`);
  };

  const handleDeleteExit = (id) => {
    if (window.confirm('Supprimer cette sortie ? Cette action est irréversible.')) {
      setExits(exits.filter(exit => exit.id !== id));
    }
  };

  const openDetailModal = (exit) => {
    setSelectedExit(exit);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handlePrintReceipt = () => {
    // Logique d'impression du reçu
    window.print();
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
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaExit className="mr-3" /> Gestion des Sorties
                  </h2>
                  <p className="text-yellow-100">Traçabilité des mouvements de stock sortant</p>
                </div>
                <button
                  onClick={handleAddExit}
                  className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg flex items-center font-medium"
                >
                  <FaPlus className="mr-2" /> Nouvelle sortie
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <select
                    name="produit"
                    value={filters.produit}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Tous</option>
                    {products.map((product, index) => (
                      <option key={index} value={product}>{product}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select
                    name="employe"
                    value={filters.employe}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Tous</option>
                    {employees.map((employee, index) => (
                      <option key={index} value={employee}>{employee}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organigramme</label>
                  <select
                    name="organigramme"
                    value={filters.organigramme}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Tous</option>
                    {organigrammes.map((org, index) => (
                      <option key={index} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    name="statut"
                    value={filters.statut}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Tous</option>
                    {statuts.map((statut, index) => (
                      <option key={index} value={statut}>{statut}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  <FaUndo className="mr-2" />
                  Réinitialiser les filtres
                </button>
              </div>
            </div>

            {/* Tableau des sorties */}
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
          Produit
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Quantité
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center">
            <FaUser className="mr-2" /> Employé
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center">
            <FaSitemap className="mr-2" /> Organigramme
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" /> Date
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredExits.length > 0 ? (
        filteredExits.flatMap(exit => 
          exit.produits.map((produit, prodIndex) => (
            <tr key={`${exit.id}-${prodIndex}`} className="hover:bg-yellow-50 transition">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-yellow-700">
                {exit.numBon}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{produit.name}</div>
                <div className="text-sm text-gray-500">{produit.reference}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {produit.quantity}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{exit.employe.nom}</div>
                <div className="text-sm text-gray-500">{exit.employe.matricule}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{exit.employe.organigramme}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDate(exit.dateSortie)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openDetailModal(exit)}
                    className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-100 transition"
                    title="Détails"
                  >
                    <FaFileAlt />
                  </button>
                  <button
                    onClick={() => handleEditExit(exit.id)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition"
                    title="Modifier"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteExit(exit.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition"
                    title="Supprimer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )
      ) : (
        <tr>
          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
            Aucune sortie trouvée
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

          </div>
        </div>
      </div>

      {/* Modal de détail */}
      {isDetailModalOpen && selectedExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Détails du bon de sortie {selectedExit.numBon}
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
                    <p><span className="font-medium">N° Bon:</span> {selectedExit.numBon}</p>
                    <p><span className="font-medium">Date:</span> {formatDateTime(selectedExit.dateSortie)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Demandeur</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nom:</span> {selectedExit.employe.nom}</p>
                    <p><span className="font-medium">Matricule:</span> {selectedExit.employe.matricule}</p>
                    <p><span className="font-medium">Organigramme:</span> {selectedExit.employe.organigramme}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-gray-700 mb-3">Produits sortis</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExit.produits.map((produit, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">{produit.reference}</td>
                        <td className="px-4 py-2">{produit.name}</td>
                        <td className="px-4 py-2 ">{produit.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  <FaPrint className="mr-2" />
                  Imprimer le reçu
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitManagement;