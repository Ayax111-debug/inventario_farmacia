import api from '../api/axios';

export const authService = {
  login: async (username: string, password : string) =>{

    const response = await api.post('/token/',{username, password});
    return response.data;

  },


  logout: async () => {
    try {
      await api.post('/logout/');
    } finally {
      localStorage.removeItem('username');
    }
  },


  checkAuth: async () => {
    const response = await api.get('/me/');
    return response.data;
  }
};