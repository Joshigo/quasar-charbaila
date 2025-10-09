import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

export function useAuth() {
  const router = useRouter();
  const auth = useAuthStore();

  const onLogout = async () => {
    auth.logout();
    await router.push('/login');
  };

  return {
    // state
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.token,
    // actions
    onLogout,
  };
}
