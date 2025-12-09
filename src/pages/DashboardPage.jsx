import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Users, GraduationCap, BookOpen, ShoppingBag, 
  ArrowRight, Loader2, History, Gem, Zap, CheckCircle, XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Tarjeta KPI (Estilo Clásico que te gusta)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
    <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Función para formatear fecha amigable (Ej: "Hace 2 horas")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
    </div>
  );

  if (!data) return <div className="p-10 text-center text-red-500">Error de conexión.</div>;

  const { metrics, activityLog } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 mt-1">Visión general del sistema académico.</p>
        </div>
        <Link to="/reportes" className="group bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2">
          Ver Reportes Avanzados <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* KPI Cards (Tus favoritos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Estudiantes" value={metrics?.estudiantes || 0} icon={GraduationCap} color="bg-blue-500" />
        <StatCard title="Profesores" value={metrics?.profesores || 0} icon={Users} color="bg-purple-500" />
        <StatCard title="Lecciones" value={metrics?.lecciones || 0} icon={BookOpen} color="bg-green-500" />
        <StatCard title="Ventas" value={metrics?.ventas || 0} icon={ShoppingBag} color="bg-orange-500" />
      </div>

      {/* SECCIÓN PRINCIPAL: HISTORIAL DE ACTIVIDAD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
        
        {/* Título de la sección */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-indigo-500" /> Bitácora de Actividad Reciente
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded border">
            Últimos {activityLog?.length || 0} registros
          </span>
        </div>

        {/* Lista con Scroll */}
        <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 bg-gray-50/80">Estudiante</th>
                <th className="px-6 py-4 bg-gray-50/80">Actividad Académica</th>
                <th className="px-6 py-4 bg-gray-50/80 text-center">Nota</th>
                <th className="px-6 py-4 bg-gray-50/80 text-center">Recompensas</th>
                <th className="px-6 py-4 bg-gray-50/80 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activityLog?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  {/* Columna: Estudiante */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {log.alumno.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{log.alumno}</p>
                        <p className="text-xs text-gray-400">{log.correo}</p>
                      </div>
                    </div>
                  </td>

                  {/* Columna: Actividad */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{log.leccion}</p>
                    <p className="text-xs text-indigo-500 font-medium">{log.curso}</p>
                  </td>

                  {/* Columna: Nota */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      log.nota >= 13 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {log.nota >= 13 ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                      {log.nota}
                    </span>
                  </td>

                  {/* Columna: Recompensas */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md" title="Gemas ganadas">
                        <Gem className="w-3 h-3" /> +{log.gemas}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md" title="XP ganada">
                        <Zap className="w-3 h-3" /> +{log.xp}
                      </div>
                    </div>
                  </td>

                  {/* Columna: Fecha */}
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs text-gray-500 font-medium">{formatDate(log.fecha)}</p>
                  </td>

                </tr>
              ))}

              {(!activityLog || activityLog.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No hay actividad reciente registrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;