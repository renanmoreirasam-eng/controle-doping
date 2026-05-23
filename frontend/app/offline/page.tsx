export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Você está offline
        </h1>

        <p className="mt-4 text-slate-600">
          Não foi possível conectar ao sistema Controle de Doping.
          Verifique sua internet e tente novamente.
        </p>

        <a
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800"
        >
          Tentar novamente
        </a>
      </div>
    </main>
  );
}