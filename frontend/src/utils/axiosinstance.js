import axios from "axios";
import { BASE_URL } from "./apiPaths";
import { supabase } from "../lib/supabase";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
