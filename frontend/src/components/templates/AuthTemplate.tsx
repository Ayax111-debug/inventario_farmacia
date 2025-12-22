import { type ReactNode } from "react";

interface AuthTemplateProps {
  children: ReactNode; // El organismo (LoginForm) vendrá aquí dentro
  title?: string;
}

export const AuthTemplate = ({ children }: AuthTemplateProps) => {
  return (
    // Layout: Pantalla completa (min-h-screen), fondo gris, centrado flex
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Aquí inyectamos el Organismo */}
        {children}
        
        <div className="text-center text-xs text-slate-400">
          &copy; 2025 Tu Empresa de Inventario
        </div>
      </div>
    </div>
  );
};