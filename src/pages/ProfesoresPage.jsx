import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfesoresPage = () => {
  const [profesores, setProfesores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', correo: '', password: '' });
  const [loading, setLoading] = useState(false);

  const fetchProfes = async () => {
    try {
        const res = await api.get('/admin/profesores');
        setProfesores(res.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchProfes(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mapeamos al formato que espera el backend
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo_electronico: formData.correo,
        contrasena: formData.password,
        institucion_id: 1 // Por defecto, o puedes agregar un select de instituciones
      };

      await api.post('/admin/profesores', payload);
      toast.success('Profesor registrado correctamente');
      setIsModalOpen(false);
      fetchProfes();
      setFormData({ nombre: '', apellido: '', correo: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if(!window.confirm(`¿Eliminar al profesor ${row.nombre_completo}?`)) return;
    try {
      await api.delete(`/admin/users/${row.id}`);
      toast.success('Eliminado');
      fetchProfes();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre Completo', accessor: 'nombre_completo' },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Institución', accessor: 'institucion' },
    { header: 'Cursos', accessor: 'cursos' } // Viene del endpoint unificado
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Profesores</h1>
            <p className="text-gray-500 text-sm">Gestiona el personal docente.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <UserPlus className="w-4 h-4" /> Nuevo Profesor
        </button>
      </div>

      <DataTable columns={columns} data={profesores} onDelete={handleDelete} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Profesor">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <input required className="w-full border p-2 rounded-lg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700">Apellido</label>
                <input required className="w-full border p-2 rounded-lg" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Correo Institucional</label>
            <input required type="email" className="w-full border p-2 rounded-lg" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña Temporal</label>
            <input required type="password" className="w-full border p-2 rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <div className="pt-2 flex justify-end gap-2">
             <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancelar</button>
             <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
                {loading && <Loader2 className="animate-spin w-4 h-4" />} Registrar
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfesoresPage;