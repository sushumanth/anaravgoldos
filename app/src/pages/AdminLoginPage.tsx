import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DUMMY_ADMIN_CREDENTIALS, isAdminAuthenticated, signInAdmin } from '@/lib/admin-auth';

type LoginState = {
  from?: {
    pathname?: string;
  };
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(DUMMY_ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(DUMMY_ADMIN_CREDENTIALS.password);

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const state = location.state as LoginState | null;
  const targetPath = state?.from?.pathname ?? '/admin';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const success = signInAdmin(email, password);
    if (!success) {
      toast.error('Invalid admin email or password');
      return;
    }

    toast.success('Logged in as admin');
    navigate(targetPath, { replace: true });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-zinc-400">
              Use dummy credentials for now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button className="w-full" type="submit">
                Login as Admin
              </Button>
            </form>

            <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
              <p className="font-medium">Dummy Credentials</p>
              <p>Email: {DUMMY_ADMIN_CREDENTIALS.email}</p>
              <p>Password: {DUMMY_ADMIN_CREDENTIALS.password}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
