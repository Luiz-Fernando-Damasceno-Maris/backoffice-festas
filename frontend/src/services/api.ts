import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Cria a instância base do Axios
const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Envolve a instância com o superpoder do Cache
export const api = setupCache(instance, {
  // O cache vai durar 5 segundos (5000 milissegundos). 
  // Perfeito para segurar o "DDoS" das abas sem mostrar dados muito velhos.
  ttl: 1000 * 5 
});

// Interceptor (Continua igualzinho, injetando o Token do cofre)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@BackofficeFestas:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});