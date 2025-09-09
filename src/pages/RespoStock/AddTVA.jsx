// pages/StockManager/TVAAdd.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPercent, FaArrowLeft, FaSave } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';

const TVAAdd = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('tva');
  
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici vous pourriez ajouter la logique pour sauvegarder dans l'API
    console.log('Nouvelle TVA à ajouter:', formData);
    alert('TVA ajoutée avec succès!');
    navigate('/stock-manager/products/tva');
  };

  const handleBack = () => {
    navigate('/stock-manager/products/tva');
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
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    onClick={handleBack}
                    className="mr-4 p-2 rounded-full hover:bg-green-700 transition"
                  >
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <FaPercent className="mr-3" /> Ajouter un nouveau taux de TVA
                    </h2>
                    <p className="text-green-100">Configurez un nouveau taux de TVA</p>
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
                      Nom du taux de TVA *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                      placeholder="Ex: TVA Normale, TVA Réduite..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Ex: 20, 10, 5.5..."
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      placeholder="Description du taux de TVA (optionnel)"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center"
                  >
                    <FaArrowLeft className="mr-2" /> Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                  >
                    <FaSave className="mr-2" /> Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVAAdd;