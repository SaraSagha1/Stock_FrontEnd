import React, { useState, useEffect } from "react";
import SidebarEmploye from "../../components/Employe/EmployeeSidebar";
import API from "../../api/axios"; // ton instance axios

export default function MesDemandes() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les demandes au montage
  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const response = await API.get("/employe/historiquesdemandes"); // route backend pour consulter les demandes
      console.log("Demandes reçues :", response.data);

      setDemandes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur chargement demandes :", err);
      setError("Impossible de charger vos demandes");
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
          {/* Barre rouge */}
          <div className="bg-red-800 text-white px-6 py-4 shadow-md">
            <h2 className="text-2xl font-bold">Mes demandes</h2>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center mt-10">Chargement des demandes...</p>
            ) : error ? (
              <p className="text-red-500 text-center mt-10">{error}</p>
            ) : demandes.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Aucune demande trouvée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-red-700 text-white uppercase text-sm tracking-wider">
                      <th className="p-3 text-left">Produit</th>
                      <th className="p-3 text-center">Quantité</th>
                      <th className="p-3 text-left">Raison</th>
                      <th className="p-3 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.map((demande) => (
                      <tr
                        key={demande.id}
                        className="border-b transition-colors duration-200 hover:bg-red-50"
                      >
                        <td className="p-3 text-gray-800 font-medium">
                          {demande.produit ? demande.produit.name : "N/A"}
                        </td>
                        <td className="p-3 text-center text-gray-700">{demande.quantite}</td>
                        <td className="p-3 text-gray-700">{demande.raison}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              demande.etat === "En attente"
                                ? "bg-yellow-100 text-yellow-800"
                                : demande.etat === "Validée"
                                ? "bg-green-100 text-green-800"
                                : demande.etat === "Refusée"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {demande.etat}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
