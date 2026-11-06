import { GlobalProvider, useGlobal } from './store/globalStore';
import ModeSwitcher from './components/shared/ModeSwitcher';
import ToastContainer from './components/shared/Toast';
import AquaTransitView from './views/AquaTransitView';
import RoadBustersView from './views/RoadBustersView';
import CommandCenterView from './views/CommandCenterView';
import DemoToolkit from './components/shared/DemoToolkit';

function AppContent() {
  const { state } = useGlobal();

  // Dynamic root container background matching the active module's solid palette
  const getContainerBg = () => {
    switch (state.appMode) {
      case 'waterlink':
        return 'bg-[#042F40]';
      case 'roadwatch':
        return 'bg-[#171717]';
      case 'transitpulse':
      default:
        return 'bg-[#0B132B]';
    }
  };

  return (
    <div className={`min-h-screen ${getContainerBg()} text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200`}>
      <ModeSwitcher />
      <ToastContainer />
      <main className="flex-1 flex flex-col overflow-hidden">
        {state.appMode === 'waterlink' && <AquaTransitView />}
        {state.appMode === 'roadwatch' && <RoadBustersView />}
        {state.appMode === 'transitpulse' && <CommandCenterView />}
      </main>
      <DemoToolkit />
    </div>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}
