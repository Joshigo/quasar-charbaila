import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginResponse } from 'src/types/auth.interface';
import { api } from 'src/services/api';

const STORAGE_KEY = 'auth';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { token: string; user: User };
      token.value = parsed.token;
      user.value = parsed.user;
    } catch (e) {
      console.error('Failed to parse auth storage', e);
    }
  }

  function saveToStorage() {
    if (token.value && user.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token.value, user: user.value }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    token.value = data.data.token;
    user.value = data.data.user;
    saveToStorage();
    return data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    saveToStorage();
  }

  loadFromStorage();

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    loadFromStorage,
  };
});
