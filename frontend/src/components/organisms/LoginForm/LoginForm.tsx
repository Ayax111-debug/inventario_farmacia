import React, { useState } from "react";
import { Button } from "../../atoms/Button";
import { FormField } from "../../molecules/FormField";
import { authService } from "../../../services/auth.service";

// 1. Definimos la "puerta de entrada" para la función del padre
interface LoginFormProps {
  onLoginSuccess: () => void;
}

// 2. Recibimos la prop desestructurada
export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Nota: Quitamos 'success' y 'useNavigate'. 
  // Si el login es exitoso, el redireccionamiento será tan rápido que el usuario
  // no alcanzará a leer un mensaje de éxito.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // A. Login en el Backend (Cookies HttpOnly)
      await authService.login(username, password);
      
      // B. Guardamos el nombre para UX (opcional, pero útil)
      localStorage.setItem('username', username);

      // C. ¡MOMENTO CLAVE!
      // En vez de navegar nosotros, le avisamos a App.tsx
      // App.tsx actualizará el estado 'user' y el <Navigate /> de las rutas actuará solo.
      onLoginSuccess();

    } catch (err: any) {
      console.error(err);
      setError("Credenciales incorrectas o error de servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-6 w-full max-w-sm p-8 bg-white border border-slate-200 rounded-lg shadow-sm"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar Sesión</h1>
        <p className="text-sm text-slate-500">Sistema de Inventario</p>
      </div>

      <div className="flex flex-col gap-4">
        <FormField
          label="Nombre de Usuario"
          placeholder="Ej: admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <FormField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Validando..." : "Ingresar"}
      </Button>
    </form>
  );
};