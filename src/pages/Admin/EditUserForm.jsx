import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FaUserEdit, FaArrowLeft, FaSave, FaKey } from 'react-icons/fa';
import { ChevronRight, ChevronDown, Building2, Users, MapPin, Briefcase, Target } from "lucide-react";
import API from "../../api/axios";

const EditUserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    prenom: "",
    email: "",
    role: "Employé",
    poste: "",
    direction: "",
    departement: "",
    division: "",
    agence: ""
  });

  // États pour la modification du mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('utilisateurs');
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // États pour l'organigramme
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['1']));
  const [organigrammeLoading, setOrganigrammeLoading] = useState(true);
  const [organigrammeError, setOrganigrammeError] = useState(null);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        console.log("Chargement des données pour l'utilisateur ID:", userId);
        
        const response = await API.get(`/usersview/${userId}`);
        const user = response.data;
        
        console.log("Données utilisateur reçues:", user);
        
        // Vérifier la structure des données
        if (user) {
          setFormData({
            name: user.name || user.nom || user.nomComplet || "",
            email: user.email || "",
            role: user.role || "Employé",
            poste: user.poste || (user.employe ? user.employe.poste : "") || "",
            direction: user.direction || "",
            departement: user.departement || "",
            division: user.division || "",
            agence: user.agence || ""
          });
        }
        
        setUserLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Charger l'organigramme
  useEffect(() => {
    const loadTreeData = async () => {
      try {
        setOrganigrammeLoading(true);
        setOrganigrammeError(null);
        
        const token = localStorage.getItem('token');
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
        console.log("Données organigramme reçues:", data);
        
        if (data.success) {
          setTreeData(data.data);
        }
        
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setOrganigrammeError(err.message);
      } finally {
        setOrganigrammeLoading(false);
        setLoading(false);
      }
    };

    loadTreeData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    
    if (node.type === 'DirectionG' || node.type === 'Direction') {
      setFormData(prev => ({
        ...prev,
        direction: node.nom,
        departement: "",
        division: "",
        agence: "",
        organigramme_id: node.id
      }));
    } else if (node.type === 'Département') {
      setFormData(prev => ({
        ...prev,
        departement: node.nom,
        division: "",
        agence: "",
        organigramme_id: node.id
      }));
    } else if (node.type === 'Division') {
      setFormData(prev => ({
        ...prev,
        division: node.nom,
        agence: "",
        organigramme_id: node.id
      }));
    } else if (node.type === 'Agence' || node.type === 'Unité') {
      setFormData(prev => ({
        ...prev,
        agence: node.nom,
        organigramme_id: node.id
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        poste: formData.poste,
        direction: formData.direction,
        departement: formData.departement,
        division: formData.division,
        agence: formData.agence,
        organigramme_id: formData.organigramme_id
      };

      console.log("Données à envoyer:", updateData);
      
      await API.put(`/UPusers/${userId}`, updateData);
      navigate('/admin/users');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification de l'utilisateur");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    try {
      await API.post(`/change-password/${userId}`, passwordData);
      
      setPasswordSuccess(true);
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
      
    } catch (error) {
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        setPasswordErrors({ general: "Erreur lors de la modification du mot de passe" });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Fonctions pour l'organigramme
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
          onClick={() => handleNodeSelect(node)}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleNode(node.id.toString()); }} className="p-1 rounded hover:bg-gray-200">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
              </button>
            ) : <div className="w-4 h-4" />}
          </div>

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

          {isSelected && <div className="ml-2 w-3 h-3 bg-red-500 rounded-full"></div>}
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

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-100">
      <AdminSidebar 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-700 flex items-center justify-between">
                <div className="flex items-center">
                  <FaUserEdit className="text-white mr-4" />
                  <h1 className="text-xl font-semibold text-white">Modification des informations utilisateur</h1>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center px-4 py-2 bg-white text-red-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FaKey className="mr-2" />
                  Modifier mot de passe
                </button>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* Formulaire */}
                <div className="flex-1 p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Nom */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom Complet *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                        />
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                        />
                      </div>

                      {/* Rôle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rôle *</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                        >
                          <option value="employe">Employé</option>
                          <option value="ResponsableStock">Responsable Stock</option>
                          <option value="Admin">Administrateur</option>
                        </select>
                      </div>

                      {/* Poste */}
                      {formData.role === "employe" && (
                        <div>
                          <label htmlFor="poste" className="block text-sm font-medium text-gray-700">
                            Poste <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="poste"
                            value={formData.poste}
                            onChange={handleChange}
                            required={formData.role === "employe"}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                          />
                        </div>
                      )}

                      {/* Direction */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Direction</label>
                        <input
                          type="text"
                          value={formData.direction}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                          placeholder="Sélectionnez une direction dans l'organigramme"
                        />
                      </div>

                      {/* Département */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Département</label>
                        <input
                          type="text"
                          value={formData.departement}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                          placeholder="Sélectionnez un département dans l'organigramme"
                        />
                      </div>

                      {/* Division */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Division</label>
                        <input
                          type="text"
                          value={formData.division}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                          placeholder="Sélectionnez une division dans l'organigramme"
                        />
                      </div>

                      {/* Agence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Agence</label>
                        <input
                          type="text"
                          value={formData.agence}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                          placeholder="Sélectionnez une agence dans l'organigramme"
                        />
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex justify-between">
                      <button type="button" onClick={handleBack} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                        <FaArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="flex space-x-3">
                        <button type="button" onClick={handleBack} className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          Annuler
                        </button>
                        <button type="submit" className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                          <FaSave className="mr-2" />
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Organigramme */}
                <div className="w-full lg:w-1/2 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
                  <div className="bg-white rounded-lg shadow">
                    <div className="bg-red-600 text-white p-4 rounded-t-lg">
                      <h3 className="text-lg font-semibold">Sélectionner l'affectation dans l'organigramme</h3>
                      <p className="text-sm text-red-100">Cliquez sur un élément pour définir l'affectation</p>
                    </div>
                    
                    {organigrammeLoading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Chargement de l'organigramme...</p>
                      </div>
                    ) : organigrammeError ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800">Erreur: {organigrammeError}</p>
                      </div>
                    ) : (
                      <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="space-y-1">
                          {treeData.map((node) => (
                            <TreeNode key={node.id} node={node} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de modification du mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Modifier le mot de passe</h2>
            
            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Mot de passe modifié avec succès !
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                  />
                  {passwordErrors.current_password && (
                    <p className="text-red-500 text-sm">{passwordErrors.current_password[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-red-500 text-sm">{passwordErrors.new_password[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700"
                  />
                </div>

                {passwordErrors.general && (
                  <p className="text-red-500 text-sm">{passwordErrors.general}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {passwordLoading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUserForm;