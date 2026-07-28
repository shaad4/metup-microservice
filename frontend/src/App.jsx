import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';

function AppContent() {
  const [screen, setScreen] = useState('events'); // 'events' or 'auth'

  return (
    <>
      {screen === 'events' ? (
        <EventsPage onNavigateAuth={() => setScreen('auth')} />
      ) : (
        <AuthPage onBackToEvents={() => setScreen('events')} />
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
