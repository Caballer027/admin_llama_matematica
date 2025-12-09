import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 🔥 Importar navegación
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InstitucionesPage = () => {
  const navigate = useNavigate(); // <-- 🔥 Inicializar hook

  // --- Estados ---
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', dominio_correo: '' });
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Cargar Datos ---
  const fetchInstituciones = async () => {
    try {
      const response = await api.get('/instituciones');
      setInstituciones(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituciones();
  }, []);

  // --- 2. Modal ---
  const openModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ nombre: item.nombre, dominio_correo: item.dominio_correo || '' });
    } else {
      setCurrentItem(null);
      setFormData({ nombre: '', dominio_correo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ nombre: '', dominio_correo: '' });
    setCurrentItem(null);
  };

  // --- 3. Guardar ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (currentItem) {
        await api.put(`/instituciones/${currentItem.id}`, formData);
        toast.success('Institución actualizada');
      } else {
        await api.post('/instituciones', formData);
        toast.success('Institución creada');
      }

      fetchInstituciones();
      closeModal();

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Error al guardar';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. Eliminar ---
  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre}"?`)) return;

    try {
      await api.delete(`/instituciones/${item.id}`);
      toast.success('Eliminado correctamente');
      fetchInstituciones();
    } catch (error) {
      const msg = error.response?.data?.error || 'No se pudo eliminar';
      toast.error(msg);
    }
  };

  // --- 5. Nueva función: Ver Carreras ---
  const handleViewCarreras = (item) => {
    navigate(`/instituciones/${item.id}/carreras`);
  };

  // Configuración Tabla
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Instituciones</h1>
          <p className="text-gray-500 text-sm">Gestiona los centros educativos.</p>
        </div>

        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Institución
        </button>
      </div>

      {/* Tabla */}
      <DataTable 
        columns={columns}
        data={instituciones}
        onEdit={(item) => openModal(item)}
        onDelete={handleDelete}
        onView={handleViewCarreras}   // <-- 🔥 Conectar botón LIST
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentItem ? 'Editar Institución' : 'Nueva Institución'}
      >
        <form onSubmit={handleSave} className="space-y-4">

          {/* Input Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: Senati"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Dominio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dominio de Correo (Opcional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: senati.pe"
              value={formData.dominio_correo}
              onChange={(e) => setFormData({ ...formData, dominio_correo: e.target.value })}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white bg-primary hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:bg-indigo-300"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default InstitucionesPage;
