import React, { useState, useEffect } from "react";
import Select from "react-select";
import SidebarEmploye from "../../components/Employe/EmployeeSidebar";
import API from "../../api/axios";

export default function FaireDemande() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [produits, setProduits] = useState([]);
  const [selectedProduits, setSelectedProduits] = useState([]);
  const [quantites, setQuantites] = useState({});
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
      const response = await API.get('/employe/voirStock');
      
      // Adapter selon la structure de votre réponse API
      const produitsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setProduits(produitsData.map(prod => ({ 
        value: prod.id,
        label: `${prod.nom_produit} (${prod.famille} - ${prod.sous_famille})`
      })));

    } catch (err) {
      console.error("Erreur chargement produits :", err);
      setError("Impossible de charger la liste des produits");
    }
  };

  const handleAddProduit = (selectedOption) => {
    if (selectedOption && !selectedProduits.find(p => p.value === selectedOption.value)) {
      setSelectedProduits([...selectedProduits, selectedOption]);
      setQuantites({...quantites, [selectedOption.value]: 1});
    }
  };

  const handleRemoveProduit = (produitId) => {
    setSelectedProduits(selectedProduits.filter(p => p.value !== produitId));
    
    const newQuantites = {...quantites};
    delete newQuantites[produitId];
    setQuantites(newQuantites);
  };

  const handleQuantiteChange = (produitId, newQuantite) => {
    setQuantites({...quantites, [produitId]: parseInt(newQuantite) || 1});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      return;
    }
    
    for (const produit of selectedProduits) {
      const quantite = quantites[produit.value];
      if (!quantite || quantite <= 0) {
        setError(`Veuillez saisir une quantité valide pour ${produit.label}`);
        return;
      }
    }
    
    if (!raison.trim()) {
      setError("Veuillez saisir une raison pour la demande");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Préparer le payload selon le nouveau format
      const produitsPayload = selectedProduits.map(produit => ({
        product_id: produit.value,
        quantite: quantites[produit.value]
      }));

      const payload = {
        raison: raison.trim(),
        produits: produitsPayload
      };

      console.log('Envoi payload:', payload); // Debug

      const response = await API.post('/employe/demandes', payload);
      
      console.log('Réponse API:', response.data); // Debug

      // Gestion de la réponse
      if (response.data && (response.data.demande || response.status === 200 || response.status === 201)) {
        setSuccess("Demande envoyée avec succès ! (État: en attente)");
        
        // Réinitialiser le formulaire
        setSelectedProduits([]);
        setQuantites({});
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

          <div className="max-w-4xl mx-auto p-6">
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
                  📋 Nouvelle demande de produits
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  Remplissez tous les champs pour soumettre votre demande
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Sélection des produits */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    🔍 Produits demandés <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={produits}
                    value={null}
                    onChange={handleAddProduit}
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
                  
                  {/* Liste des produits sélectionnés */}
                  {selectedProduits.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {selectedProduits.map(produit => (
                        <div key={produit.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">{produit.label}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              className="w-20 p-2 border border-gray-300 rounded text-black"
                              placeholder="Qté"
                              value={quantites[produit.value] || 1}
                              onChange={(e) => handleQuantiteChange(produit.value, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveProduit(produit.value)}
                              className="text-red-600 hover:text-red-800 font-bold text-lg"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Raison */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    📝 Raison de la demande <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-red-100 focus:border-red-500 text-black resize-none transition-all duration-200"
                    placeholder="Expliquez pourquoi vous avez besoin de ces produits..."
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
                      setSelectedProduits([]);
                      setQuantites({});
                      setRaison("");
                      setError('');
                      setSuccess('');
                    }}
                  >
                    🔄 Réinitialiser
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || selectedProduits.length === 0 || !raison.trim()}
                    className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 ${
                      loading || selectedProduits.length === 0 || !raison.trim()
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