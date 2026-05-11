import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;