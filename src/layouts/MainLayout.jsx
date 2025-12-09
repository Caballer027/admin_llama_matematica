import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Sidebar Fijo */}
      <Sidebar />

      {/* 2. Contenedor Principal */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        {/* 2.1 Header Fijo */}
        <Header />

        {/* 2.2 Contenido Dinámico (Aquí se cargan las páginas) */}
        <main className="flex-1 p-6 mt-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* <Outlet /> es el hueco donde React Router pone el componente de la página actual */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;