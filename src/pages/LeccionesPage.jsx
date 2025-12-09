import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LeccionesPage = () => {
  const { temaId } = useParams();
  const navigate = useNavigate();
  
  const [lecciones, setLecciones] = useState([]);
  const [temaInfo, setTemaInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // FORM — sin contenido_teorico
  const [formData, setFormData] = useState({
    titulo_leccion: '',
    orden: '',
    tiempo_limite_segundos: 1200,
    gemas: 50,
    puntos_experiencia: 100
  });

  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const temaRes = await api.get(`/temas/${temaId}`);
      setTemaInfo(temaRes.data);

      const leccionesRes = await api.get(`/temas/${temaId}/lecciones`);
      setLecciones(leccionesRes.data);
    } catch (error) {
      toast.error('Error al cargar lecciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [temaId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        tema_id: temaId,
        orden: Number(formData.orden),
        tiempo_limite_segundos: Number(formData.tiempo_limite_segundos),
        gemas: Number(formData.gemas),
        puntos_experiencia: Number(formData.puntos_experiencia)
      };

      if (currentItem) {
        await api.put(`/lecciones/${currentItem.id}`, payload);
        toast.success('Lección actualizada');
      } else {
        await api.post('/lecciones', payload);
        toast.success('Lección creada');
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
    if (!window.confirm(`¿Borrar "${item.titulo_leccion}"?`)) return;

    try {
      await api.delete(`/lecciones/${item.id}`);
      toast.success('Eliminada');
      fetchData();
    } catch (error) {
      toast.error('No se puede eliminar (tiene preguntas)');
    }
  };

  const handleViewPreguntas = (item) => {
    navigate(`/lecciones/${item.id}/preguntas`);
  };

  const openModal = (item = null) => {
    setCurrentItem(item);

    if (item) {
      api.get(`/lecciones/${item.id}`).then(res => {
        const d = res.data;
        setFormData({
          titulo_leccion: d.titulo_leccion,
          orden: d.orden,
          tiempo_limite_segundos: d.tiempo_limite_segundos || 1200,
          gemas: d.gemas || 50,
          puntos_experiencia: d.puntos_experiencia || 100
        });
      });
    } else {
      setFormData({
        titulo_leccion: '',
        orden: lecciones.length + 1,
        tiempo_limite_segundos: 1200,
        gemas: 50,
        puntos_experiencia: 100
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const columns = [
    { header: 'Orden', accessor: 'orden' },
    { header: 'Título', accessor: 'titulo_leccion' },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lecciones (Quizzes)</h1>
            <p className="text-gray-500 text-sm">
              {loading ? 'Cargando...' : `Tema: ${temaInfo?.nombre_tema}`}
            </p>
          </div>
        </div>

        <button 
          onClick={() => openModal()} 
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nueva Lección
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={lecciones} 
        onEdit={openModal} 
        onDelete={handleDelete}
        onView={handleViewPreguntas}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={currentItem ? 'Editar Lección' : 'Nueva Lección'}
      >
        <form onSubmit={handleSave} className="space-y-4">

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                required
                value={formData.titulo_leccion}
                onChange={e => setFormData({ ...formData, titulo_leccion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Ej: Quiz de Álgebra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                required
                value={formData.orden}
                onChange={e => setFormData({ ...formData, orden: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* RECOMPENSAS */}
          <div className="grid grid-cols-3 gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="col-span-3 text-xs font-bold text-yellow-700 uppercase tracking-wide">
              Recompensas al Aprobar
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">XP (Experiencia)</label>
              <input
                type="number"
                required
                value={formData.puntos_experiencia}
                onChange={e => setFormData({ ...formData, puntos_experiencia: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gemas</label>
              <input
                type="number"
                required
                value={formData.gemas}
                onChange={e => setFormData({ ...formData, gemas: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tiempo (segundos)</label>
              <input
                type="number"
                value={formData.tiempo_limite_segundos}
                onChange={e => setFormData({ ...formData, tiempo_limite_segundos: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 bg-gray-100 rounded-lg">
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};

export default LeccionesPage;
