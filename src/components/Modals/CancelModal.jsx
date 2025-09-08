import React from 'react';
import { FaTimes } from 'react-icons/fa';

const CancelModal = ({ isOpen, onClose, onConfirm, message = "Voulez-vous vraiment annuler ? Les modifications ne seront pas enregistrées." }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Confirmation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <div className="py-6">
          <p className="text-gray-700 text-center">{message}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
          >
            Non
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Oui
          </button>
        </div>
      </div>
    </div>
  );
};

// Animation CSS
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default CancelModal;