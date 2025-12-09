import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

import { 
  LayoutDashboard, Users, UserCheck, Building2, BookOpen, 
  Gamepad2, ShoppingBag, GraduationCap, Calendar, Tag, Smile, BarChart3 
} from 'lucide-react';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  
  // 🔥 CORRECCIÓN: Detectamos el rol de forma flexible
  // IDs Típicos: 1=Admin Viejo, 4=Admin Nuevo | 2=Profe Viejo, 5=Profe Nuevo
  const rol = user?.rol;
  
  const isAdmin = rol === 1 || rol === 4; 
  const isProfesor = rol === 2 || rol === 5;
  const hasAccess = isAdmin || isProfesor;

  const menus = [
    // ====================
    // 🌟 PÚBLICO (Admin + Profe)
    // ====================
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      visible: hasAccess // Mostrar a ambos
    },

    // ====================
    // 🎓 SOLO ADMIN
    // ====================
    { 
      label: 'Instituciones', 
      path: '/instituciones', 
      icon: Building2,
      visible: isAdmin 
    },
    { 
      label: 'Profesores', 
      path: '/profesores', 
      icon: UserCheck,
      visible: isAdmin 
    },
    { 
      label: 'Estudiantes', 
      path: '/estudiantes', 
      icon: Users,
      visible: isAdmin // O cambiar a 'hasAccess' si el profe puede verlos
    },
    { 
      label: 'Ciclos', 
      path: '/ciclos', 
      icon: Calendar,
      visible: isAdmin 
    },

    // ====================
    // 📚 GESTIÓN ACADÉMICA
    // ====================
    { 
      label: 'Cursos & Temas', 
      path: '/cursos', 
      icon: BookOpen,
      visible: hasAccess 
    },

    // ====================
    // 📊 REPORTES (NUEVO)
    // ====================
    { 
      label: 'Reportes y Notas', 
      path: '/reportes', 
      icon: BarChart3,
      visible: hasAccess 
    },

    // ====================
    // 🎮 GAMIFICACIÓN (Admin)
    // ====================
    { 
      label: 'Personajes', 
      path: '/personajes', 
      icon: Smile,
      visible: isAdmin 
    },
    { 
      label: 'Tienda de Items', 
      path: '/tienda', 
      icon: ShoppingBag,
      visible: isAdmin 
    },
    { 
      label: 'Categorías Tienda', 
      path: '/tienda/categorias', 
      icon: Tag,
      visible: isAdmin 
    },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen fixed left-0 top-0 z-10">
      
      {/* HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-indigo-600">
          Llama<span className="text-gray-700">Admin</span>
        </span>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menus.map((item, idx) => {
            // Si no es visible para este rol, no lo mostramos
            if (!item.visible) return null;

            return (
              <li key={idx}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.label === 'Dashboard' ? 'text-indigo-500' : ''}`} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            {user?.nombre?.charAt(0) || 'U'}
          </div>

          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.nombre}</p>
            <p className="text-xs text-gray-500 truncate font-medium">
              {isAdmin ? 'Administrador' : 'Profesor'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;