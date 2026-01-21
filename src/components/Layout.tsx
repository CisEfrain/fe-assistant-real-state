import {
  BarChart3,
  Building2,
  Users,
  MessageCircle,
  TrendingUp,
  Search,
  Calendar,
  MessageSquare,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useState } from 'react';

const modules = [
  { id: 'dashboard', name: 'Panel Principal', icon: BarChart3, color: 'text-orange-500' },
  { id: 'properties', name: 'Propiedades', icon: Building2, color: 'text-blue-500' },
  { id: 'leads', name: 'Leads (CRM)', icon: Users, color: 'text-green-500' },
  { id: 'interactions', name: 'Conversaciones', icon: MessageCircle, color: 'text-purple-500' },
  { id: 'conversion', name: 'Análisis de Conversión', icon: TrendingUp, color: 'text-green-500' },
  { id: 'appointments', name: 'Citas Agendadas', icon: Calendar, color: 'text-indigo-500' },
  { id: 'quality', name: 'Calidad Conversacional', icon: MessageSquare, color: 'text-pink-500' },
  { id: 'agents', name: 'Asistentes', icon: Bot, color: 'text-purple-600' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { currentModule, setCurrentModule } = useInteractionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentModuleData = modules.find(m => m.id === currentModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asistente IA Inmobiliario</h1>
                <p className="text-sm text-gray-500">Plataforma Inteligente para Asesores Inmobiliarios</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema Activo
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full pt-20 lg:pt-4">
            <nav className="flex-1 px-4 pb-4 space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = currentModule === module.id;
                const isImplemented = module.id === 'dashboard' || module.id === 'properties' || module.id === 'leads' || module.id === 'interactions' || module.id === 'conversion' || module.id === 'appointments' || module.id === 'quality' || module.id === 'agents';
                
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      if (isImplemented) {
                        setCurrentModule(module.id);
                        setSidebarOpen(false);
                      }
                    }}
                    disabled={!isImplemented}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : isImplemented
                        ? 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : module.color} />
                    <span className="font-medium">{module.name}</span>
                    {!isImplemented && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Próximamente
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            <div className="px-4 pb-4 border-t border-gray-200 pt-4">
              <div className="text-center text-sm text-gray-500">
                <p>v2.0.0 - Inmobiliario</p>
                <p className="text-xs mt-1">Asistente IA</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Asistente IA Inmobiliario</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {currentModuleData?.name || 'Panel Principal'}
                </span>
              </div>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};