import { useState, type FormEvent } from 'react';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ShadcnAdminLoginProps = {
  error: string;
  loading: boolean;
  onLogin: (email: string, password: string) => void | Promise<void>;
};

export function ShadcnAdminLogin({ error, loading, onLogin }: ShadcnAdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onLogin(email, password);
  };

  return (
    <main dir="rtl" className="dark grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-50">
      <Card className="w-full max-w-md border-white/10 bg-zinc-900/80 text-zinc-50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-md bg-orange-500 text-zinc-950">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl font-black">دخول الإدارة</CardTitle>
          <p className="text-sm text-zinc-400">إدارة الطلبات والمنتجات من مكان واحد.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              البريد الإلكتروني
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" className="h-11 border-white/10 bg-zinc-950 pr-10 text-zinc-100" required />
              </div>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              كلمة المرور
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" className="h-11 border-white/10 bg-zinc-950 pr-10 text-zinc-100" required />
              </div>
            </label>
            {error ? <p className="rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p> : null}
            <Button type="submit" disabled={loading} className="min-h-11 bg-orange-500 text-zinc-950 hover:bg-orange-400">
              {loading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
