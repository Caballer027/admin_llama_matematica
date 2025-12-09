import { useState, useEffect } from 'react';
import api from '../api/axios';

const Avatar = ({ size = 'md', className = '' }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapeo de tamaños
  const sizeClasses = {
    sm: 'w-10 h-10',     // Para el Header
    md: 'w-24 h-24',     // Para el Perfil
    lg: 'w-48 h-48',     // Para la Home del Estudiante
    xl: 'w-64 h-64'      // Para la Tienda (Probador)
  };

  const fetchAvatar = async () => {
    try {
      const res = await api.get('/estudiante/avatar');
      setAvatarUrl(res.data.url);
    } catch (error) {
      console.error("Error avatar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
    
    // Escuchar evento personalizado por si compran algo y cambia el avatar
    window.addEventListener('avatarUpdated', fetchAvatar);
    return () => window.removeEventListener('avatarUpdated', fetchAvatar);
  }, []);

  // Construir URL completa si viene relativa
  const getFullUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    // Ajusta al puerto de tu backend
    return `http://localhost:3000/${url.startsWith('/') ? url.substring(1) : url}`;
  };

  if (loading) return <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />;

  return (
    <img 
      src={getFullUrl(avatarUrl)} 
      alt="Mi Avatar" 
      className={`${sizeClasses[size]} object-contain drop-shadow-lg transition-transform hover:scale-105 ${className}`}
    />
  );
};

export default Avatar;