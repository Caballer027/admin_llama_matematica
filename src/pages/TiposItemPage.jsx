import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Loader2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const TiposItemPage = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [nombre, setNombre] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTipos = async () => {
    try {
      const res = await api.get('/tienda/tipos');
      setTipos(res.data);
    } catch (error) {
      toast.error('Error al cargar tipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentItem) {
        await api.put(`/tienda/tipos/${currentItem.id}`, { nombre_tipo: nombre });
        toast.success('Categoría actualizada');
      } else {
        await api.post('/tienda/tipos', { nombre_tipo: nombre });
        toast.success('Categoría creada');
      }
      fetchTipos();
      closeModal();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Borrar categoría "${item.nombre_tipo}"?`)) return;
    try {
      await api.delete(`/tienda/tipos/${item.id}`);
      toast.success('Eliminado');
      fetchTipos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    setNombre(item ? item.nombre_tipo : '');
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre de Categoría', accessor: 'nombre_tipo' },
  ];

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías de Tienda</h1>
          <p className="text-gray-500 text-sm">Gestiona los tipos de items (Polos, Fondos, etc).</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <DataTable columns={columns} data={tipos} onEdit={openModal} onDelete={handleDelete} />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                required 
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Ej: Mochilas"
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TiposItemPage;