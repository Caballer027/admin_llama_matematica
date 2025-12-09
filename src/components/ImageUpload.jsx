import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ label, currentImageUrl, onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  // URL Base de tu Backend (Ajusta si usas otro puerto)
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    if (currentImageUrl) {
      let url = currentImageUrl;

      // LÓGICA INTELIGENTE DE URL:
      // 1. Si ya es completa (http...) o local (blob...), la dejamos igual.
      // 2. Si es relativa (viene de la BD), le pegamos el dominio del backend.
      if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('blob:')) {
        
        // Aseguramos que no haya doble barra // al unir
        // Si la url de la BD empieza con /, la usamos tal cual: localhost:3000/historias/foto.jpg
        // Si tu backend sirve los archivos bajo '/uploads', descomenta la línea de abajo:
        // url = `/uploads${url.startsWith('/') ? '' : '/'}${url}`;
        
        url = `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, [currentImageUrl]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Creamos una URL temporal para ver la imagen que acabamos de elegir
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Enviamos el archivo real al componente padre
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    // Limpiamos el input file para permitir subir la misma imagen si el usuario se arrepiente
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
                e.target.src = 'https://via.placeholder.com/150?text=No+Encontrado'; // Fallback visual
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
            <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
          </div>
        )}

        <input 
          id={`file-${label}`}
          type="file" 
          accept="image/*"
          className="hidden" // Ocultamos el input feo original
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default ImageUpload;