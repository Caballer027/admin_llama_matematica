import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { Trophy, Gem, Filter } from 'lucide-react';

const EstudiantesPage = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'top_xp', 'top_gemas'

  useEffect(() => {
    api.get('/admin/estudiantes').then(res => {
      setEstudiantes(res.data);
      setFilteredData(res.data); // Inicialmente son todos
      setLoading(false);
    });
  }, []);

  // Lógica de filtrado/ordenamiento manual
  useEffect(() => {
    let temp = [...estudiantes];
    if (filtro === 'top_xp') {
      temp.sort((a, b) => b.puntos_experiencia - a.puntos_experiencia);
    } else if (filtro === 'top_gemas') {
      temp.sort((a, b) => b.gemas - a.gemas);
    }
    setFilteredData(temp);
  }, [filtro, estudiantes]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Apellido', accessor: 'apellido' },
    { header: 'Correo', accessor: 'correo_electronico' },
    { 
        header: 'Experiencia', 
        accessor: 'puntos_experiencia',
        render: (row) => <span className="flex items-center gap-1 text-purple-600 font-bold"><Trophy className="w-3 h-3" /> {row.puntos_experiencia}</span>
    },
    { 
        header: 'Gemas', 
        accessor: 'gemas',
        render: (row) => <span className="flex items-center gap-1 text-blue-600 font-bold"><Gem className="w-3 h-3" /> {row.gemas}</span>
    }
  ];

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
            <p className="text-gray-500 text-sm">Progreso y economía de los alumnos.</p>
        </div>
        
        {/* 🔥 FILTRO VISUAL */}
        <div className="flex items-center gap-2 bg-white border p-1 rounded-lg">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select 
                className="bg-transparent border-none text-sm focus:ring-0 text-gray-600"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            >
                <option value="todos">Orden: Normal</option>
                <option value="top_xp">Mayor Experiencia (Top Académico)</option>
                <option value="top_gemas">Mayor Riqueza (Top Tienda)</option>
            </select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
};

export default EstudiantesPage;