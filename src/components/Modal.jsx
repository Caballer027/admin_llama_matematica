import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // 1. Fondo oscuro (Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. La Caja Blanca (Card) */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido (El Formulario irá aquí) */}
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;