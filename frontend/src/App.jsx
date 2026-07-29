import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';

function AppContent() {
  const [screen, setScreen] = useState('landing'); // 'landing', 'events', or 'auth'

  return (
    <>
      {screen === 'landing' && (
        <LandingPage 
          onExplore={() => setScreen('events')} 
          onAuth={() => setScreen('auth')} 
        />
      )}
      {screen === 'events' && (
        <EventsPage 
          onNavigateAuth={() => setScreen('auth')} 
          onNavigateHome={() => setScreen('landing')}
        />
      )}
      {screen === 'auth' && (
        <AuthPage 
          onBackToEvents={() => setScreen('events')} 
          onNavigateHome={() => setScreen('landing')}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
