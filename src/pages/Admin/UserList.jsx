import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api/axios";
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaUserCog,
  FaUserTie,
  FaArrowLeft,
  FaPlus,
  FaSync
} from 'react-icons/fa';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('utilisateurs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const navigate = useNavigate();

  // Récupérer tous les utilisateurs avec leurs posts
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/usersview');
      
      // Vérifier si response.data est un tableau
      if (!Array.isArray(response.data)) {
        throw new Error('Format de données invalide');
      }
      
      // VÉRIFIER LA STRUCTURE RÉELLE DES DONNÉES
      console.log('Données reçues:', response.data);
      
      // Transformer les données - votre API renvoie déjà nomComplet et agence
      const usersWithPost = response.data.map(user => {
        return {
          id: user.id,
          nomComplet: user.nomComplet || '', // ← Utilisez nomComplet directement
          email: user.email || '',
          direction: user.direction || '',
          departement: user.departement || '',
          division: user.division || '',
          agence: user.agence || '', // ← Agence vient déjà de l'API
          role: user.role || '',
          poste: user.poste || '-', // ← poste vient déjà de l'API
          created_at: user.created_at,
          updated_at: user.updated_at
        };
      });
      
      setUsers(usersWithPost);
      setFilteredUsers(usersWithPost);
      
      // Extraire les rôles uniques pour le filtre
      const roles = [...new Set(usersWithPost.map(user => user.role))];
      setUniqueRoles(roles);
      
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage des utilisateurs
  useEffect(() => {
    let result = users;
    
    // Filtrer par nom (recherche insensible à la casse)
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      result = result.filter(user => user.nomComplet && user.nomComplet.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrer par rôle
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [nameFilter, roleFilter, users]);

  const handleEdit = (userId) => {
    navigate(`/admin/edit-user/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await API.delete(`/suppusers/${userId}`);
        // Recharger la liste après suppression
        await fetchUsers();
        alert('Utilisateur supprimé avec succès');
      } catch (err) {
        alert('Erreur lors de la suppression');
        console.error('Erreur:', err);
      }
    }
  };

  const handleAddUser = () => {
    navigate('/admin/createAcc');
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-red-700">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaUserCog className="mr-2" /> Gestion des Utilisateurs
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-white text-red-700 px-3 py-2 rounded-md flex items-center hover:bg-gray-100 transition-colors"
                title="Actualiser"
              >
                <FaSync />
              </button>
              <button
                onClick={handleAddUser}
                className="bg-white text-red-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-100 transition-colors"
              >
                <FaPlus className="mr-2" /> Ajouter
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        
          {/* Filtres */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Recherche par nom..."
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Tous les rôles</option>
                  {uniqueRoles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom Complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              {user.role === 'Responsable Stock' ? (
                                <FaUserTie className="text-red-600" />
                              ) : (
                                <FaUserCog className="text-green-700" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.nomComplet || 'Non spécifié'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.direction || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.departement || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.division || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.agence || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'Responsable Stock' 
                              ? 'bg-red-100 text-red-800' 
                              : user.role === 'Administrateur'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-green-800'
                          }`}>
                            {user.role || 'Non spécifié'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.poste || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-gray-700 hover:text-gray-900"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                        {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun résultat correspondant aux filtres'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 border-t border-gray-200 mt-auto">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} AL OMRANE - Tous droits réservés.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default UserList;