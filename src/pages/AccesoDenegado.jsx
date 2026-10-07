// src/pages/AccesoDenegado.jsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerRutaInicioPorRol } from '../components/routes/RutaPublica';

export const AccesoDenegado = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleVolver = () => {
    if (usuario) {
      navigate(obtenerRutaInicioPorRol(usuario.rol), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
          <span className="text-2xl font-bold">403</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
        <p className="text-gray-600 text-sm mb-6">
          No tienes permisos para acceder a esta sección. Si consideras que esto es un error, por favor ponte en contacto con soporte.
        </p>
        <button
          onClick={handleVolver}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150 shadow-sm"
        >
          {usuario ? 'Volver a mi panel principal' : 'Ir al inicio de sesión'}
        </button>
      </div>
    </div>
  );
};

export default AccesoDenegado;