// src/components/molecules/FormField/FormField.tsx
import { Input, type InputProps } from "../../atoms/Input"; 
import { cn } from "../../../lib/utils"; 

interface FormFieldProps extends InputProps {
  label: string;      
  error?: string;     
}

export const FormField = ({ label, error, className, id, ...props }: FormFieldProps) => {
 
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn("space-y-2", className)}>
      
      {/* 1. LABEL (Etiqueta) */}
      <label 
        htmlFor={fieldId} 
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-red-500" 
        )}
      >
        {label}
      </label>

      {/* 2. INPUT (Tu átomo) */}
      <Input 
        id={fieldId} 
        
        className={cn(error && "border-red-500 focus-visible:ring-red-500")} 
        {...props} 
      />

      {/* 3. MENSAJE DE ERROR (Solo aparece si existe) */}
      {error && (
        <p className="text-sm font-medium text-red-500 animate-pulse">
          {error}
        </p>
      )}
      
    </div>
  );
};