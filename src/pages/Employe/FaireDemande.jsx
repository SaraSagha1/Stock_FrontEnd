import React, { useState, useEffect } from "react";
import Select from "react-select";
import SidebarEmploye from "../../components/Employe/EmployeeSidebar";
import API from "../../api/axios";

export default function FaireDemande() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [quantite, setQuantite] = useState("");
  const [raison, setRaison] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger la liste des produits au montage
  useEffect(() => {
    chargerProduits();
  }, []);

  const chargerProduits = async () => {
    try {
      const response = await API.get('/employe/products');
      
      // Adapter selon la structure de votre réponse API
      const produitsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setProduits(produitsData.map(prod => ({ 
  value: prod.id,  // <-- c'est l'id qui sera envoyé au backend
  label: `${prod.name} (Stock: ${prod.quantite_stock || 0})`
})));

    } catch (err) {
      console.error("Erreur chargement produits :", err);
      setError("Impossible de charger la liste des produits");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!selectedProduit) {
      setError("Veuillez sélectionner un produit");
      return;
    }
    
    if (!quantite || quantite <= 0) {
      setError("Veuillez saisir une quantité valide");
      return;
    }
    
    if (!raison.trim()) {
      setError("Veuillez saisir une raison pour la demande");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Payload selon votre format API
      const payload = {
      produit_id: selectedProduit.value,  // <-- c'est l'ID maintenant
      quantite: quantite.toString(),
      raison: raison.trim()
    };


      console.log('Envoi payload:', payload); // Debug

      const response = await API.post('/employe/demandes', payload);
      
      console.log('Réponse API:', response.data); // Debug

      // Gestion de la réponse
      if (response.data && (response.data.id || response.status === 200 || response.status === 201)) {
        setSuccess("Demande envoyée avec succès ! (État: en attente)");
        
        // Réinitialiser le formulaire
        setSelectedProduit(null);
        setQuantite("");
        setRaison("");
        
        // Effacer le message de succès après 4 secondes
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(response.data.message || "Erreur lors de l'envoi de la demande");
      }
      
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      
      // Gestion des erreurs spécifiques
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Erreurs de validation Laravel
        const erreurs = Object.values(err.response.data.errors).flat();
        setError(erreurs.join(', '));
      } else {
        setError("Erreur de connexion au serveur");
      }
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
            <h2 className="text-2xl font-bold">Faire une demande</h2>
            <p className="text-red-100 mt-1">Demander des produits du stock</p>
          </div>

          <div className="max-w-2xl mx-auto p-6">
            {/* Messages d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2 text-xl">❌</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Messages de succès */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2 text-xl">✅</span>
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
                <h3 className="text-xl font-bold text-red-800">
                  📋 Nouvelle demande de produit
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  Remplissez tous les champs pour soumettre votre demande
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Sélection du produit */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    🔍 Produit demandé <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={produits}
                    value={selectedProduit}
                    onChange={setSelectedProduit}
                    placeholder="🔎 Tapez pour rechercher un produit..."
                    isSearchable
                    className="text-black"
                    classNamePrefix="select"
                    noOptionsMessage={() => "Aucun produit trouvé"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? '#dc2626' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : 'none',
                        '&:hover': { borderColor: '#9ca3af' },
                        padding: '4px'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#dc2626' : state.isFocused ? '#fef2f2' : 'white',
                        color: state.isSelected ? 'white' : '#374151'
                      })
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    💡 Le stock disponible est affiché entre parenthèses
                  </p>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    📦 Quantité demandée <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-red-100 focus:border-red-500 text-black text-lg transition-all duration-200"
                    placeholder="Ex: 5"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Saisissez un nombre entre 1 et 1000
                  </p>
                </div>

                {/* Raison */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    📝 Raison de la demande <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-red-100 focus:border-red-500 text-black resize-none transition-all duration-200"
                    placeholder="Expliquez pourquoi vous avez besoin de ce produit..."
                    value={raison}
                    onChange={(e) => setRaison(e.target.value)}
                    maxLength="300"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Soyez précis dans votre justification
                    </p>
                    <p className="text-xs text-gray-400">
                      {raison.length}/300 caractères
                    </p>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => {
                      setSelectedProduit(null);
                      setQuantite("");
                      setRaison("");
                      setError('');
                      setSuccess('');
                    }}
                  >
                    🔄 Réinitialiser
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !selectedProduit || !quantite || !raison.trim()}
                    className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 ${
                      loading || !selectedProduit || !quantite || !raison.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      '🚀 Envoyer la demande'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Informations sur le processus */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-blue-800">📋 Processus de demande</h4>
                  <div className="text-sm text-blue-700 mt-2 space-y-1">
                    <p>• <strong>État initial :</strong> Votre demande sera marquée "en attente"</p>
                    <p>• <strong>Validation :</strong> Le responsable stock examinera votre demande</p>
                    <p>• <strong>Décision :</strong> La demande sera "validée" ou "refusée"</p>
                    <p>• <strong>Notification :</strong> Vous serez informé de la décision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}