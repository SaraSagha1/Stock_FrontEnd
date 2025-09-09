import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  ChevronRight, ChevronDown, Building2, Users, MapPin, 
  Briefcase, Target, Plus, Edit, Trash2, Search, X,
  AlertCircle, CheckCircle, Info
} from "lucide-react";

const OrganigrammePage = ({ onNodeSelect, selectedNode: externalSelectedNode }) => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['1']));
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('organigramme');

  // États pour les formulaires
  const [formData, setFormData] = useState({
    nom: "",
    type: "Direction",
    parent_id: null
  });

  // Fonction pour afficher des alertes
  const showAlert = (title, message, type = "info") => {
    setNotification({ show: true, message: `${title}: ${message}`, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Charger les données
  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch("http://127.0.0.1:8000/api/organigrammes/all-for-tree", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      if (data.success) setTreeData(data.data);
      
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError(err.message);
      showAlert("Erreur", "Impossible de charger l'organigramme", "error");
    } finally {
      setLoading(false);
    }
  };

  // RECHERCHER des éléments - VERSION CORRIGÉE
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showAlert("Information", "Veuillez entrer un terme de recherche", "info");
      return;
    }

    try {
      console.log("🔍 Lancement recherche avec:", searchTerm);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert("Erreur", "Token d'authentification manquant", "error");
        return;
      }

      const url = `http://127.0.0.1:8000/api/organigrammes/search?nom=${encodeURIComponent(searchTerm)}`;
      console.log("🌐 URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log("📊 Status:", response.status, response.statusText);

      if (response.status === 404) {
        showAlert("Erreur", "Route API non trouvée (404)", "error");
        return;
      }

      if (response.status === 500) {
        showAlert("Erreur", "Erreur serveur interne (500)", "error");
        return;
      }

      const data = await response.json();
      console.log("📦 Données reçues:", data);

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      setSearchResults(data.data || data);
      
      if ((data.data || data).length === 0) {
        showAlert("Information", "Aucun résultat trouvé", "info");
      }

    } catch (error) {
      console.error("💥 Erreur complète:", error);
      showAlert("Erreur", error.message || "Erreur lors de la recherche", "error");
    }
  };

  // AJOUTER un élément
  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://127.0.0.1:8000/api/organigrammes", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      const result = await response.json();
      showAlert("Succès", result.message, "success");
      setIsAdding(false);
      setFormData({ nom: "", type: "Direction", parent_id: null });
      loadTreeData();
      
    } catch (error) {
      showAlert("Erreur", error.message, "error");
    }
  };

  // MODIFIER un élément
  const handleEdit = async () => {
    if (!selectedNode) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/organigrammes/${selectedNode.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de la modification');

      const result = await response.json();
      showAlert("Succès", result.message, "success");
      setIsEditing(false);
      setFormData({ nom: "", type: "Direction", parent_id: null });
      setSelectedNode(null);
      loadTreeData();
      
    } catch (error) {
      showAlert("Erreur", error.message, "error");
    }
  };

  // SUPPRIMER un élément
  const handleDelete = async () => {
    if (!selectedNode || !window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/organigrammes/${selectedNode.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      const result = await response.json();
      showAlert("Succès", result.message, "success");
      setSelectedNode(null);
      loadTreeData();
      
    } catch (error) {
      showAlert("Erreur", error.message, "error");
    }
  };

  // Sélectionner un nœud
  const selectNode = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };

  // Ouvrir le formulaire d'édition
  const openEditForm = () => {
    if (!selectedNode) {
      showAlert("Information", "Veuillez sélectionner un élément à modifier", "info");
      return;
    }
    setFormData({
      nom: selectedNode.nom,
      type: selectedNode.type,
      parent_id: selectedNode.parent_id
    });
    setIsEditing(true);
  };

  // Ouvrir le formulaire d'ajout avec parent présélectionné
  const openAddForm = (parentNode = null) => {
    setFormData({
      nom: "",
      type: "Direction",
      parent_id: parentNode ? parentNode.id : null
    });
    setIsAdding(true);
  };

  // Types disponibles pour les formulaires
  const availableTypes = [
    { value: 'DirectionG', label: 'Direction Générale' },
    { value: 'Direction', label: 'Direction' },
    { value: 'Division', label: 'Division' },
    { value: 'Département', label: 'Département' },
    { value: 'Unité', label: 'Agence Territoriale' },
    { value: 'Agence', label: 'Agence Locale' },
    { value: 'Mission', label: 'Mission' }
  ];

  // Composant TreeNode
  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.has(node.id.toString());
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode && selectedNode.id === node.id;

    return (
      <div className="select-none">
        <div 
          className={`flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 
            ${isSelected ? 'bg-red-100 border-2 border-red-300 shadow-md' : 'hover:bg-gray-50 border-2 border-transparent'}`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => selectNode(node)}
        >
          {/* Bouton d'expansion */}
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <button onClick={(e) => {
                e.stopPropagation();
                setExpandedNodes(prev => {
                  const newSet = new Set(prev);
                  newSet.has(node.id.toString()) ? newSet.delete(node.id.toString()) : newSet.add(node.id.toString());
                  return newSet;
                });
              }} className="p-1 rounded hover:bg-gray-200 transition-colors">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
              </button>
            ) : <div className="w-4 h-4" />}
          </div>

          {/* Icône et nom */}
          <div className={`mr-3 p-2 rounded-full border ${getTypeColor(node.type)}`}>
            {getTypeIcon(node.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${isSelected ? 'text-red-800' : 'text-gray-800'}`}>
                {node.nom}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(node.type)}`}>
                {getTypeLabel(node.type)}
              </span>
            </div>
          </div>

          {isSelected && <div className="ml-2 w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 p-8`}>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement de l'organigramme...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 p-8`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-red-800">Erreur de chargement</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={loadTreeData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Contenu principal */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "error" ? "bg-red-100 border-red-400 text-red-800" :
            notification.type === "success" ? "bg-green-100 border-green-400 text-green-800" :
            "bg-blue-100 border-blue-400 text-blue-800"
          } border-l-4`}>
            <div className="flex items-center">
              {notification.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
              {notification.type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
              {notification.type === "info" && <Info className="w-5 h-5 mr-2" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden m-4">
          {/* En-tête avec boutons d'action */}
          <div className="bg-red-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Organigramme AL OMRANE</h2>
                <p className="text-red-100 mt-2">Gestion de l'organigramme</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openAddForm()} className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
                  <Plus className="w-4 h-4 inline mr-1" /> Ajouter
                </button>
                <button onClick={() => setShowSearch(!showSearch)} className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
                  <Search className="w-4 h-4 inline mr-1" /> Rechercher
                </button>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          {showSearch && (
            <div className="bg-gray-100 p-4 border-b">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button onClick={handleSearch} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                  Rechercher
                </button>
                <button onClick={() => setShowSearch(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Résultats de la recherche:</h4>
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{result.nom}</span>
                            <span className="text-sm text-gray-600 ml-2">({getTypeLabel(result.type)})</span>
                          </div>
                          <button onClick={() => selectNode(result)} className="text-blue-600 hover:text-blue-800">
                            Sélectionner
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex">
            {/* Arbre organisationnel */}
            <div className="flex-1 p-6 max-h-96 overflow-y-auto border-r border-gray-200">
              <div className="space-y-1">
                {treeData.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </div>
            </div>

            {/* Panneau de sélection et actions */}
            <div className="w-96 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedNode ? 'Élément Sélectionné' : 'Actions'}
              </h3>
              
              {selectedNode ? (
                <div className="space-y-4">
                  {/* Informations du nœud */}
                  <div className={`p-4 rounded-lg border-2 ${getTypeColor(selectedNode.type)}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      {getTypeIcon(selectedNode.type)}
                      <div>
                        <h4 className="font-bold text-lg">{selectedNode.nom}</h4>
                        <p className="text-sm opacity-80">{getTypeLabel(selectedNode.type)}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>ID:</strong> {selectedNode.id}</div>
                      {selectedNode.parent_id && <div><strong>Parent ID:</strong> {selectedNode.parent_id}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button onClick={openEditForm} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      <Edit className="w-4 h-4 inline mr-2" /> Modifier
                    </button>
                    <button onClick={() => openAddForm(selectedNode)} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      <Plus className="w-4 h-4 inline mr-2" /> Ajouter un enfant
                    </button>
                    <button onClick={handleDelete} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                      <Trash2 className="w-4 h-4 inline mr-2" /> Supprimer
                    </button>
                    <button onClick={() => setSelectedNode(null)} className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un élément pour voir les actions disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Modals pour Ajouter/Modifier */}
          {(isAdding || isEditing) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">
                  {isAdding ? 'Ajouter un élément' : 'Modifier l\'élément'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {availableTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Parent ID</label>
                    <input
                      type="number"
                      value={formData.parent_id || ''}
                      onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Laissez vide pour la racine"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={isAdding ? handleAdd : handleEdit}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    {isAdding ? 'Ajouter' : 'Modifier'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(false);
                      setFormData({ nom: "", type: "Direction", parent_id: null });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Légende */}
          <div className="bg-gray-50 p-4 border-t">
            <h4 className="font-medium text-gray-700 mb-3">Légende des types:</h4>
            <div className="flex flex-wrap gap-3">
              {availableTypes.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <div className={`p-1 rounded-full border ${getTypeColor(item.value)}`}>
                    {getTypeIcon(item.value)}
                  </div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonctions utilitaires
const getTypeIcon = (type) => {
  switch (type) {
    case 'DirectionG': return <Building2 className="w-4 h-4" />;
    case 'Direction': return <Building2 className="w-4 h-4" />;
    case 'Division': return <Briefcase className="w-4 h-4" />;
    case 'Département': return <Users className="w-4 h-4" />;
    case 'Unité': return <MapPin className="w-4 h-4" />;
    case 'Agence': return <MapPin className="w-4 h-4" />;
    case 'Mission': return <Target className="w-4 h-4" />;
    default: return <Building2 className="w-4 h-4" />;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'DirectionG': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'Direction': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Division': return 'text-green-600 bg-green-50 border-green-200';
    case 'Département': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Unité': return 'text-red-600 bg-red-50 border-red-200';
    case 'Agence': return 'text-pink-600 bg-pink-50 border-pink-200';
    case 'Mission': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'DirectionG': return 'Direction Générale';
    case 'Direction': return 'Direction';
    case 'Division': return 'Division';
    case 'Département': return 'Département';
    case 'Unité': return 'Agence Territoriale';
    case 'Agence': return 'Agence Locale';
    case 'Mission': return 'Mission';
    default: return type;
  }
};

export default OrganigrammePage;