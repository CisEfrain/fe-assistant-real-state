import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  errorType?: 'DEFAULT' | 'CONTRACT_FEATURES';
}

export function ErrorPage({ errorType = 'DEFAULT' }: ErrorPageProps) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'CONTRACT_FEATURES':
        return {
          title: 'Acceso No Autorizado',
          message: 'Tu cuenta no tiene los permisos necesarios para acceder a esta funcionalidad. Contacta al administrador para obtener acceso.',
          icon: '🔒',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          title: 'Error de Autenticación',
          message: 'Tu sesión ha expirado o el token de acceso es inválido. Por favor, inicia sesión nuevamente.',
          icon: '⚠️',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const errorContent = getErrorContent();
  const dashPublicDomain = import.meta.env.VITE_DASH_PUBLIC_DOMAIN || 'https://dashboard.iadmexico.mx';

  const handleReturnToDashboard = () => {
    window.location.href = dashPublicDomain;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${errorContent.bgColor} ${errorContent.borderColor} border rounded-lg shadow-lg p-8 text-center`}>
        {/* Icon */}
        <div className="text-6xl mb-6">
          {errorContent.icon}
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold ${errorContent.color} mb-4`}>
          {errorContent.title}
        </h1>

        {/* Message */}
        <p className="text-gray-700 mb-8 leading-relaxed">
          {errorContent.message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleReturnToDashboard}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home size={20} />
            <span>Volver al Dashboard Principal</span>
          </button>

          {errorType === 'DEFAULT' && (
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <RefreshCw size={20} />
              <span>Reintentar</span>
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <AlertTriangle size={16} />
            <span>IAD Contact Center - Sistema de Autenticación</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Si el problema persiste, contacta al soporte técnico
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
