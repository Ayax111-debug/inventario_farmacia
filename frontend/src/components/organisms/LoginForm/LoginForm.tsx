import React, {useState} from "react";
import {Button} from "../../atoms/Button";
import { FormField } from "../../molecules/FormField";
import {useLogin} from "../../../hooks/authentication/useLogin";

interface LoginFormProps  {
  onLoginSuccess: () => void;
}

export const LoginForm = ({onLoginSuccess}:LoginFormProps) =>{
  const [username, setUsername]=useState("");
  const [password, setPassword]=useState("");

  const {login, isLoading, error} = useLogin(onLoginSuccess);

  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    login(username, password);
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
}