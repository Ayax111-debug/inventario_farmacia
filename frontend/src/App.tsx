import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import  LaboratoriosPage  from './pages/LaboratoriosPage';
import { ComponentsShowcase } from './pages/ComponentsShowcase';
import { authService } from './services/auth.service'; // Tu función que llama a /api/me/
import ProductosPage from './pages/ProductosPage';
import LotesPage from './pages/LotesPages';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = async () => {
    try {
      const userData = await authService.checkAuth();
      setUser(userData);

    }catch (error) {
      setUser(null);
    }
  };




  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authService.checkAuth();
        setUser(userData);
      } catch (error) {
        
        setUser(null);
      } finally {
        
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-500 font-medium">Sincronizando con la farmacia...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>

      

      <Routes>
        
        <Route 
          path='/login' 
          element={!user ? <LoginPage onLoginSuccess={handleLogin} /> : <Navigate to="/showcase" />} 
        />

        <Route 
          path='/showcase' 
          element={user ? <ComponentsShowcase /> : <Navigate to="/login" />} 
        />

        <Route 
          path='/' 
          element={<Navigate to={user ? "/showcase" : "/login"} />} 
        />

        <Route path="/laboratorios" 
        element={user ? <LaboratoriosPage /> : <Navigate to="/login" />}
        />

        <Route path="/productos" 
        element={user ? <ProductosPage /> : <Navigate to="/login" />}
        />
        <Route path="/lotes" 
        element={user ? <LotesPage /> : <Navigate to="/login" />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;