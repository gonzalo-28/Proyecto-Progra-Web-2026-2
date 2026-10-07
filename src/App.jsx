// src/App.jsx

import { AuthProvider } from './context/AuthContext';
import AppRouter from './components/routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;