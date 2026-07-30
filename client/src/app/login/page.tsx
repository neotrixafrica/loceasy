import { LoginPage } from '@/components/views/LoginPage';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <LoginPage />
      </main>
    </div>
  );
}
