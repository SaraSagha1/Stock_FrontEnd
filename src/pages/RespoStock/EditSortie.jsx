import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';

const EditExit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('exits');

  // Données mockées pour les sélections
  const employees = [
    { id: 101, nom: 'Ahmed Benali', matricule: 'EMP-2020-101', organigramme: 'IT/Développement' },
    { id: 205, nom: 'Fatima Zahra', matricule: 'EMP-2019-205', organigramme: 'RH/Formation' }
  ];
  
  const products = [
    { reference: 'PROD-IT-001', name: 'Ordinateur portable', stock: 15 },
    { reference: 'PROD-IT-002', name: 'Souris sans fil', stock: 42 },
    { reference: 'PROD-BURO-001', name: 'Cahier A4', stock: 200 },
    { reference: 'PROD-BURO-002', name: 'Stylos', stock: 350 }
  ];

  // Données mockées pour la sortie à modifier
  const mockExits = [
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
          stock: 15
        }
      ],
      statut: 'validée'
    }
  ];

  const [formData, setFormData] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    produit: null,
    quantity: 1,
  });

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    const exitToEdit = mockExits.find(exit => exit.id === parseInt(id));
    if (exitToEdit) {
      setFormData(exitToEdit);
    } else {
      navigate('/stock-manager/stock/exits');
    }
  }, [id, navigate]);

  const handleEmployeeChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedEmployee = employees.find(emp => emp.id === selectedId);
    setFormData({ ...formData, employe: selectedEmployee });
  };

  const handleProductSelect = (e) => {
    const selectedRef = e.target.value;
    const selectedProduct = products.find(p => p.reference === selectedRef);
    setCurrentProduct({ ...currentProduct, produit: selectedProduct });
  };

  const handleAddProduct = () => {
    if (currentProduct.produit && currentProduct.quantity > 0) {
      setFormData({
        ...formData,
        produits: [
          ...formData.produits,
          {
            ...currentProduct.produit,
            quantity: currentProduct.quantity,
          }
        ]
      });
      setCurrentProduct({
        produit: null,
        quantity: 1,
      });
    }
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...formData.produits];
    newProducts.splice(index, 1);
    setFormData({ ...formData, produits: newProducts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous enverriez normalement les modifications à votre API
    console.log('Sortie modifiée:', formData);
    
    // Redirection après soumission
    navigate('/stock-manager/stock/exits');
  };

  if (!formData) return (
    <div className="flex h-screen bg-gray-50">
      <RespoSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">Chargement en cours...</div>
        </div>
      </div>
    </div>
  );

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
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/stock-manager/stock/exits')}
                  className="mr-4 p-2 rounded-full hover:bg-yellow-700 transition"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Modifier la sortie {formData.numBon}</h2>
                  <p className="text-yellow-100">Modifier les détails de la sortie de produits</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé demandeur *</label>
                  <select
                    required
                    value={formData.employe?.id || ''}
                    onChange={handleEmployeeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nom} ({emp.matricule}) - {emp.organigramme}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de sortie *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateSortie.split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, dateSortie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Produits sortis</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                      <select
                        value={currentProduct.produit?.reference || ''}
                        onChange={handleProductSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(prod => (
                          <option key={prod.reference} value={prod.reference}>
                            {prod.name} ({prod.stock} en stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                      <input
                        type="number"
                        min="1"
                        value={currentProduct.quantity}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={!currentProduct.produit || currentProduct.quantity < 1}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
                  >
                    <FaPlus className="mr-2" /> Ajouter la sortie
                  </button>
                </div>

                {formData.produits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.produits.map((prod, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{prod.name}</td>
                            <td className="px-4 py-2">{prod.reference}</td>
                            <td className="px-4 py-2">{prod.quantity}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucun produit ajouté</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!formData.employe || formData.produits.length === 0}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  <FaSave className="mr-2" /> Enregistrer les modifications
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