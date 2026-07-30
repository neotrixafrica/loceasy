import { RegisterPage } from '@/components/views/RegisterPage';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <RegisterPage />
      </main>
    </div>
  );
}
