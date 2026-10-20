import axios from "axios";
import { Server } from "App";

// Dedicated instance: credentials are attached only to the practice API.
const practiceApi = axios.create();
practiceApi.interceptors.request.use((config) => {
  config.baseURL = `${Server}/api/v1/practiceInterview`;
  config.headers.Authorization = `Bearer ${localStorage.getItem("token") || ""}`;
  return config;
});

export default practiceApi;
