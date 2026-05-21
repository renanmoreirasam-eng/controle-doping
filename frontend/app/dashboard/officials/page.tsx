'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Official = {
  id: string;
  phone: string;
  pixKey: string;
  active: boolean;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [role, setRole] = useState('OFFICIAL');
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [active, setActive] = useState(true);

  async function loadOfficials() {
    const response = await api.get('/officials');
    setOfficials(response.data);
  }

  useEffect(() => {
    loadOfficials();
  }, []);

  const activeOfficials = officials.filter(
    (official) => official.active,
  ).length;

  const inactiveOfficials = officials.filter(
    (official) => !official.active,
  ).length;

  const filteredOfficials = officials.filter((official) => {
    const value = `
      ${official.user.name}
      ${official.user.email}
      ${official.phone}
      ${official.pixKey}
    `.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  function clearForm() {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setPixKey('');
    setActive(true);
    setRole('OFFICIAL');
  }

  function startEdit(official: Official) {
    setEditingId(official.id);
    setName(official.user.name);
    setEmail(official.user.email);
    setPassword('');
    setPhone(official.phone || '');
    setPixKey(official.pixKey || '');
    setActive(official.active);
    setRole(official.user.role || 'OFFICIAL');
  }

  async function createOfficial() {
    try {
      await api.post('/officials/full', {
        name,
        email,
        password,
        phone,
        pixKey,
        role,
      });

      clearForm();
      await loadOfficials();

      alert('Oficial cadastrado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao cadastrar oficial',
      );
    }
  }

  async function updateOfficial() {
    if (!editingId) return;

    try {
      await api.patch(`/officials/${editingId}`, {
        name,
        email,
        phone,
        pixKey,
        active,
        role,
      });

      clearForm();
      await loadOfficials();

      alert('Oficial atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao atualizar oficial',
      );
    }
  }

  async function handleSubmit() {
    if (!name || !email || !phone) {
      alert('Preencha nome, e-mail e telefone');
      return;
    }

    if (!editingId && !password) {
      alert('Informe a senha do oficial');
      return;
    }

    if (editingId) {
      await updateOfficial();
      return;
    }

    await createOfficial();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Gestão operacional
              </p>

              <h1 className="text-4xl font-black mt-1">
                Oficiais
              </h1>
            </div>

            <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold">
              {officials.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Total de oficiais
                  </p>

                  <h2 className="text-4xl font-black mt-2">
                    {officials.length}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Ativos
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-green-600">
                    {activeOfficials}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Inativos
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-red-600">
                    {inactiveOfficials}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl">
                  ⛔
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId
                    ? 'Editar oficial'
                    : 'Cadastrar oficial'}
                </h2>

                <p className="text-slate-500 mt-1">
                  Mantenha os dados operacionais e financeiros atualizados.
                </p>
              </div>

              {editingId && (
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                  Modo edição
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {!editingId && (
                <input
                  type="password"
                  className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}

              <select
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ADMIN">Administrador</option>
                <option value="COORDINATOR">Coordenador</option>
                <option value="OFFICIAL">Oficial</option>
              </select>  

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Chave PIX"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />

              {editingId && (
                <select
                  className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={active ? 'true' : 'false'}
                  onChange={(e) =>
                    setActive(e.target.value === 'true')
                  }
                >
                  <option value="true">
                    Ativo
                  </option>

                  <option value="false">
                    Inativo
                  </option>
                </select>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
              >
                {editingId
                  ? 'Salvar edição'
                  : 'Cadastrar oficial'}
              </button>

              {editingId && (
                <button
                  onClick={clearForm}
                  className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  Lista de oficiais
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte, filtre e edite os oficiais cadastrados.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 min-w-[320px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Buscar por nome, e-mail, telefone ou PIX..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredOfficials.map((official) => (
                <div
                  key={official.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black">
                        {official.user.name
                          ?.slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-xl font-black">
                          {official.user.name}
                        </h3>

                        <p className="text-slate-500">
                          {official.user.email}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            📱 {official.phone || 'Sem telefone'}
                          </span>

                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            🔑 PIX: {official.pixKey || 'Não informado'}
                          </span>

                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            Perfil:{' '}
                            {official.user.role === 'ADMIN'
                              ? 'Administrador'
                              : official.user.role === 'COORDINATOR'
                                ? 'Coordenador'
                                : official.user.role === 'OFFICIAL'
                                  ? 'Oficial'
                                  : official.user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                        official.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {official.active
                        ? 'Ativo'
                        : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => startEdit(official)}
                      className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}

              {filteredOfficials.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">
                    👥
                  </div>

                  <h3 className="text-xl font-bold">
                    Nenhum oficial encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Ajuste sua busca ou cadastre um novo oficial.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}