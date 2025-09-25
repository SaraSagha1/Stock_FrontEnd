import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FaUserEdit, FaArrowLeft } from 'react-icons/fa';
import OrganigrammeTree from './OrganigrammeTree';
import API from "../../api/axios";


const UserCreationForm = () => {


  const navigate = useNavigate();
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "Employé",
    password: "",
    confirmPassword: "",
    poste: "",
    organigramme_id: ""
  });

  const [showOrganigramme, setShowOrganigramme] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [activeMenu, setActiveMenu] = useState('enregistrement');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur modifie quelque chose
    if (error) setError(null);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setFormData(prev => ({
      ...prev,
      organigramme_id: node.id
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (formData.password !== formData.confirmPassword) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  if (formData.password.length < 8) {
    alert("Le mot de passe doit contenir au moins 8 caractères");
    return;
  }

  if (!formData.organigramme_id) {
    alert("Veuillez sélectionner une affectation dans l'organigramme");
    return;
  }

  setSubmitting(true);
  setError(null);

  // ✅ CORRECTION : Préparer le payload correctement
  const payload = {
    nom: formData.nom.trim(),
    prenom: formData.prenom.trim(),
    email: formData.email.trim(),
    password: formData.password,
    role: formData.role === "Employé" ? "employe" : 
          formData.role === "Responsable Stock" ? "responsablestock" : 
          formData.role === "Admin" ? "admin" : 
          formData.role.toLowerCase(),
    // ✅ AJOUTER le poste UNIQUEMENT pour le rôle "Employé"
    ...(formData.role === "Employé" && { poste: formData.poste.trim() }),
    organigramme_id: formData.organigramme_id
  };

  // ✅ Supprimer le poste si le rôle n'est pas "Employé"
  if (formData.role !== "Employé") {
    delete payload.poste;
  }

  console.log("Envoi des données:", payload);
  
  try {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token') ||
                  document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/, '$1');
    
    console.log("Token utilisé:", token);

    if (!token) {
      throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
    }

    const res = await fetch("http://127.0.0.1:8000/api/addUsers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Erreur lors de la création");
    }

    console.log("Utilisateur créé:", data);
    alert("Utilisateur créé avec succès !");
    
    // Réinitialiser le formulaire
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      role: "Employé",
      password: "",
      confirmPassword: "",
      poste: "",
      organigramme_id: ""
    });
    setSelectedNode(null);
    
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    setError(`Erreur: ${err.message}`);
    alert(`Erreur: ${err.message}`);
  } finally {
    setSubmitting(false);
  }
};

  const handleBack = () => navigate(-1);

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
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Message d'erreur global */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                {/* En-tête avec icône */}
                <div className="px-6 py-4 border-b border-gray-200 bg-red-700 flex items-center">
                  <FaUserEdit className="text-white mr-4" />
                  <h1 className="text-xl font-semibold text-white">Création d'un nouveau compte</h1>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Nom */}
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        placeholder="Saisir le nom..."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      />
                    </div>

                    {/* Prénom */}
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        placeholder="Saisir le prénom..."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email professionnel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="exemple@alomrane.ma"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      />
                    </div>

                    {/* Rôle */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rôle <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      >
                        <option value="Employé">Employé</option>
                        <option value="Responsable Stock">Responsable Stock</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    

                    {/* Poste (visible seulement si rôle est Employé) */}
                    {formData.role === "Employé" && (
                      <div>
                        <label htmlFor="poste" className="block text-sm font-medium text-gray-700">
                          Poste <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="poste"
                          name="poste"
                          value={formData.poste}
                          onChange={handleChange}
                          required={formData.role === "Employé"}
                          placeholder="Saisir le poste..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                        />
                      </div>
                    )}

                    {/* Section Affectation */}
                    <div className="sm:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                        Affectation organisationnelle
                      </h3>
                      
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setShowOrganigramme(!showOrganigramme)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          {showOrganigramme ? 'Masquer l\'organigramme' : 'Sélectionner dans l\'organigramme'}
                        </button>
                      </div>

                      {selectedNode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                          <h4 className="font-medium text-blue-800">Affectation sélectionnée:</h4>
                          <p className="text-blue-600">{selectedNode.nom} ({selectedNode.type})</p>
                          <p className="text-sm text-blue-500">ID: {selectedNode.id}</p>
                        </div>
                      )}

                      {showOrganigramme && (
                        <div className="border rounded-lg overflow-hidden mb-4">
                          <OrganigrammeTree 
                            onNodeSelect={handleNodeSelect}
                            selectedNode={selectedNode}
                          />
                        </div>
                      )}
                    </div>

                    {/* Section Sécurité */}
                    <div className="sm:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                        Informations de connexion
                      </h3>
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                        placeholder="••••••••"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
                    </div>

                    {/* Confirmation mot de passe */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-700 focus:border-red-700 sm:text-sm"
                      />
                      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      aria-label="Retour"
                    >
                      <FaArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            nom: "",
                            prenom: "",
                            email: "",
                            role: "Employé",
                            password: "",
                            confirmPassword: "",
                            poste: "",
                            organigramme_id: ""
                          });
                          setSelectedNode(null);
                          setError(null);
                        }}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? "Création en cours..." : "Créer le compte"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Pied de page */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>© {new Date().getFullYear()} AL OMRANE - Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserCreationForm;