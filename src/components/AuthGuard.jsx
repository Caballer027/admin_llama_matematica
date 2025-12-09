import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AuthGuard = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Si no está autenticado -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay roles permitidos y el usuario no tiene el rol correcto -> Dashboard
  // (Asumimos que rol 1=Admin, 2=Profesor)
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si todo bien, muestra el contenido (Outlet)
  return <Outlet />;
};