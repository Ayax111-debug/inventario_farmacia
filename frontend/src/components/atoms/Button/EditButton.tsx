import * as React from "react"
import { Button, type ButtonProps } from "./Button" // Importa tu botón base
import { cn } from "../../../lib/utils" // Tu utilidad de clases

// Extendemos las props del botón para poder cambiar el texto si queremos
interface EditButtonProps extends ButtonProps {
  label?: string
}

const EditButton = React.forwardRef<HTMLButtonElement, EditButtonProps>(
  ({ label = "Editar", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline" // Usamos la variante que creamos arriba
        size="sm"
        // Combinamos tus clases. 'gap-2' separa icono y texto.
        // 'pl-3 pr-4' es un truco visual: un poco menos de padding a la izquierda 
        // equilibra el peso visual del icono.
        className={cn("gap-2 pl-3 pr-4", className)} 
        {...props}
      >
        {/* El Icono SVG optimizado (16px / w-4 h-4) */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
        <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
    </svg>

       

        
        {/* El texto dinámico */}
        <span>{label}</span>
      </Button>
      
    )
  }
)
EditButton.displayName = "EditButton"

export { EditButton }