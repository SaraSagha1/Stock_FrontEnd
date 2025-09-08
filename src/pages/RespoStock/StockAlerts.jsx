import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaBoxOpen, FaRegEye, FaEdit, FaCheckCircle } from 'react-icons/fa';
import RespoSidebar from '../../components/RespoStock/RespoSidebar';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Ajuste le chemin
import { toast } from 'react-toastify'; // Ajoute toast pour les notifications

const StockAlerts = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('stock-alerts');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Charger les alertes depuis l'API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/alertes');
        const alertsData = response.data.alertes.map(alerte => ({
          id: alerte.id,
          product: {
            id: alerte.produit.id,
            name: alerte.produit.name,
            reference: alerte.produit.reference,
            currentQuantity: alerte.produit.stock,
            minQuantity: alerte.produit.stock_min,
            category: alerte.produit.sous_famille
              ? `${alerte.produit.sous_famille.famille?.nom || 'Sans famille'} > ${alerte.produit.sous_famille.nom || 'Sans sous-famille'}`
              : 'Non défini'
          },
          alertDate: alerte.created_at,
          updatedAt: alerte.updated_at, 
          isSeen: alerte.is_viewed
        }));
        setAlerts(alertsData);
      } catch (err) {
        toast.error('Erreur lors du chargement des alertes : ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Marquer comme vue
  const markAsSeen = async (id) => {
    try {
      await api.put(`/alertes/${id}`, { is_viewed: true });
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, isSeen: true } : alert
      ));
      toast.success('Alerte marquée comme vue');
    } catch (err) {
      toast.error('Erreur lors du marquage : ' + (err.response?.data?.message || err.message));
    }
  };

  // Aller à la page de modification
  const goToNewEntry = () => {
    navigate(`/stock-manager/entries/add`);
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
            {/* En-tête simplifié */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <FaExclamationCircle className="mr-3 animate-pulse" />
                    Alertes de Stock
                  </h1>
                </div>
                <div className="mt-4 md:mt-0 bg-red-700 px-3 py-1 rounded-full text-sm">
                  Total: {alerts.length} Alertes
                </div>
              </div>
            </div>

            {/* Liste des alertes */}
            <div className="p-6 grid grid-cols-1 gap-5">
              {loading ? (
                <div className="text-center py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    <span className="ml-2 text-gray-500">Chargement...</span>
                  </div>
                </div>
              ) : alerts.length > 0 ? (
                alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`rounded-lg shadow-sm border-l-4 ${alert.isSeen ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FaBoxOpen className={`mr-3 ${alert.isSeen ? 'text-green-600' : 'text-red-600'}`} />
                            <h3 className={`text-lg font-semibold ${alert.isSeen ? 'text-gray-700' : 'text-gray-900'}`}>
                              {alert.product.name}
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                ({alert.product.reference})
                              </span>
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-9">
                            <div>
                              <p className="text-xs text-gray-500">Quantité actuelle</p>
                              <p className={`text-xl font-bold ${alert.isSeen ? 'text-green-700' : 'text-red-700'}`}>
                                {alert.product.currentQuantity}
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                  / {alert.product.minQuantity} min
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Catégorie</p>
                              <p className="text-sm font-medium text-gray-700">
                                {alert.product.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Date alerte</p>
                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(alert.alertDate)}
                              </p>
                              {alert.isSeen && (
                                <p className="text-xs text-gray-600 mt-1">Vu le : {formatDate(alert.updatedAt)}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 ml-4">
                          {!alert.isSeen && (
                            <button
                              onClick={() => markAsSeen(alert.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                              title="Marquer comme vue"
                            >
                              <FaRegEye />
                            </button>
                          )}
                          <button
                            onClick={() => goToNewEntry()}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                            title="Nouveau Entrée"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-3">
                    <FaCheckCircle className="text-4xl text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700">Aucune alerte active</h3>
                  <p className="text-gray-500">Tous les stocks sont suffisants</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;