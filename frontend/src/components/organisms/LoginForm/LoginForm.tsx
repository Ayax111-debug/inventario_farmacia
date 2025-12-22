import { useState } from "react";
import { Button } from "../../atoms/Button";
import { FormField } from "../../molecules/FormField";
import { authService } from "../../../services/auth.service"; // Importamos el servicio

export const LoginForm = () => {
  const [username, setUsername] = useState(""); // Django usa username por defecto
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Mensaje de éxito

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // 1. Llamamos al servicio (Backend real)
      await authService.login(username, password);
      
      // 2. Si pasa, mostramos éxito
      setSuccess("¡Login Exitoso! Bienvenido al sistema.");
      
      // Aquí redirigiríamos en el futuro...
      
    } catch (err: any) {
      // 3. Si falla, mostramos el error
      console.error(err);
      setError("Login Fallido: Usuario o contraseña incorrectos.");
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
        {/* Usamos username en vez de email porque Django AbstractUser usa username */}
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

      {/* ZONA DE MENSAJES */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 font-medium">
          {success}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Validando..." : "Ingresar"}
      </Button>
    </form>
  );
};