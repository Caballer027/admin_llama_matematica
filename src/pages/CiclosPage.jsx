import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CiclosPage = () => {
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', numero: '' });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cargar Ciclos
  const fetchCiclos = async () => {
    try {
      const response = await api.get('/ciclos');
      setCiclos(response.data);
    } catch (error) {
      toast.error('Error al cargar ciclos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCiclos();
  }, []);

  // 2. Handlers CRUD
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Aseguramos que numero sea un entero
      const payload = { ...formData, numero: parseInt(formData.numero) };

      if (currentItem) {
        await api.put(`/ciclos/${currentItem.id}`, payload);
        toast.success('Ciclo actualizado');
      } else {
        await api.post('/ciclos', payload);
        toast.success('Ciclo creado');
      }
      fetchCiclos();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Borrar "${item.nombre}"?`)) return;
    try {
      await api.delete(`/ciclos/${item.id}`);
      toast.success('Eliminado');
      fetchCiclos();
    } catch (error) {
      toast.error('No se puede eliminar (tiene cursos asociados)');
    }
  };

  // Helpers Modal
  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData({ nombre: item.nombre, numero: item.numero });
    } else {
      setFormData({ nombre: '', numero: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre del Ciclo', accessor: 'nombre' },
    { header: 'Número (Orden)', accessor: 'numero' },
  ];

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ciclos Académicos</h1>
          <p className="text-gray-500 text-sm">Gestiona los niveles de estudio.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Ciclo
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={ciclos} 
        onEdit={openModal} 
        onDelete={handleDelete} 
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Ciclo' : 'Nuevo Ciclo'}>
        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: Tercer Ciclo"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Orden</label>
            <input
              type="number"
              required
              min="1"
              max="20"
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: 3"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Se usa para ordenar los cursos (1ro, 2do...).</p>
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

export default CiclosPage;