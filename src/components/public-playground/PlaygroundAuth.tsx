import React, { useState } from 'react';
import { ArrowRight, AlertCircle, User } from 'lucide-react';
import { env } from '../../env';

interface PlaygroundAuthProps {
  onAuthenticated: (testerName: string) => void;
}

export const PlaygroundAuth: React.FC<PlaygroundAuthProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [testerName, setTesterName] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simular pequeño delay para UX
    setTimeout(() => {
      if (password === env.PLAYGROUND_PASSWORD) {
        onAuthenticated(testerName);
      } else {
        setError(true);
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-purple-100 text-sm">
            Introduce tus datos para acceder al Playground
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="testerName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Tester
              </label>
              <input
                id="testerName"
                type="text"
                required
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Tu nombre"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Acceso
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none transition-all
                  ${error 
                    ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="••••••••"
              />
              {error && (
                <div className="mt-2 flex items-center text-sm text-red-600 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  Contraseña incorrecta
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || !testerName.trim() || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Ingresar al Playground
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Este entorno es solo para pruebas internas y demostraciones.
          </p>
        </div>
      </div>
    </div>
  );
};
