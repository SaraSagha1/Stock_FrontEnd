import React, { useState, useEffect } from "react";
import SidebarEmploye from "../../components/Employe/EmployeeSidebar";
import API from "../../api/axios";

export default function ConsulterStock() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les données au montage du composant
  useEffect(() => {
    chargerStock();
  }, []);

  const chargerStock = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get('/employe/voirStock');
      
      // Si l'API retourne directement un tableau
      if (Array.isArray(response.data)) {
        setStock(response.data);
      } 
      // Si l'API retourne un objet avec success et data
      else if (response.data && response.data.success) {
        setStock(response.data.data || []);
      } 
      // Sinon, essayer de traiter les données directement
      else if (response.data) {
        setStock(response.data);
      }
      else {
        setError('Format de données inattendu');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur complète:', err);
      console.error('Response data:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-gray-50">
      <div className="relative z-10 flex h-full">
        <SidebarEmploye
          isSidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarBg="bg-gray-300"
        />

        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          {/* En-tête */}
          <div className="bg-red-800 text-white px-6 py-4 shadow-lg">
            <h2 className="text-2xl font-bold">Consulter le stock</h2>
            <p className="text-red-100 mt-1">Vue d'ensemble de l'inventaire</p>
          </div>

          <div className="p-6">
            {/* Messages d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Indicateur de chargement */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Chargement du stock...</span>
              </div>
            ) : (
              /* Conteneur du tableau */
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* En-tête du tableau avec statistiques */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Inventaire des produits
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {stock.length} produit{stock.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tableau responsive */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-left">
                        <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">
                          Famille
                        </th>
                        <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">
                          Sous-famille
                        </th>
                        <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">
                          Produit
                        </th>
                        {/* Colonne Statut SUPPRIMÉE */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stock.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <p className="text-lg font-medium">Aucun article en stock</p>
                              <p className="text-sm">Les produits apparaîtront ici une fois ajoutés</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        stock.map((item, index) => (
                          <tr 
                            key={item.id || index} 
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 text-gray-900 font-medium">
                              {item.famille || item.family || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {item.sous_famille || item.subfamily || item.category || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-medium">
                              {item.nom_produit || item.name || item.product_name || 'N/A'}
                            </td>
                            {/* Cellule Statut SUPPRIMÉE */}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}