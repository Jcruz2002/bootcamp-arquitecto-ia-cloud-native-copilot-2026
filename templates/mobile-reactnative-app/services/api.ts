import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

export type UserDto = {
  id: number;
  nombre?: string;
  name?: string;
  email?: string;
};

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getUsers(): Promise<UserDto[]> {
  const response = await api.get('/api/v1/users');
  return response.data;
}

export async function getUserById(id: number): Promise<UserDto> {
  const response = await api.get(`/api/v1/users/${id}`);
  return response.data;
}
