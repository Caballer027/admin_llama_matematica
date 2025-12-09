import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';
import { Plus, Loader2, DollarSign, Shirt, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const TiendaPage = () => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [personajes, setPersonajes] = useState([]); // 🔥 NUEVO
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('info');

  // Formulario
  const [formData, setFormData] = useState({
    nombre_item: '',
    descripcion: '',
    costo_gemas: 50,
    tipo_item_id: ''
  });

  // Icono tienda
  const [imgIcono, setImgIcono] = useState(null);

  // 🔥 IMÁGENES DINÁMICAS PARA VARIANTES
  const [dynamicImages, setDynamicImages] = useState({});

  const handleDynamicImageChange = (assetKey, file) => {
    setDynamicImages(prev => ({ ...prev, [assetKey]: file }));
  };

  // Helper URL
  const getUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    const clean = path.startsWith('/') ? path.substring(1) : path;
    return `http://localhost:3000/${clean}`;
  };

  // ============================================================
  // 🔥 fetchData — ahora con personajes dinámicos
  // ============================================================
  const fetchData = async () => {
    try {
      const [itemsRes, tiposRes, personajesRes] = await Promise.all([
        api.get('/tienda/items'),
        api.get('/tienda/tipos'),
        api.get('/personajes') // 🔥 personajes
      ]);

      setItems(itemsRes.data);
      setTipos(tiposRes.data);
      setPersonajes(personajesRes.data);
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

  // ============================================================
  // 🔥 Guardar item (dinámico)
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.tipo_item_id) return toast.error('Selecciona un tipo de item');

    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('nombre_item', formData.nombre_item);
      data.append('descripcion', formData.descripcion);
      data.append('costo_gemas', formData.costo_gemas);
      data.append('tipo_item_id', formData.tipo_item_id);

      if (imgIcono) data.append('icono', imgIcono);

      // 🔥 Enviar imágenes dinámicas
      Object.keys(dynamicImages).forEach(key => {
        if (dynamicImages[key]) {
          data.append(`img_${key}`, dynamicImages[key]);
        }
      });

      if (currentItem) {
        await api.put(`/tienda/items/${currentItem.id}`, data);
        toast.success('Item actualizado');
      } else {
        await api.post('/tienda/items', data);
        toast.success('Item creado');
      }

      fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Borrar "${item.nombre_item}"?`)) return;
    try {
      await api.delete(`/tienda/items/${item.id}`);
      toast.success('Eliminado');
      fetchData();
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  // ============================================================
  // Abrir modal
  // ============================================================
  const openModal = (item = null) => {
    setCurrentItem(item);
    setActiveTab('info');

    if (item) {
      setFormData({
        nombre_item: item.nombre_item,
        descripcion: item.descripcion || '',
        costo_gemas: item.costo_gemas,
        tipo_item_id: item.tipo_item_id
      });
    } else {
      setFormData({
        nombre_item: '',
        descripcion: '',
        costo_gemas: 100,
        tipo_item_id: tipos.length > 0 ? tipos[0].id : ''
      });
    }

    setImgIcono(null);
    setDynamicImages({}); // 🔥 limpiar variantes

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // ============================================================
  // Aplanado de datos
  // ============================================================
  const itemsFormateados = items.map(item => ({
    ...item,
    nombre_tipo: item.tipos_item?.nombre_tipo || "Desconocido",
    url_icono_visual: getUrl(item.url_icono_tienda)
  }));

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Icono',
      render: (row) => (
        <img
          src={row.url_icono_visual}
          alt={row.nombre_item}
          className="h-10 w-10 object-contain bg-gray-50 rounded border mx-auto"
          onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=?'}
        />
      )
    },
    { header: 'Nombre', accessor: 'nombre_item' },
    { header: 'Costo', accessor: 'costo_gemas' },
    { header: 'Tipo', accessor: 'nombre_tipo' }
  ];

  const getEquipadoUrl = (assetKey) => {
    if (!currentItem?.url_imagenes_equipado) return null;
    return getUrl(currentItem.url_imagenes_equipado[assetKey]);
  };

  if (loading) return <div className="p-10 text-center">Cargando tienda...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tienda de Items</h1>
          <p className="text-gray-500 text-sm">Gestiona productos y sus variantes visuales.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Item
        </button>
      </div>

      {/* TABLA */}
      <DataTable
        columns={columns}
        data={itemsFormateados}
        onEdit={openModal}
        onDelete={handleDelete}
      />

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Editar Item' : 'Nuevo Producto'}>
        <form onSubmit={handleSave} className="space-y-4">

          {/* TABS */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('info')}
            >
              Información Básica
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'assets' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('assets')}
            >
              Assets Visuales
            </button>
          </div>

          {/* TAB INFO */}
          {activeTab === 'info' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.nombre_item}
                    onChange={e => setFormData({...formData, nombre_item: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Costo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      value={formData.costo_gemas}
                      onChange={e => setFormData({...formData, costo_gemas: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={formData.tipo_item_id}
                  onChange={e => setFormData({...formData, tipo_item_id: e.target.value})}
                >
                  <option value="">-- Selecciona --</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* TAB ASSETS */}
          {activeTab === 'assets' && (
            <div className="max-h-[60vh] overflow-y-auto pr-2">

              {/* Icono */}
              <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Icono de Tienda
                </h4>
                <ImageUpload
                  label="Se muestra en la lista"
                  currentImageUrl={getUrl(currentItem?.url_icono_tienda)}
                  onFileSelect={setImgIcono}
                />
              </div>

              {/* Variantes */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold flex items-center gap-2 pb-2 border-b">
                  <Shirt className="w-4 h-4" /> Variantes Equipadas
                </h4>

                <div className="grid grid-cols-1 gap-6">
                  {personajes.map(pj => (
                    <ImageUpload
                      key={pj.id}
                      label={`Versión para ${pj.nombre} (${pj.asset_key})`}
                      currentImageUrl={getEquipadoUrl(pj.asset_key)}
                      onFileSelect={(file) => handleDynamicImageChange(pj.asset_key, file)}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Todo
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};

export default TiendaPage;
