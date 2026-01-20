import { Layout } from './components/Layout';
import { DashboardExecutive } from './components/dashboard/DashboardExecutive';
import { InteractionsDetail } from './components/interactions/InteractionsDetail';
import { ConversionAnalysis } from './components/conversion/ConversionAnalysis';
import { SearchAnalysis } from './components/search/SearchAnalysis';
import { AppointmentsModule } from './components/appointments/AppointmentsModule';
import { QualityModule } from './components/quality/QualityModule';
import { AgentsModule } from './components/agents/AgentsModule';
import { useInteractionStore } from './stores/useInteractionStore';
import { PublicPlayground } from './components/public-playground';

function App() {
  const { currentModule } = useInteractionStore();

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
        return <InteractionsDetail />;
      case 'conversion':
        return <ConversionAnalysis />;
      case 'search':
        return <SearchAnalysis />;
      case 'appointments':
        return <AppointmentsModule />;
      case 'quality':
        return <QualityModule />;
      case 'agents':
        return <AgentsModule />;
      default:
        return <DashboardExecutive />;
    }
  };

  return (
    <Layout>
      {renderCurrentModule()}
    </Layout>
  );
}

export default App;