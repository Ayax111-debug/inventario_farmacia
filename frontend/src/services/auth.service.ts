// src/services/auth.service.ts
import axios from 'axios';

// Definimos la URL base (idealmente esto va en variables de entorno .env)
// src/services/auth.service.ts

// ... imports ...
const API_URL = 'http://127.0.0.1:8000/api'; // Ojo: sin la barra al final si la pones abajo

export const authService = {
  login: async (username: string, password: string) => {
    try {
      // CAMBIO IMPORTANTE: Apuntamos a la vista que acabamos de configurar
      const response = await axios.post(`${API_URL}/token/`, { 
        username, 
        password 
      });
      
      // La respuesta exitosa traerá: { access: "...", refresh: "..." }
      if (response.data.access) {
          // Guardamos el token en localStorage para no perder la sesión
          localStorage.setItem('token', response.data.access);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};