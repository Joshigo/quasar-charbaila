import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

export function useLogin() {
  const router = useRouter();
  const auth = useAuthStore();

  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const onLogin = async () => {
    error.value = null;
    if (!email.value || !password.value) {
      error.value = 'Ingresa email y contraseña';
      return;
    }
    loading.value = true;
    try {
      await auth.login(email.value, password.value);
      await router.push('/');
    } catch {
      error.value = 'Credenciales inválidas o error de red';
    } finally {
      loading.value = false;
    }
  };

  return {
    // state
    email,
    password,
    loading,
    error,
    // actions
    onLogin,
  };
}
