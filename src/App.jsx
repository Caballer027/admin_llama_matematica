import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import { AuthGuard } from './components/AuthGuard';
import MainLayout from './layouts/MainLayout';

// IMPORTS DE PÁGINAS (REALES)
import DashboardPage from './pages/DashboardPage';
import ProfesoresPage from './pages/ProfesoresPage';
import EstudiantesPage from './pages/EstudiantesPage';

import InstitucionesPage from './pages/InstitucionesPage';
import CarrerasPage from './pages/CarrerasPage';
import CursosPage from './pages/CursosPage';
import CiclosPage from './pages/CiclosPage';
import TemasPage from './pages/TemasPage';
import LeccionesPage from './pages/LeccionesPage';
import PreguntasPage from './pages/PreguntasPage';
import TiendaPage from './pages/TiendaPage';
import TiposItemPage from './pages/TiposItemPage';
import PersonajesPage from './pages/PersonajesPage';

// 🔥 NUEVO: REPORTES
import ReportesPage from './pages/ReportesPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' }
        }}
      />

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* RUTAS PROTEGIDAS */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>

            {/* 🔥 DASHBOARD REAL */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Instituciones */}
            <Route path="/instituciones" element={<InstitucionesPage />} />
            <Route path="/instituciones/:id/carreras" element={<CarrerasPage />} />

            {/* Gestión de Usuarios */}
            <Route path="/profesores" element={<ProfesoresPage />} />
            <Route path="/estudiantes" element={<EstudiantesPage />} />
            <Route path="/usuarios" element={<Navigate to="/estudiantes" replace />} />

            {/* Cursos y Académico */}
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/ciclos" element={<CiclosPage />} />
            <Route path="/cursos/:cursoId/temas" element={<TemasPage />} />
            <Route path="/temas/:temaId/lecciones" element={<LeccionesPage />} />
            <Route path="/lecciones/:leccionId/preguntas" element={<PreguntasPage />} />

            {/* Tienda y Gamificación */}
            <Route path="/tienda" element={<TiendaPage />} />
            <Route path="/tienda/categorias" element={<TiposItemPage />} />
            <Route path="/personajes" element={<PersonajesPage />} />

            {/* 🔥 NUEVO: REPORTES */}
            <Route path="/reportes" element={<ReportesPage />} />

          </Route>
        </Route>

        {/* DEFAULT ROUTE */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
