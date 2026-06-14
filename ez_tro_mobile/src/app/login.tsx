import { Redirect } from 'expo-router';

import { LoginScreen } from '@/features/auth/screens/login-screen';
import { useAuth } from '@/features/auth/context/auth-context';

export default function LoginRoute() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/" />;
  }

  return <LoginScreen />;
}
