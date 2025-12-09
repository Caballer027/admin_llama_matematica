import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';
import { Edit, Smile, Loader2, MessageCircle, Plus, Trash2, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const PersonajesPage = () => {
  const [personajes, setPersonajes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    asset_key: '', 
    mensaje_corta: '',
    mensaje_larga: ''
  });
  const [imagenFile, setImagenFile] = useState(null);

  // 🔥 HELPER: Limpiador de URLs de imágenes
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Ya es absoluta
    
    // Quitamos la barra inicial si existe para evitar dobles //
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Si la ruta dice "assets/" pero la carpeta real es "personajes/", lo corregimos visualmente (parche temporal)
    // Lo ideal es borrar y crear de nuevo el personaje, pero esto ayuda a ver los viejos.
    if (cleanPath.startsWith('assets/')) {
        return `http://localhost:3000/${cleanPath.replace('assets/', 'personajes/')}`;
    }

    return `http://localhost:3000/${cleanPath}`;
  };

  // 1. Cargar Personajes
  const fetchPersonajes = async () => {
    try {
      const res = await api.get('/personajes');
      setPersonajes(res.data);
    } catch (error) {
      toast.error('Error al cargar personajes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonajes();
  }, []);

  // 2. Guardar
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('asset_key', formData.asset_key);
      data.append('mensaje_corta', formData.mensaje_corta);
      data.append('mensaje_larga', formData.mensaje_larga);
      
      if (imagenFile) {
        data.append('imagen', imagenFile);
      }

      if (currentItem) {
        await api.put(`/personajes/${currentItem.id}`, data);
        toast.success('Personaje actualizado');
      } else {
        if (!imagenFile) {
           toast.error("La imagen es obligatoria");
           setIsSaving(false);
           return;
        }
        await api.post('/personajes', data);
        toast.success('Personaje creado');
      }
      
      fetchPersonajes();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Eliminar
  const handleDelete = async (id, nombre) => {
    if(!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await api.delete(`/personajes/${id}`);
      toast.success('Eliminado');
      fetchPersonajes();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  // Helpers Modal
  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData({
        nombre: item.nombre,
        asset_key: item.asset_key,
        mensaje_corta: item.mensaje_corta || '',
        mensaje_larga: item.mensaje_larga || ''
      });
    } else {
      setFormData({
        nombre: '',
        asset_key: '',
        mensaje_corta: '',
        mensaje_larga: ''
      });
    }
    setImagenFile(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  if (loading) return <div className="p-10 text-center">Cargando personajes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personajes</h1>
          <p className="text-gray-500 text-sm">Personaliza los avatares.</p>
        </div>
        <button onClick={() => openModal(null)} className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Personaje
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avatar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensajes</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personajes.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* 🔥 USAMOS EL HELPER getImageUrl AQUÍ */}
                  {p.url_imagen_base ? (
                    <img 
                      src={getImageUrl(p.url_imagen_base)} 
                      alt={p.nombre} 
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 bg-gray-50"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50?text=?'} // Fallback
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Smile className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{p.nombre}</div>
                  <div className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{p.asset_key}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 mb-1"><span className="font-semibold text-xs text-gray-400 uppercase">Corto:</span> {p.mensaje_corta}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs"><span className="font-semibold text-gray-400 uppercase">Largo:</span> {p.mensaje_larga}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.nombre)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {personajes.length === 0 && <div className="p-10 text-center text-gray-500">No hay personajes.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? `Editar: ${currentItem.nombre}` : 'Nuevo Personaje'}>
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input required className="w-full px-3 py-2 border rounded-lg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Key className="w-3 h-3" /> Asset Key
              </label>
              <input 
                required 
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase bg-gray-50" 
                value={formData.asset_key} 
                readOnly={!!currentItem} // Solo lectura al editar
                onChange={e => setFormData({...formData, asset_key: e.target.value.toUpperCase().replace(/\s/g, '_')})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <MessageCircle className="w-3 h-3" /> Frase Corta
              </label>
              <input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.mensaje_corta} onChange={e => setFormData({...formData, mensaje_corta: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frase Larga</label>
              <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows="1" value={formData.mensaje_larga} onChange={e => setFormData({...formData, mensaje_larga: e.target.value})} />
            </div>
          </div>

          <div className="pt-2">
            {/* 🔥 USAMOS EL HELPER getImageUrl TAMBIÉN AQUÍ */}
            <ImageUpload 
              label="Avatar Base"
              currentImageUrl={getImageUrl(currentItem?.url_imagen_base)}
              onFileSelect={setImagenFile}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} {currentItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PersonajesPage;