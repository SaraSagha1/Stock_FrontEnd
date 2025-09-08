import React, { useState, useEffect } from 'react';
import { FaBox, FaExclamationTriangle, FaTruck, FaPercent, FaChartLine , FaSync,FaCubes, FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import StockManagerSidebar from '../../components/RespoStock/RespoSidebar';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const BarChart = ({ data, title, color }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full transition-all duration-300 hover:shadow-xl">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-1/3 text-xs text-gray-600 truncate">{item.label}</div>
            <div className="w-2/3">
              <div className="flex items-center">
                <div 
                  className={`h-4 rounded-md ${color}`} 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
                <span className="ml-2 text-xs text-gray-600">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];

const PieChart = ({ data, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full transition-all duration-300 hover:shadow-xl">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="flex justify-center">
        <RechartsPieChart width={300} height={230}>
         <Pie
  data={data}
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={80}
  paddingAngle={3}
  dataKey="value"
  nameKey="label"   // ✅ important
>
  {data.map((_, index) => (
    <Cell key={index} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>

          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </div>
    </div>
  );
};

const DashboardStockManager = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/statistiques');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };

  // Préparer les données pour les graphiques
  const topProductsData = stats ? stats.produits_les_plus_demandes
    .filter(product => product.sorties_count > 0)
    .map(product => ({
      label: product.name,
      value: product.sorties_count
    })) : [];


const stockStatusData = stats ? [
  { label: 'En Alerte', value: stats.produits_en_alerte || 0 },
  { label: 'En Rupture', value: stats.produits_en_rupture ? stats.produits_en_rupture.length : 0 }
] : [];


  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <StockManagerSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex items-center justify-center ml-0 transition-all duration-300"
          style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <StockManagerSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div 
        className="flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}
      >
         <div className="p-4 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 shadow-lg sticky top-0 z-10 flex justify-between items-center text-white rounded-b-lg">
         {/* Title + subtitle */}
           <div className="flex flex-col">
             <h1 className="text-2xl font-bold flex items-center gap-2">
             <FaChartLine className="text-yellow-300" /> Tableau de Bord</h1>
             <span className="text-sm text-orange-100">Suivi en temps réel des statistiques</span>
           </div>
           {/* Refresh button */}
           <button 
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition-all duration-300 shadow-md"
            >
           <FaSync className="animate-spin-slow" />
           <span className="hidden sm:inline font-medium">Actualiser</span>
        </button>
       </div>

        
        <div className="p-6">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">Total Produits</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.total_produits}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">En Rupture</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.produits_en_rupture.length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaExclamationTriangle className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">En Alerte</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.produits_en_alerte}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaBoxOpen className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">Non Sortis</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.produits_non_sortis ? stats.produits_non_sortis.length : 0}</p>
              </div>
            </div>
          </div>

          {/* Cartes supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FaTruck className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">Fournisseur Principal</h2>
                <p className="text-lg font-bold text-gray-800 truncate">{stats.fournisseur_plus_utilise || "Aucun"}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <FaPercent className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">TVA Principale</h2>
                <p className="text-lg font-bold text-gray-800">{stats.tva_plus_utilisee ? `${stats.tva_plus_utilisee}%` : "Aucune"}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-teal-100 p-3 mr-4">
                <FaCubes className="text-teal-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">Total Stock</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.total_stock}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-orange-100 p-3 mr-4">
                <FaClipboardList className="text-orange-600 text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600 text-sm font-medium">Demandes Attente</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.demandes_en_attente || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-72">
              <PieChart 
                data={stockStatusData} 
                title="Répartition du Stock" 
              />
            </div>
            
            <div className="h-72">
              <BarChart 
                data={topProductsData.length > 0 ? topProductsData : [{label: "Aucun produit demandé", value: 1}]} 
                title="5 Top Produits Demandés" 
                color="bg-green-700" 
              />
            </div>
          </div>
          
          {/* Liste des produits non sortis */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-bold text-gray-800">Produits Non Sortis</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.produits_non_sortis && stats.produits_non_sortis.length > 0 ? (
                stats.produits_non_sortis.map((produit, index) => (
                  <div key={index} className="px-6 py-4 flex justify-between items-center hover:bg-red-50 transition-colors duration-200">
                    <div className="flex-1">
                      <h3 className="text-md font-medium text-gray-800">{produit.name}</h3>
                      <p className="text-sm text-gray-600">Stock: {produit.stock}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Jamais sorti
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">Tous les produits ont été sortis au moins une fois</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardStockManager;