'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Si el usuario ya está logueado, redirige
  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  // Mostrar loader mientras verifica autenticación o mientras redirige
  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}