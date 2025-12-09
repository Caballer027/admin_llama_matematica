// src/components/ImageUpload.jsx (CÓDIGO NUEVO COMPLETO)
import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ label, currentImageUrl, onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  // 🛑 ELIMINAMOS la URL hardcodeada de localhost
  // const API_URL = 'http://localhost:3000'; // <-- ELIMINAR

  useEffect(() => {
    if (currentImageUrl) {
      // currentImageUrl ya debe ser la URL COMPLETA de Cloudinary o una URL local (blob:)
      setPreview(currentImageUrl);
    } else {
      setPreview(null);
    }
    
    // Resetear la previsualización si la imagen actual cambia
  }, [currentImageUrl]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Enviamos el archivo real al componente padre
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    
    const fileInput = document.getElementById(`file-${label}`);
    if (fileInput) fileInput.value = '';
    
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center group min-h-[160px] flex flex-col justify-center items-center bg-white">
        
        {preview ? (
          <div className="relative inline-block w-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 w-full object-contain rounded-md shadow-sm mx-auto" 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/150?text=Error+Carga'; // Fallback
              }} 
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-transform transform hover:scale-110 z-10"
              title="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            className="text-gray-500 cursor-pointer w-full h-full flex flex-col items-center justify-center py-4" 
            onClick={() => document.getElementById(`file-${label}`).click()}
          >
            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
              <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-primary">Click para subir imagen</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 10MB</p>
          </div>
        )}

        <input 
          id={`file-${label}`}
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
