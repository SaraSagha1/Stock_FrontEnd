import AdminSidebar from "../../components/Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Building2, Users, MapPin, Briefcase, Target } from "lucide-react";

const OrganigrammeTree = ({ onNodeSelect, selectedNode: externalSelectedNode }) => {
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['1'])); // DG expanded by default
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour construire l'arbre récursivement à partir des données plates avec gestion des cas spéciaux
  const buildTreeFromFlatData = (flatData, parentId = 1) => {
    let children = flatData.filter(item => item.parent_id === parentId);
    
    // Tri spécial pour la DG (ID:1) - mélange de types
    if (parentId === 1) {
      children.sort((a, b) => {
        const typeOrder = {
          'Direction': 1,
          'Division': 2,
          'Département': 3,
          'Unité': 4,
          'Mission': 5,
          'Agence': 6
        };
        const orderA = typeOrder[a.type] || 99;
        const orderB = typeOrder[b.type] || 99;
        
        if (orderA !== orderB) return orderA - orderB;
        return a.nom.localeCompare(b.nom);
      });
    }
    
    // Tri spécial pour les Agences Territoriales (ID:7) - seulement les Agences
    if (parentId === 7) {
      children = children
        .filter(item => item.type === 'Agence')
        .sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return children.map(item => ({
      ...item,
      children: buildTreeFromFlatData(flatData, item.id)
    }));
  };

  // Dans OrganigrammeTree.jsx
useEffect(() => {
  const loadTreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer le token du localStorage
      const token = localStorage.getItem('token'); // ou où vous stockez votre token
      
      const response = await fetch("http://127.0.0.1:8000/api/organigrammes/all-for-tree", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Données récupérées de l'API:", data);
      
      if (data.success) {
        setTreeData(data.data);
      }
      
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadTreeData();
}, []);

  // Fonction pour basculer l'expansion d'un nœud
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

   // Modifiez la fonction selectNode comme suit :
  const selectNode = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'DirectionG':
        return <Building2 className="w-4 h-4" />;
      case 'Direction':
        return <Building2 className="w-4 h-4" />;
      case 'Division':
        return <Briefcase className="w-4 h-4" />;
      case 'Département':
        return <Users className="w-4 h-4" />;
      case 'Unité':
        return <MapPin className="w-4 h-4" />;
      case 'Agence':
        return <MapPin className="w-4 h-4" />;
      case 'Mission':
        return <Target className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir la couleur selon le type
  const getTypeColor = (type) => {
    switch (type) {
      case 'DirectionG':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Direction':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Division':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Département':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Unité':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Agence':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'Mission':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fonction pour obtenir le label complet du type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'DirectionG':
        return 'Direction Générale';
      case 'Direction':
        return 'Direction';
      case 'Division':
        return 'Division';
      case 'Département':
        return 'Département';
      case 'Unité':
        return 'Agence Territoriale';
      case 'Agence':
        return 'Agence Locale';
      case 'Mission':
        return 'Mission';
      default:
        return type;
    }
  };
 const displayedSelectedNode = externalSelectedNode !== undefined ? externalSelectedNode : selectedNode;
  // Composant récursif pour afficher un nœud de l'arbre
  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.has(node.id.toString());
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode && selectedNode.id === node.id;

    return (
      <div className="select-none">
        <div 
          className={`flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 
            ${isSelected 
              ? 'bg-red-100 border-2 border-red-300 shadow-md' 
              : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => selectNode(node)}
        >
          {/* Bouton d'expansion */}
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id.toString());
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Icône du type */}
          <div className={`mr-3 p-2 rounded-full border ${getTypeColor(node.type)}`}>
            {getTypeIcon(node.type)}
          </div>

          {/* Nom du nœud */}
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

          {/* Indicateur de sélection */}
          {isSelected && (
            <div className="ml-2 w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          )}
        </div>

        {/* Enfants */}
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

  // Fonction pour obtenir le chemin complet du nœud sélectionné
  const getNodePath = (node, data = treeData, path = []) => {
    for (const item of data) {
      const currentPath = [...path, item.nom];
      if (item.id === node.id) {
        return currentPath;
      }
      if (item.children && item.children.length > 0) {
        const result = getNodePath(node, item.children, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'organigramme...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur lors du chargement: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-red-600 text-white p-6">
        <h2 className="text-2xl font-bold">Organigramme AL OMRANE</h2>
        <p className="text-red-100 mt-2">Sélectionnez l'affectation de l'employé dans l'arbre organisationnel</p>
      </div>

      <div className="flex">
        {/* Arbre organisationnel */}
        <div className="flex-1 p-6 max-h-96 overflow-y-auto border-r border-gray-200">
          <div className="space-y-1">
            {treeData.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* Panneau de sélection */}
        <div className="w-80 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Affectation Sélectionnée</h3>
          
          {selectedNode ? (
            <div className="space-y-4">
              {/* Informations du nœud sélectionné */}
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
                  {selectedNode.parent_id && (
                    <div><strong>Parent ID:</strong> {selectedNode.parent_id}</div>
                  )}
                </div>
              </div>

              {/* Chemin hiérarchique */}
              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-2">Chemin hiérarchique:</h5>
                <div className="text-sm text-gray-600">
                  {getNodePath(selectedNode)?.join(' → ') || 'Chemin non disponible'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    alert(`Utilisateur assigné à: ${selectedNode.nom} (ID: ${selectedNode.id})`);
                  }}
                  className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Assigner à cette position
                </button>
                
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler la sélection
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cliquez sur un élément dans l'arbre pour le sélectionner</p>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 p-4 border-t">
        <h4 className="font-medium text-gray-700 mb-3">Légende des types:</h4>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'DirectionG', label: 'Direction Générale' },
            { type: 'Direction', label: 'Direction' },
            { type: 'Division', label: 'Division' },
            { type: 'Département', label: 'Département' },
            { type: 'Unité', label: 'Agence Territoriale' },
            { type: 'Agence', label: 'Agence Locale' },
            { type: 'Mission', label: 'Mission' }
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div className={`p-1 rounded-full border ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default OrganigrammeTree;