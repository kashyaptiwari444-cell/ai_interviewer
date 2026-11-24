import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 90000,
  headers: { "Content-Type": "application/json" }
});

export const startInterview = (payload) => api.post("/interview/start/", payload);
export const sendAnswer = (payload) => api.post("/interview/chat/", payload);
export const endInterview = (session_id) => api.post("/interview/end/", { session_id });
export const checkHealth = () => api.get("/health/");
export default api;