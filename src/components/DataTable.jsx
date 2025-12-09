import { useState, useMemo } from 'react';
import { Edit, Trash2, List, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 1. Lógica de Ordenamiento (Sorting)
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 2. Lógica combinada: Filtrar + Ordenar (useMemo para rendimiento)
  const processedData = useMemo(() => {
    // A. Filtrar
    let result = data;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          // Si la columna es custom (tiene render), intentamos buscar en el accessor si existe
          const value = row[col.accessor];
          return value ? String(value).toLowerCase().includes(lowerTerm) : false;
        })
      );
    }

    // B. Ordenar
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, columns]);

  // Renderizar icono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary" /> 
      : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-4">
      
      {/* 🔍 BARRA DE BÚSQUEDA */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 TABLA */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        {processedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay registros disponibles.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    onClick={() => col.accessor && handleSort(col.accessor)} // Solo ordena si tiene accessor
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.accessor ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors select-none group`}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.accessor && getSortIcon(col.accessor)}
                    </div>
                  </th>
                ))}
                
                {(onEdit || onDelete || onView) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {/* 🔥 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 🔥 */}
                      {col.render 
                        ? col.render(row) // Si hay función render, ejecuta la función (pinta imagen)
                        : row[col.accessor] // Si no, pinta texto normal
                      }
                    </td>
                  ))}
                  
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        {onView && (
                          <button onClick={() => onView(row)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full transition-colors" title="Ver Detalles">
                            <List className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(row)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Contador de resultados */}
      <div className="text-sm text-gray-500 text-right">
        Mostrando {processedData.length} registro(s)
      </div>
    </div>
  );
};

export default DataTable;