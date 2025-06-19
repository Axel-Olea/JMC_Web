// src/api/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',  // ajusta al backend
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
