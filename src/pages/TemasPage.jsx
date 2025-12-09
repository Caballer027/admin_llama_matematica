import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';
import { Plus, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const TemasPage = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  
  const [temas, setTemas] = useState([]);
  const [cursoInfo, setCursoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [txtData, setTxtData] = useState({
    nombre_tema: '',
    orden: '',
    titulo_pregunta: '',
    historia_introduccion: '',
    historia_nudo: '',
    historia_desenlace: ''
  });

  const [files, setFiles] = useState({
    imagen_inicio: null,
    imagen_nudo: null,
    imagen_desenlace: null
  });

  const [isSaving, setIsSaving] = useState(false);

  // =====================================
  // 1. Cargar Curso + Temas
  // =====================================
  const fetchData = async () => {
    try {
      const cursoRes = await api.get(`/cursos/${cursoId}`);
      setCursoInfo(cursoRes.data);

      const temasRes = await api.get(`/cursos/${cursoId}/temario`);
      setTemas(temasRes.data);
    } catch (error) {
      toast.error('Error al cargar temas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cursoId]);

  // =====================================
  // 2. Guardar Tema (FormData)
  // =====================================
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('curso_id', cursoId);

      Object.keys(txtData).forEach(key => {
        formData.append(key, txtData[key]);
      });

      if (files.imagen_inicio) formData.append('imagen_inicio', files.imagen_inicio);
      if (files.imagen_nudo) formData.append('imagen_nudo', files.imagen_nudo);
      if (files.imagen_desenlace) formData.append('imagen_desenlace', files.imagen_desenlace);

      if (currentItem) {
        await api.put(`/temas/${currentItem.id}`, formData);
        toast.success('Tema actualizado');
      } else {
        await api.post('/temas', formData);
        toast.success('Tema creado');
      }

      fetchData();
      closeModal();

    } catch (error) {
      console.error(error);
      toast.error('Error al guardar. Revisa los campos.');
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================
  // 3. Eliminar Tema
  // =====================================
  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar el tema "${item.nombre_tema}"?`)) return;
    try {
      await api.delete(`/temas/${item.id}`);
      toast.success('Eliminado');
      fetchData();
    } catch (error) {
      toast.error('No se puede eliminar (quizás tiene lecciones)');
    }
  };

  // =====================================
  // 4. Ir a Lecciones
  // =====================================
  const handleViewLecciones = (item) => {
    navigate(`/temas/${item.id}/lecciones`);
  };

  // =====================================
  // --- OPEN MODAL CORREGIDO ---
  // =====================================
  const openModal = async (item = null) => {
    setCurrentItem(item);

    if (item) {
      try {
        const detalle = await api.get(`/temas/${item.id}`);
        const d = detalle.data;

        setTxtData({
          nombre_tema: d.nombre_tema,
          orden: d.orden,
          titulo_pregunta: d.titulo_pregunta || '',
          historia_introduccion: d.historia_introduccion || '',
          historia_nudo: d.historia_nudo || '',
          historia_desenlace: d.historia_desenlace || ''
        });

        // 🔥 Clave: Aquí llega la data con URLs de imágenes
        setCurrentItem(d);

      } catch (error) {
        console.error(error);
        toast.error("Error al cargar detalles");
      }
    } else {
      setTxtData({
        nombre_tema: '',
        orden: temas.length + 1,
        titulo_pregunta: '',
        historia_introduccion: '',
        historia_nudo: '',
        historia_desenlace: ''
      });

      setCurrentItem(null);
    }

    setFiles({ imagen_inicio: null, imagen_nudo: null, imagen_desenlace: null });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // =====================================
  // Tabla
  // =====================================
  const columns = [
    { header: 'Semana', accessor: 'semana' },
    { header: 'Nombre del Tema', accessor: 'nombre_tema' },
  ];

  const handleTxtChange = (e) => {
    setTxtData({ ...txtData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cursos')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Temario</h1>
            <p className="text-gray-500 text-sm">
              {loading ? 'Cargando...' : `Curso: ${cursoInfo?.nombre_curso}`}
            </p>
          </div>
        </div>

        <button 
          onClick={() => openModal()} 
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Tema
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={temas} 
        onEdit={openModal} 
        onDelete={handleDelete}
        onView={handleViewLecciones}
      />

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Historia' : 'Nueva Historia'}>
        <form onSubmit={handleSave} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          
          {/* BASICS */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Nombre del Tema</label>
              <input required name="nombre_tema" value={txtData.nombre_tema} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input type="number" required name="orden" value={txtData.orden} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* HISTORIA */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Narrativa de la Historia
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pregunta del Capítulo (Título)</label>
              <input required name="titulo_pregunta" value={txtData.titulo_pregunta} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" placeholder="¿Qué aprenderemos hoy?" />
            </div>

            {/* Introducción */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
              <h5 className="text-sm font-bold text-gray-600">Parte 1: Introducción</h5>
              <textarea name="historia_introduccion" rows="3" value={txtData.historia_introduccion} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" />
              <ImageUpload 
                label="Imagen Introducción"
                currentImageUrl={currentItem?.url_imagen_inicio}
                onFileSelect={(file) => setFiles({...files, imagen_inicio: file})}
              />
            </div>

            {/* Nudo */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
              <h5 className="text-sm font-bold text-gray-600">Parte 2: Nudo (Problema)</h5>
              <textarea name="historia_nudo" rows="3" value={txtData.historia_nudo} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" />
              <ImageUpload 
                label="Imagen Nudo"
                currentImageUrl={currentItem?.url_imagen_nudo}
                onFileSelect={(file) => setFiles({...files, imagen_nudo: file})}
              />
            </div>

            {/* Desenlace */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="text-sm font-bold text-gray-600">Parte 3: Desenlace (Solución)</h5>
              <textarea name="historia_desenlace" rows="3" value={txtData.historia_desenlace} onChange={handleTxtChange} className="w-full border rounded-lg px-3 py-2" />
              <ImageUpload 
                label="Imagen Desenlace"
                currentImageUrl={currentItem?.url_imagen_desenlace}
                onFileSelect={(file) => setFiles({...files, imagen_desenlace: file})}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Historia
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};

export default TemasPage;
