import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Download, Building2, Users, LayoutDashboard,
  TrendingUp, Search, Loader2, AlertOctagon, BookOpen, Star
} from 'lucide-react';

const ReportesPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  const [globalData, setGlobalData] = useState({});
  const [advancedData, setAdvancedData] = useState({});

  // Estados para listas de filtros
  const [listaInstituciones, setListaInstituciones] = useState([]);
  const [listaCarreras, setListaCarreras] = useState([]);
  const [listaCursos, setListaCursos] = useState([]);

  // Estados de selección de filtros
  const [filterText, setFilterText] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [filterCareer, setFilterCareer] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [resGlobal, resAdvanced] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/analytics/advanced'),
        ]);

        const gData = resGlobal.data || {};
        const aData = resAdvanced.data || {};

        // Preparar datos para el Radar (Top 5)
        // Cortamos nombres largos para que se vea bien en el gráfico
        const formatRadar = (list) => (list || []).map(i => ({
          subject: i.name.length > 15 ? i.name.substring(0, 15) + '...' : i.name,
          full: i.name, // Nombre completo para el tooltip
          A: i.promedio,
          fullMark: 20
        }));

        gData.radarMejores = formatRadar(gData.tops?.mejores);
        gData.radarPeores = formatRadar(gData.tops?.peores);

        setGlobalData(gData);
        setAdvancedData(aData);

        // Llenar filtros desde la respuesta del backend (Listas Maestras)
        if (aData.listas) {
          setListaInstituciones(aData.listas.instituciones || []);
          setListaCarreras(aData.listas.carreras || []);
          setListaCursos(aData.listas.cursos || []);
        }

      } catch (e) {
        console.error("Error cargando reportes:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // --- HELPERS GRÁFICOS ---

  // Etiqueta interna para el Pastel
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold drop-shadow-md">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tooltip Personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const titulo = data.full || data.temaFull || data.name || data.subject;
      const valor = data.A !== undefined ? data.A : data.promedio;

      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs z-50 max-w-[200px]">
          <p className="font-bold text-gray-800 mb-2 border-b pb-1 break-words">{titulo}</p>
          <div className="space-y-1">
            <p className="text-gray-600">Nota: <span className="font-bold text-indigo-600">{valor}</span></p>
            {data.tiempoProm && (
              <p className="text-gray-600">Tiempo: <span className="font-bold text-orange-500">{data.tiempoProm} min</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const COLORS_PIE = ['#10B981', '#EF4444', '#E5E7EB'];

  // --- CSV ---
  const downloadCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ["Alumno", "Institucion", "Carrera", "Ciclo", "Curso", "Lecciones", "Promedio", "Estado"];
    const rows = filteredStudents.map(s => [
      `"${s.nombre}"`, `"${s.institucion}"`, `"${s.carrera}"`, `"${s.ciclo}"`, `"${s.curso_asignado}"`,
      s.lecciones_completadas, s.promedio_global, s.nivel_rendimiento
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_estudiantes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredStudents = useMemo(() => {
    if (!advancedData?.estudiantes) return [];

    const instId = String(filterInstitution);
    const carrId = String(filterCareer);
    const courseId = String(filterCourse);

    return advancedData.estudiantes.filter(s => {
      const matchText = s.nombre.toLowerCase().includes(filterText.toLowerCase());
      
      const matchInst = instId === 'all' || s.institucion === filterInstitution || String(s.institucion_id) === instId;
      const matchCarr = carrId === 'all' || s.carrera === filterCareer || String(s.carrera_id) === carrId;

      // Filtro Curso (por nombre asignado)
      let matchCourse = true;
      if (courseId !== 'all') {
         const selectedCourse = listaCursos.find(c => c.id === courseId);
         if (selectedCourse) {
             matchCourse = s.curso_asignado === selectedCourse.nombre;
         }
      }

      let matchLevel = true;
      if (filterLevel === 'risk') matchLevel = s.promedio_global < 13;
      if (filterLevel === 'good') matchLevel = s.promedio_global >= 13;

      return matchText && matchInst && matchCarr && matchLevel && matchCourse;
    });
  }, [advancedData, filterText, filterInstitution, filterCareer, filterLevel, filterCourse, listaCursos]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  const renderGlobalView = () => (
    <div className="space-y-8 animate-in fade-in pb-12">

      {/* 1. KPIs (SOLO LOS 2 IMPORTANTES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI: Alumnos en Riesgo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-red-500 uppercase font-bold tracking-wider mb-2">Alumnos en Riesgo Crítico</p>
          <div className="flex justify-between items-end">
            <h3 className="text-4xl font-bold text-red-600">{globalData?.stats?.alumnosRiesgoCount || 0}</h3>
            <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertOctagon className="w-8 h-8" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-medium">Estudiantes con promedio general menor a 13.</p>
        </div>

        {/* KPI: Excelencia Académica */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-green-500 uppercase font-bold tracking-wider mb-2">Excelencia Académica</p>
          <div className="flex justify-between items-end">
            <h3 className="text-4xl font-bold text-green-600">{globalData?.stats?.excelenciaAcademica || 0}</h3>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Star className="w-8 h-8" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-medium">Estudiantes con promedio general mayor a 17.</p>
        </div>
      </div>

      {/* 2. ACTIVIDAD */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" /> Flujo de Actividad (7 Días)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={globalData?.graficoLinea}>
              <defs>
                <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="fecha" style={{ fontSize: 12 }} tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis style={{ fontSize: 12 }} tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="intentos" stroke="#6366F1" strokeWidth={3} fill="url(#colorInt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. APROBACIÓN POR CURSOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "General", data: globalData?.pasteles?.general, sub: "Global" },
          { title: "Cálculo y Estadística", data: globalData?.pasteles?.curso1, sub: "Primer Ciclo" },
          { title: "Aplicaciones de Cálculo y Estadística", data: globalData?.pasteles?.curso2, sub: "Segundo Ciclo" }
        ].map((chart, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h4 className="font-bold text-gray-800 text-sm text-center break-words w-full h-12 flex items-center justify-center px-2 leading-tight">{chart.title}</h4>
            <div className="h-48 w-full relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chart.data || []} cx="50%" cy="50%"
                    innerRadius={0} outerRadius={80} // Pastel lleno
                    paddingAngle={2} dataKey="value"
                    label={renderCustomizedLabel} // Etiqueta DENTRO
                    labelLine={false}
                  >
                    {chart.data?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} strokeWidth={1} stroke="white" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 text-[10px] font-bold text-gray-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Aprobados</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Reprobados</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. TOP 5 (RADAR CHART / PENTAGON) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mejores */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-green-700 mb-4 text-center">🏆 Top 5 Mejores Lecciones</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={globalData?.radarMejores || []}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#4B5563' }} />
                <PolarRadiusAxis angle={90} domain={[0, 20]} tick={false} axisLine={false} />
                <Radar name="Promedio" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peores */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-red-700 mb-4 text-center">🚨 Top 5 Lecciones Difíciles</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={globalData?.radarPeores || []}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#4B5563' }} />
                <PolarRadiusAxis angle={90} domain={[0, 20]} tick={false} axisLine={false} />
                <Radar name="Promedio" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. RENDIMIENTO SEMANAL (CURSOS) */}
      <div className="grid grid-cols-1 gap-8 mt-8">
        {/* Curso 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Rendimiento Semanal: Cálculo y Estadística</h3>
              <p className="text-xs text-gray-500 mt-1">Evolución del promedio de notas por semana.</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={globalData?.semanal?.curso1 || []} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="semana" style={{ fontSize: 11, fontWeight: 'bold' }} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} style={{ fontSize: 11 }} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EEF2FF', radius: 4 }} />
                <Bar dataKey="promedio" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Curso 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Rendimiento Semanal: Aplicaciones de Cálculo y Estadística</h3>
              <p className="text-xs text-gray-500 mt-1">Evolución del promedio de notas por semana.</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
          </div>
          <div className="h-64">
            {(globalData?.semanal?.curso2?.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalData?.semanal?.curso2 || []} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="semana" style={{ fontSize: 11, fontWeight: 'bold' }} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} style={{ fontSize: 11 }} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF7ED', radius: 4 }} />
                  <Bar dataKey="promedio" fill="#F97316" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <AlertOctagon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No hay datos registrados aún para este curso.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. COMPARATIVA INSTITUCIONAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
        <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">Comparativa Institucional</h3>
        <div className="h-60">
          {(advancedData?.instituciones?.length > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedData?.instituciones || []} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 20]} hide />
                <YAxis dataKey="nombre" type="category" width={100} style={{ fontSize: 12, fontWeight: 600 }} tick={{ fill: '#374151' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="promedio" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={24} label={{ position: 'right', fill: '#1E40AF', fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-xl">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Sin datos suficientes</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );

  // --- VISTA DETALLE ---
  const renderDetailView = () => {
    const columns = [
      { header: 'Alumno', accessor: 'nombre' },
      { header: 'Institución', accessor: 'institucion' },
      { header: 'Carrera', accessor: 'carrera' },
      { header: 'Curso Asignado', accessor: 'curso_asignado' },
      { header: 'Avance', render: r => <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{r.lecciones_completadas} Lecc.</span> },
      { header: 'Promedio', render: r => <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${r.promedio_global >= 13 ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold text-gray-700">{r.promedio_global}</span></div> },
      { header: 'Estado', render: r => <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${r.promedio_global >= 13 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{r.nivel_rendimiento}</span> }
    ];

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Buscar alumno..." className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
            </div>
            <button onClick={downloadCSV} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all whitespace-nowrap"><Download className="w-4 h-4" /> CSV</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none hover:bg-gray-50 cursor-pointer" value={filterInstitution} onChange={(e) => setFilterInstitution(e.target.value)}>
              <option value="all">🏢 Todas las Instituciones</option>
              {listaInstituciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>

            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none hover:bg-gray-50 cursor-pointer" value={filterCareer} onChange={(e) => setFilterCareer(e.target.value)}>
              <option value="all">🎓 Todas las Carreras</option>
              {listaCarreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none hover:bg-gray-50 cursor-pointer" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="all">📚 Todos los Cursos</option>
              {listaCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none hover:bg-gray-50 cursor-pointer" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="all">📊 Todos los Niveles</option>
              <option value="good">✅ Aprobados</option>
              <option value="risk">🚨 En Riesgo</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable columns={columns} data={filteredStudents} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analítica Académica</h1><p className="text-gray-500 text-sm">Monitor de rendimiento y progreso estudiantil.</p></div>
        <div className="bg-white border p-1 rounded-xl flex gap-1 shadow-sm"><button onClick={() => setActiveTab('global')} className={`px-4 py-2 rounded-lg text-sm font-bold flex gap-2 transition-all ${activeTab === 'global' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</button><button onClick={() => setActiveTab('detalle')} className={`px-4 py-2 rounded-lg text-sm font-bold flex gap-2 transition-all ${activeTab === 'detalle' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}><Users className="w-4 h-4" /> Estudiantes</button></div>
      </div>
      {activeTab === 'global' ? renderGlobalView() : renderDetailView()}
    </div>
  );
};

export default ReportesPage;