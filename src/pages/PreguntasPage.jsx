import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Plus, ArrowLeft, Trash2, CheckCircle, Circle, Loader2, BookOpen, Edit, AlertTriangle, Image as ImageIcon, ListPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const PreguntasPage = () => {
  const { leccionId } = useParams();
  const navigate = useNavigate();
  
  const [leccion, setLeccion] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // --- FORMULARIO PREGUNTA ---
  const [tipo, setTipo] = useState('opcion_multiple'); 
  const [enunciado, setEnunciado] = useState('');
  const [puntos, setPuntos] = useState(5);
  
  // --- FORMULARIO OPCIONES ---
  const [opciones, setOpciones] = useState([
    { texto: '', es_correcta: false, imagen: null },
    { texto: '', es_correcta: false, imagen: null }
  ]);
  const [respuestaAbierta, setRespuestaAbierta] = useState('');

  // --- FORMULARIO GUÍA DE PASOS (NUEVO) ---
  // Ahora es un array de objetos, no un texto plano
  const [pasosGuia, setPasosGuia] = useState([
    { titulo: '', texto: '' }
  ]);

  // Cálculo de Nota
  const puntajeActual = useMemo(() => {
    const totalDB = preguntas.reduce((sum, p) => sum + (Number(p?.puntos_otorgados) || 0), 0);
    const resta = Number(currentItem?.puntos_otorgados) || 0;
    return totalDB - resta;
  }, [preguntas, currentItem]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/lecciones/${leccionId}`);
      setLeccion(response.data);
      setPreguntas(response.data.preguntas || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leccionId]);

  // --- LOGICA DE OPCIONES ---
  useEffect(() => {
    if (tipo === 'verdadero_falso') {
      setOpciones([
        { texto: 'Verdadero', es_correcta: true, imagen: null },
        { texto: 'Falso', es_correcta: false, imagen: null }
      ]);
    } else if (tipo === 'respuesta_abierta') {
      setOpciones([]);
    } else if (tipo === 'opcion_multiple' && opciones.length === 0) {
      setOpciones([{ texto: '', es_correcta: false }, { texto: '', es_correcta: false }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const handleAddOption = () => setOpciones([...opciones, { texto: '', es_correcta: false, imagen: null }]);
  const handleRemoveOption = (index) => setOpciones(opciones.filter((_, i) => i !== index));
  const handleChangeOptionText = (index, text) => {
    const newOps = [...opciones];
    newOps[index].texto = text;
    setOpciones(newOps);
  };
  const handleChangeOptionImage = (index, file) => {
    const newOps = [...opciones];
    newOps[index].imagen = file;
    setOpciones(newOps);
  };
  const handleSetCorrect = (index) => {
    const newOps = opciones.map((op, i) => ({ ...op, es_correcta: i === index }));
    setOpciones(newOps);
  };

  // --- LOGICA DE PASOS GUÍA (NUEVO) ---
  const handleAddPaso = () => {
    setPasosGuia([...pasosGuia, { titulo: '', texto: '' }]);
  };

  const handleRemovePaso = (index) => {
    setPasosGuia(pasosGuia.filter((_, i) => i !== index));
  };

  const handleChangePaso = (index, field, value) => {
    const newPasos = [...pasosGuia];
    newPasos[index][field] = value;
    setPasosGuia(newPasos);
  };

  // --- ABRIR MODAL ---
  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      // EDICIÓN
      setTipo(item.tipo_pregunta);
      setEnunciado(item.enunciado_pregunta);
      setPuntos(Number(item.puntos_otorgados) || 5);
      
      // PARSEO INTELIGENTE DE LA GUÍA (Para que se vea bonito)
      let guiaParseada = [];
      const guiaRaw = item.pasos_guia;

      try {
        if (Array.isArray(guiaRaw)) {
          // Caso 1: Ya es un array (Seed o guardado nuevo)
          guiaParseada = guiaRaw.map(p => ({
            titulo: p.titulo || `Paso ${p.paso || '?'}`,
            texto: p.texto || ''
          }));
        } else if (typeof guiaRaw === 'string') {
          // Caso 2: Es un string JSON (Legacy)
          const parsed = JSON.parse(guiaRaw);
          if (Array.isArray(parsed)) {
            guiaParseada = parsed.map(p => ({ titulo: p.titulo, texto: p.texto }));
          } else {
            // Caso raro: String plano
            guiaParseada = [{ titulo: 'Paso 1', texto: guiaRaw }];
          }
        } else if (guiaRaw && typeof guiaRaw === 'object') {
          // Caso 3: Objeto simple (Legacy v1) {1: "texto"}
          guiaParseada = Object.values(guiaRaw).map((val, i) => ({
            titulo: `Paso ${i+1}`,
            texto: val
          }));
        }
      } catch (e) {
        console.error("Error parseando guia", e);
        guiaParseada = [{ titulo: 'Ayuda', texto: '' }];
      }

      if (guiaParseada.length === 0) guiaParseada.push({ titulo: '', texto: '' });
      setPasosGuia(guiaParseada);

      // Cargar Opciones
      if (item.tipo_pregunta === 'respuesta_abierta') {
        setRespuestaAbierta(item.respuesta_correcta_abierta || '');
        setOpciones([]);
      } else {
        setOpciones(item.opciones_respuesta?.map(op => ({
          texto: op.texto_respuesta,
          es_correcta: op.es_correcta,
          url_imagen: op.url_imagen
        })) || [{ texto: '', es_correcta: false }, { texto: '', es_correcta: false }]);
      }
    } else {
      // MODO NUEVO
      setTipo('opcion_multiple');
      setEnunciado('');
      setPuntos(5);
      setPasosGuia([{ titulo: '', texto: '' }]); // Un paso vacío por defecto
      setRespuestaAbierta('');
      setOpciones([{ texto: '', es_correcta: false }, { texto: '', es_correcta: false }]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null); 
  };

  // --- GUARDAR ---
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!enunciado.trim()) return toast.error('Falta el enunciado');
    
    // Validaciones
    if (tipo === 'respuesta_abierta') {
      if (!respuestaAbierta.trim()) return toast.error('Escribe la respuesta correcta');
    } else {
      if (tipo !== 'seleccionar_imagen' && opciones.some(op => !(op.texto && op.texto.toString().trim()))) 
        return toast.error('Completa los textos de las opciones');
      if (!opciones.some(op => op.es_correcta)) return toast.error('Marca la respuesta correcta');
    }

    // Validar Guía (Opcional, pero limpiamos vacíos)
    const pasosLimpios = pasosGuia
      .filter(p => p.texto.trim() !== '')
      .map((p, index) => ({
        paso: index + 1, // Numeración automática
        titulo: p.titulo || `Paso ${index + 1}`,
        texto: p.texto
      }));

    const nuevaSuma = puntajeActual + Number(puntos);
    if (nuevaSuma > 20) {
      if(!window.confirm(`La suma será ${nuevaSuma}/20. ¿Continuar?`)) return;
    }

    setIsSaving(true);
    try {
      const payload = {
        enunciado,
        tipo, 
        puntos: Number(puntos),
        opciones: opciones, 
        pasos_guia: pasosLimpios, // 🔥 Enviamos el Array limpio
        url_imagen_pregunta: null, 
        respuesta_correcta_abierta: (tipo === 'respuesta_abierta') ? respuestaAbierta : null
      };

      if (currentItem) {
        await api.put(`/lecciones/preguntas/${currentItem.id}`, payload);
        toast.success('Actualizado');
      } else {
        await api.post(`/lecciones/${leccionId}/preguntas`, payload);
        toast.success('Creado');
      }

      await fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Error al guardar';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Borrar?')) return;
    try {
      await api.delete(`/lecciones/preguntas/${id}`);
      await fetchData();
      toast.success('Eliminado');
    } catch (error) { toast.error('Error al eliminar'); }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-xl text-gray-800">Quiz: {leccion?.titulo_leccion}</h1>
        </div>
        <div className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
          Nota Total: {puntajeActual}/20
        </div>
        <button onClick={() => openModal(null)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Lista de Preguntas */}
      <div className="grid gap-4">
        {preguntas.map((preg, index) => (
          <div key={preg.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(preg)} className="text-indigo-500 bg-indigo-50 p-2 rounded-full"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(preg.id)} className="text-red-500 bg-red-50 p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
            </div>
            
            <div className="flex gap-4">
              <span className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded font-bold text-gray-600">{index + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800">{preg.enunciado_pregunta}</h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded h-fit">{(preg.tipo_pregunta || '').replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Vale {preg.puntos_otorgados} puntos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? "Editar Pregunta" : "Nueva Pregunta"}>
        <form onSubmit={handleSave} className="space-y-5 max-h-[80vh] overflow-y-auto pr-2">
          
          {/* Tipo y Puntos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                <option value="opcion_multiple">Opción Múltiple</option>
                <option value="verdadero_falso">Verdadero / Falso</option>
                <option value="respuesta_abierta">Respuesta Abierta</option>
                <option value="seleccionar_imagen">Selección de Imagen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Puntos</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" value={puntos} onChange={e => setPuntos(Number(e.target.value || 0))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Enunciado</label>
            <textarea required rows="2" className="w-full border rounded-lg px-3 py-2" value={enunciado} onChange={e => setEnunciado(e.target.value)} />
          </div>

          {/* Opciones */}
          {tipo === 'respuesta_abierta' ? (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-1">Respuesta Correcta</label>
              <input type="text" required className="w-full border border-blue-300 rounded-lg px-3 py-2" value={respuestaAbierta} onChange={e => setRespuestaAbierta(e.target.value)} />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">Opciones de Respuesta</label>
              <div className="space-y-3">
                {opciones.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <button type="button" onClick={() => handleSetCorrect(idx)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold ${op.es_correcta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {op.es_correcta ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      {tipo === 'seleccionar_imagen' ? (
                          <input type="file" className="text-sm text-gray-500" onChange={(e) => handleChangeOptionImage(idx, e.target.files[0])} />
                      ) : (
                          <input type="text" placeholder={`Opción ${idx + 1}`} className="w-full border-none outline-none bg-transparent text-sm" value={op.texto} readOnly={tipo === 'verdadero_falso'} onChange={(e) => handleChangeOptionText(idx, e.target.value)} />
                      )}
                    </div>
                    {tipo !== 'verdadero_falso' && (
                      <button type="button" onClick={() => handleRemoveOption(idx)} className="text-gray-400 hover:text-red-500 p-1" disabled={opciones.length <= 2}><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              {tipo !== 'verdadero_falso' && (
                <button type="button" onClick={handleAddOption} className="mt-4 text-sm text-primary hover:text-indigo-700 font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar otra opción</button>
              )}
            </div>
          )}

          {/* 🔥 GUÍA DE PASOS DINÁMICA 🔥 */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-800 mb-3">
              <BookOpen className="w-4 h-4" /> Guía de Solución Paso a Paso
            </h4>
            
            <div className="space-y-3">
              {pasosGuia.map((paso, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm flex flex-col gap-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-yellow-600 uppercase bg-yellow-100 px-2 py-0.5 rounded">Paso {idx + 1}</span>
                    <button type="button" onClick={() => handleRemovePaso(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  
                  {/* Título del Paso */}
                  <input 
                    type="text" 
                    placeholder="Título (Ej: Despejar X)" 
                    className="text-sm font-semibold text-gray-700 border-none p-0 focus:ring-0 placeholder-gray-300"
                    value={paso.titulo}
                    onChange={(e) => handleChangePaso(idx, 'titulo', e.target.value)}
                  />
                  
                  {/* Explicación */}
                  <textarea 
                    rows="2" 
                    placeholder="Explicación detallada..." 
                    className="w-full text-sm border border-gray-100 bg-gray-50 rounded-md px-2 py-1 focus:bg-white focus:ring-1 focus:ring-yellow-400"
                    value={paso.texto}
                    onChange={(e) => handleChangePaso(idx, 'texto', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddPaso} className="mt-3 text-xs font-bold text-yellow-700 hover:text-yellow-900 flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-lg transition-colors w-fit">
              <ListPlus className="w-4 h-4" /> Agregar Paso
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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

export default PreguntasPage;