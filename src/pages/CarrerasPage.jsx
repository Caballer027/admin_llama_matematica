import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CarrerasPage = () => {
  const { id } = useParams(); // Obtenemos el ID de la institución de la URL
  const navigate = useNavigate();
  
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institucionNombre, setInstitucionNombre] = useState('');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cargar Carreras de esta Institución
  const fetchCarreras = async () => {
    try {
      // Usamos el endpoint de filtrado que creamos en el backend
      const response = await api.get(`/carreras/institucion/${id}`);
      setCarreras(response.data);
      
      // Truco visual: Si hay carreras, sacamos el nombre de la institución de la primera
      // Si no, podríamos hacer un fetch extra a /instituciones/:id, pero esto ahorra una llamada
      if (response.data.length > 0) {
        setInstitucionNombre(response.data[0].nombre_institucion || 'la Institución');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar carreras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, [id]);

  // 2. Handlers CRUD
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentItem) {
        await api.put(`/carreras/${currentItem.id}`, { ...formData, institucion_id: id });
        toast.success('Carrera actualizada');
      } else {
        await api.post('/carreras', { ...formData, institucion_id: id });
        toast.success('Carrera creada');
      }
      fetchCarreras();
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
      await api.delete(`/carreras/${item.id}`);
      toast.success('Eliminada');
      fetchCarreras();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // Helpers Modal
  const openModal = (item = null) => {
    setCurrentItem(item);
    setFormData({ nombre: item ? item.nombre : '' });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre de la Carrera', accessor: 'nombre' },
  ];

  return (
    <div className="space-y-6">
      {/* Header con Botón Volver */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/instituciones')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Carreras</h1>
            <p className="text-gray-500 text-sm">Gestión académica de {institucionNombre}</p>
          </div>
        </div>
        
        <button onClick={() => openModal()} className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </button>
      </div>

      {loading ? (
        <div className="text-center p-10">Cargando carreras...</div>
      ) : (
        <DataTable 
          columns={columns} 
          data={carreras} 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      )}

      {/* Modal Formulario */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Carrera' : 'Nueva Carrera'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: Desarrollo de Software"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
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

export default CarrerasPage;