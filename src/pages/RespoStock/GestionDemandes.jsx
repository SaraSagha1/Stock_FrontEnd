import React, { useState, useEffect } from 'react';
import { FaUser, FaFileAlt, FaBox, FaHashtag, FaBuilding, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import RespoSidebar from '../../components/respoStock/RespoSidebar';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const EmployeeRequests = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('employee-requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Charger les demandes depuis l'API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/demande/en_attente');
        setRequests(response.data || []);
      } catch (err) {
        toast.error('Erreur lors du chargement des demandes : ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Ouvre le modal d'approbation
  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  // Ouvre le modal de rejet
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirme l'approbation
  const confirmApprove = async () => {
    try {
      setLoading(true);
      await api.put(`/demande/${selectedRequest.id}/valider`);
      setRequests(requests.filter(request => request.id !== selectedRequest.id));
      toast.success('Demande approuvée avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'approbation : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowApproveModal(false);
      setSelectedRequest(null);
    }
  };

  // Confirme le rejet
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Veuillez saisir un motif de rejet');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/demande/${selectedRequest.id}/refuser`, {
        motif_rejet: rejectReason
      });
      setRequests(requests.filter(request => request.id !== selectedRequest.id));
      toast.success('Demande rejetée avec succès');
    } catch (err) {
      toast.error('Erreur lors du rejet : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  // Ferme les modals
  const closeModal = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  // Modal de confirmation générique
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* En-tête du modal */}
          <div className={`p-4 border-b ${confirmColor === 'bg-red-600' ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center">
              {confirmColor === 'bg-red-600' ? (
                <FaExclamationTriangle className="text-red-600 mr-3" />
              ) : (
                <FaInfoCircle className="text-green-600 mr-3" />
              )}
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
          </div>
          
          {/* Corps du modal */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">{message}</p>
            {children}
          </div>
          
          {/* Pied du modal */}
          <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${confirmColor} text-white rounded-lg hover:${confirmColor.replace('bg-', 'bg-').replace('600', '700')} transition`}
              disabled={loading}
            >
              {loading ? 'Traitement...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to extract hierarchy fields
  const getHierarchyFields = (hierarchy) => {
    if (!hierarchy || hierarchy.length === 0) {
      return { direction: 'Non défini', department: 'N/A', division: 'N/A' };
    }

    // Take the last 3 levels (most specific)
    const levels = hierarchy.slice(-3);
    // Assign fields based on position (from most specific to least specific)
    const division = levels[0]?.nom || 'N/A'; // Most specific level
    const department = levels[1]?.nom || 'N/A'; // Second most specific
    const direction = levels[2]?.nom || levels[1]?.nom || levels[0]?.nom || 'Non défini'; // Fallback to available levels

    return { direction, department, division };
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
            {/* En-tête */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaFileAlt className="mr-3" /> Demandes des Employés
                  </h2>
                  <p className="text-purple-100">{requests.length} demandes en attente</p>
                </div>
              </div>
            </div>

            {/* Liste des demandes sous forme de cartes */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-gray-500">Chargement...</span>
                  </div>
                </div>
              ) : requests.length > 0 ? (
                requests.map(request => {
                  const { direction, department, division } = getHierarchyFields(request.user?.organigramme?.hierarchy);
                  return (
                    <div key={request.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                      {/* En-tête de la carte */}
                      <div className="bg-purple-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-purple-800">{request.user?.name || 'Inconnu'}</h3>
                            <p className="text-sm text-purple-600">{request.user?.employe?.poste || 'Non défini'}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {formatDate(request.created_at) || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Corps de la carte */}
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <FaBuilding className="mr-2" />
                            <span className="text-gray-800">{direction}</span>
                          </div>
                        <div className="text-xs text-gray-400 pl-6">
                          <span className="text-gray-700">{department}</span> • <span className="text-gray-600">{division}</span>
                        </div>
                      </div>

                        <div className="mb-4">
                          <div className="flex items-center font-medium">
                            <FaBox className="mr-2 text-purple-500" />
                            <span>{request.produit?.name || 'Produit inconnu'}</span>
                          </div>
                          <div className="text-xs text-gray-500 pl-6">
                            Réf: {request.produit?.reference || 'N/A'}
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <FaHashtag className="mr-2 text-purple-500" />
                          <span className="font-medium">Quantité: {request.quantite || 0}</span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Motif:</span> {request.raison || 'Non spécifié'}
                          </p>
                        </div>
                      </div>

                      {/* Pied de carte avec actions */}
                      <div className="bg-gray-50 px-4 py-3 border-t flex justify-end space-x-3">
                        <button
                          onClick={() => openRejectModal(request)}
                          className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center transition"
                          disabled={loading}
                        >
                          <FaTimes className="mr-1" /> Refuser
                        </button>
                        <button
                          onClick={() => openApproveModal(request)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center transition"
                          disabled={loading}
                        >
                          <FaCheck className="mr-1" /> Approuver
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-purple-50 rounded-lg p-8">
                    <FaFileAlt className="text-purple-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande en attente</p>
                    <p className="text-sm text-gray-400 mt-2">Toutes les demandes ont été traitées</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'approbation */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={closeModal}
        onConfirm={confirmApprove}
        title="Confirmer l'approbation"
        message={`Voulez-vous approuver la demande de ${selectedRequest?.user?.name || 'cet employé'} pour le produit ${selectedRequest?.produit?.name || 'inconnu'} ?`}
        confirmText="Approuver"
        confirmColor="bg-green-600"
      />

      {/* Modal de rejet */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={closeModal}
        onConfirm={confirmReject}
        title="Confirmer le rejet"
        message={`Voulez-vous rejeter la demande de ${selectedRequest?.user?.name || 'cet employé'} ?`}
        confirmText="Rejeter"
        confirmColor="bg-red-600"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Motif du rejet"
          className="w-full p-2 border rounded-lg"
        />
      </ConfirmationModal>
    </div>
  );
};

export default EmployeeRequests;