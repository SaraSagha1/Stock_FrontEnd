import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemName = 'cet élément',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-out scale-100 hover:scale-[1.02]">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Confirmer la suppression</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors duration-200"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Êtes-vous sûr de vouloir supprimer <span className="font-medium text-red-600">{itemName}</span> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center disabled:opacity-50"
            disabled={loading}
          >
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            )}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;