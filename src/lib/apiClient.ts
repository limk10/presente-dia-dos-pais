/**
 * Instância axios para chamadas client-side → Next.js API Routes.
 * Usa "use client" implicitamente por ser importado só de componentes client.
 */
import axios from "axios";

export const apiClient = axios.create({
  timeout: 15_000,
});

// Extrai o campo `error` do body e o lança como Error para simplificar catches.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const serverMsg = err.response?.data?.error;
    if (serverMsg) {
      return Promise.reject(new Error(serverMsg));
    }
    return Promise.reject(err);
  },
);
