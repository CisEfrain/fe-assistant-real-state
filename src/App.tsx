import { Layout } from './components/Layout';
import { DashboardExecutive } from './components/dashboard/DashboardExecutive';
import { InteractionsDetail } from './components/interactions/InteractionsDetail';
import { ConversionAnalysis } from './components/conversion/ConversionAnalysis';
import { SearchAnalysis } from './components/search/SearchAnalysis';
import { AppointmentsModule } from './components/appointments/AppointmentsModule';
import { QualityModule } from './components/quality/QualityModule';
import { OtherContactsDetail } from './components/other-contacts/OtherContactsDetail';
import { AgentsModule } from './components/agents/AgentsModule';
import { ErrorPage } from './components/ErrorPage';
import { AuthMiddleware, AuthProvider, AuthGuard } from './components/auth';
import { useInteractionStore } from './stores/useInteractionStore';
import { PublicPlayground } from './components/public-playground';

function App() {
  const { currentModule } = useInteractionStore();

  // Check if we're on the error page
  const isErrorPage = window.location.pathname === '/error';
  
  if (isErrorPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get('type') as 'DEFAULT' | 'CONTRACT_FEATURES' | null;
    return <ErrorPage errorType={errorType || 'DEFAULT'} />;
  }

  // Check if we're on the playground page
  const isPlaygroundPage = window.location.pathname === '/playground';

  if (isPlaygroundPage) {
    return <PublicPlayground />;
  }

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardExecutive />;
      case 'interactions':
        return (
          <InteractionsDetail />
        );
      case 'conversion':
        return (
          <ConversionAnalysis />
        );
      case 'search':
        return (
          <SearchAnalysis />
        );
      case 'appointments':
        return (
          <AppointmentsModule />
        );
      case 'quality':
        return (
          <QualityModule />
        );
      case 'other-contacts':
        return (
          <OtherContactsDetail />
        );
      case 'agents':
        return (
          <AgentsModule />
        );
      default:
        return <DashboardExecutive />;
    }
  };

  return (
    <AuthProvider>
      <AuthMiddleware>
        <AuthGuard
          fallback={(
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto p-6">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sesión cerrada</h2>
                <p className="text-gray-600">
                  Tu sesión se ha cerrado correctamente. Para ingresar nuevamente,
                  debes hacerlo desde el backoffice.
                </p>
              </div>
            </div>
          )}
        >
          <Layout>
            {renderCurrentModule()}
          </Layout>
        </AuthGuard>
      </AuthMiddleware>
    </AuthProvider>
  );
}

export default App;