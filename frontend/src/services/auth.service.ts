// src/services/auth.service.ts
import axios from 'axios';

// Definimos la URL base (idealmente esto va en variables de entorno .env)
const API_URL = 'http://127.0.0.1:8000/api';

export const authService = {
  
  // Función para Login
  login: async (username: string, password: string) => {
    try {
      // NOTA: Para login, usualmente es '/token/' o '/login/'. 
      // Ajusta esta línea según tu urls.py de Django.
      const response = await axios.post(`${API_URL}/usuarios/login/`, { 
        username, 
        password 
      });
      return response.data;
    } catch (error) {
      // Re-lanzamos el error para que el componente lo maneje
      throw error;
    }
  }
};