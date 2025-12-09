import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CursosPage = () => {
  const navigate = useNavigate();
  
  // Estados de Datos
  const [cursos, setCursos] = useState([]);
  const [ciclos, setCiclos] = useState([]); // Para el Select
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nombre_curso: '', descripcion: '', ciclo_id: '' });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cargar Datos (Cursos y Ciclos en paralelo)
  const fetchData = async () => {
    try {
      const [cursosRes, ciclosRes] = await Promise.all([
        api.get('/cursos'),
        api.get('/ciclos')
      ]);
      setCursos(cursosRes.data);
      setCiclos(ciclosRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handlers CRUD
  const handleSave = async (e) => {
    e.preventDefault();
    // Aseguramos que ciclo_id es un número (aunque el campo en el estado es string del select)
    const payload = { ...formData, ciclo_id: Number(formData.ciclo_id) }; 

    if (!payload.ciclo_id) return toast.error('Selecciona un ciclo');
    
    setIsSaving(true);
    try {
      if (currentItem) {
        // Editar
        await api.put(`/cursos/${currentItem.id}`, payload);
        toast.success('Curso actualizado');
      } else {
        // Crear
        await api.post('/cursos', payload);
        toast.success('Curso creado');
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Borrar el curso "${item.nombre_curso}"?`)) return;
    try {
      await api.delete(`/cursos/${item.id}`);
      toast.success('Curso eliminado');
      fetchData();
    } catch (error) {
      toast.error('No se puede eliminar (quizás tiene temas asociados)');
    }
  };

  // 3. Navegación a Temas (Drill-down)
  const handleViewTemas = (item) => {
    navigate(`/cursos/${item.id}/temas`);
  };

  // Helpers Modal
  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData({ 
        nombre_curso: item.nombre_curso, 
        descripcion: item.descripcion || '', 
        // Aseguramos que el ciclo_id se carga como string para el select
        ciclo_id: String(item.ciclo_id) 
      });
    } else {
      setFormData({ nombre_curso: '', descripcion: '', ciclo_id: '' });
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  // Truco: Mapear el ID del ciclo al nombre para mostrarlo bonito en la tabla
  const cursosConNombreCiclo = cursos.map(c => {
    const cicloNombre = ciclos.find(cic => cic.id === c.ciclo_id)?.nombre || 'Sin ciclo';
    return { ...c, nombre_ciclo: cicloNombre };
  });

  // 🔥 COLUMNAS: Se agrega la descripción y se configura para que envuelva el texto
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Curso', accessor: 'nombre_curso' },
    { 
      header: 'Descripción', 
      accessor: 'descripcion', 
      // Permite que el texto se envuelva a múltiples líneas (sin scroll horizontal)
      render: (row) => (
        <p className="text-sm text-gray-700 whitespace-normal"> 
          {row.descripcion || ''}
        </p>
      )
    },
    { header: 'Ciclo', accessor: 'nombre_ciclo' }, // Usamos el campo calculado
    { header: 'Bloqueado', accessor: 'esta_bloqueado' },
  ];

  if (loading) return <div className="p-10 text-center">Cargando cursos...</div>;

  return (
    <div className="space-y-6">
      {/* Encabezado sin estilos de card */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Cursos</h1>
          <p className="text-gray-500 text-sm">Crea cursos y asigna sus temas.</p>
        </div>
        {/* Usé bg-indigo-600 como proxy para 'bg-primary' que no está definido en este snippet */}
        <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Curso
        </button>
      </div>

      {/* DataTable - Ahora sin el div extra de "card" */}
      <DataTable 
        columns={columns} 
        data={cursosConNombreCiclo} 
        onEdit={openModal} 
        onDelete={handleDelete}
        onView={handleViewTemas} 
      />

      {/* Modal de Creación/Edición */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Curso' : 'Nuevo Curso'}>
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Curso</label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              value={formData.nombre_curso}
              onChange={(e) => setFormData({ ...formData, nombre_curso: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          {/* Select de Ciclos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo Académico</label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary bg-white"
              value={formData.ciclo_id}
              onChange={(e) => setFormData({ ...formData, ciclo_id: e.target.value })}
            >
              <option value="">-- Selecciona un ciclo --</option>
              {ciclos.map(ciclo => (
                <option key={ciclo.id} value={ciclo.id}>
                  {ciclo.nombre} (Ciclo {ciclo.numero})
                </option>
              ))}
            </select>
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

export default CursosPage;