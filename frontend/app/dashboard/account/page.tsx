"use client";

import { FormEvent, useEffect, useState } from "react";

import { Sidebar } from "../../../components/Sidebar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";
import { getUser } from "../../../services/auth";

type ModalVariant = "danger" | "success" | "warning" | "default";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
};

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
};

type MyOfficial = {
  id: string;
  phone?: string | null;
  pixKey?: string | null;
  operationalRole?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  address?: string | null;
  shirtSize?: string | null;
};

type MyDataForm = {
  phone: string;
  pixKey: string;
  documentType: string;
  documentNumber: string;
  cpf: string;
  birthDate: string;
  address: string;
  shirtSize: string;
};

const emptyMyDataForm: MyDataForm = {
  phone: "",
  pixKey: "",
  documentType: "RG",
  documentNumber: "",
  cpf: "",
  birthDate: "",
  address: "",
  shirtSize: "",
};

const initialModalState: ModalState = {
  open: false,
  title: "",
  message: "",
  variant: "default",
  confirmText: "Fechar",
};

function getErrorMessage(error: any, fallback: string) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  return Array.isArray(message)
    ? message.join(" ")
    : String(message);
}

function clearCpf(value: string) {
  return value.replace(/\D/g, "");
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function formatCpf(value?: string | null) {
  if (!value) return "-";

  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length !== 11) return value;

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatDateBR(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-black text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-base text-slate-500 transition hover:text-[var(--cdb-blue)]"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          title={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [myOfficial, setMyOfficial] = useState<MyOfficial | null>(null);
  const [myDataForm, setMyDataForm] = useState<MyDataForm>(emptyMyDataForm);
  const [savingMyData, setSavingMyData] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  const [modal, setModal] =
    useState<ModalState>(initialModalState);

  useEffect(() => {
    setUser(getUser());

    async function loadMyOfficial() {
      try {
        const response = await api.get("/officials/me");
        const official = response.data as MyOfficial;

        setMyOfficial(official);
        setMyDataForm({
          phone: official.phone || "",
          pixKey: official.pixKey || "",
          documentType: official.documentType || "RG",
          documentNumber: official.documentNumber || "",
          cpf: official.cpf ? formatCpf(official.cpf) : "",
          birthDate: formatDateForInput(official.birthDate),
          address: official.address || "",
          shirtSize: official.shirtSize || "",
        });
      } catch {
        setMyOfficial(null);
      }
    }

    loadMyOfficial();
  }, []);

  const userName =
    user?.name ||
    user?.user?.name ||
    "Usuário";

  const userEmail =
    user?.email ||
    user?.user?.email ||
    "-";

  const userRole = String(
    user?.role ||
      user?.user?.role ||
      "",
  )
    .trim()
    .toUpperCase();

  function roleLabel(role: string) {
    if (role === "ADMIN") return "Administrador";
    if (role === "COORDINATOR") return "Coordenador";
    if (role === "OFFICIAL") return "Oficial";

    return role || "-";
  }

  function showMessage(
    title: string,
    message: string,
    variant: ModalVariant = "default",
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: "Fechar",
    });
  }

  function updateMyDataForm<K extends keyof MyDataForm>(
    field: K,
    value: MyDataForm[K],
  ) {
    setMyDataForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveMyData() {
    try {
      setSavingMyData(true);

      await api.patch("/officials/me", {
        phone: myDataForm.phone.trim(),
        pixKey: myDataForm.pixKey.trim() || null,
        documentType: myDataForm.documentType.trim() || null,
        documentNumber: myDataForm.documentNumber.trim() || null,
        cpf: myDataForm.cpf.trim() ? clearCpf(myDataForm.cpf) : null,
        birthDate: myDataForm.birthDate || null,
        address: myDataForm.address.trim() || null,
        shirtSize: myDataForm.shirtSize.trim() || null,
      });

      const response = await api.get("/officials/me");
      setMyOfficial(response.data);

      showMessage(
        "Dados atualizados",
        "Seus dados foram atualizados com sucesso.",
        "success",
      );
    } catch (error: any) {
      showMessage(
        "Não foi possível atualizar seus dados",
        getErrorMessage(
          error,
          "Ocorreu um erro ao atualizar seus dados.",
        ),
        "danger",
      );
    } finally {
      setSavingMyData(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentPassword) {
      showMessage(
        "Senha atual obrigatória",
        "Informe sua senha atual.",
        "warning",
      );
      return;
    }

    if (newPassword.length < 8) {
      showMessage(
        "Nova senha inválida",
        "A nova senha deve possuir no mínimo 8 caracteres.",
        "warning",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "Senhas diferentes",
        "A confirmação da nova senha não confere.",
        "warning",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        "/users/me/password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showMessage(
        "Senha alterada",
        response.data?.message ||
          "Senha alterada com sucesso.",
        "success",
      );
    } catch (error: any) {
      showMessage(
        "Não foi possível alterar a senha",
        getErrorMessage(
          error,
          "Ocorreu um erro ao alterar sua senha.",
        ),
        "danger",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8 lg:py-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cdb-blue-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
              👤 Conta e segurança
            </div>

            <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
              Minha conta
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Consulte seus dados de acesso e altere sua senha com segurança.
            </p>
          </div>
        </header>

        <section className="w-full min-w-0 max-w-full overflow-x-hidden p-3 sm:p-4 lg:p-8">
          <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-[440px_minmax(0,1fr)]">
            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--cdb-blue-soft)] text-2xl">
                    👤
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-lg font-black text-[var(--cdb-dark)]">
                      {userName}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--cdb-blue)]">
                  Meus dados
                </p>

                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-400">
                    Perfil de acesso
                  </p>
                  <p className="mt-1 font-bold text-slate-700">
                    {roleLabel(userRole)}
                  </p>
                </div>

                {myOfficial ? (
                  <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    {myOfficial.operationalRole && (
                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Função operacional
                        </p>
                        <p className="mt-1 font-bold text-slate-700">
                          {myOfficial.operationalRole}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Telefone
                      </label>
                      <input
                        value={myDataForm.phone}
                        onChange={(e) =>
                          updateMyDataForm("phone", e.target.value)
                        }
                        className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Chave PIX
                      </label>
                      <input
                        value={myDataForm.pixKey}
                        onChange={(e) =>
                          updateMyDataForm("pixKey", e.target.value)
                        }
                        className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                      />
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                          Tipo de documento
                        </label>
                        <select
                          value={myDataForm.documentType}
                          onChange={(e) =>
                            updateMyDataForm("documentType", e.target.value)
                          }
                          className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                        >
                          <option value="RG">RG</option>
                          <option value="RNE">RNE</option>
                          <option value="CNH">CNH</option>
                          <option value="OUTRO">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                          Nº documento
                        </label>
                        <input
                          value={myDataForm.documentNumber}
                          onChange={(e) =>
                            updateMyDataForm("documentNumber", e.target.value)
                          }
                          className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                          CPF
                        </label>
                        <input
                          value={myDataForm.cpf}
                          maxLength={14}
                          onChange={(e) =>
                            updateMyDataForm(
                              "cpf",
                              formatCpf(e.target.value),
                            )
                          }
                          className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                          Data de nascimento
                        </label>
                        <input
                          type="date"
                          value={myDataForm.birthDate}
                          onChange={(e) =>
                            updateMyDataForm("birthDate", e.target.value)
                          }
                          className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Tamanho
                      </label>
                      <select
                        value={myDataForm.shirtSize}
                        onChange={(e) =>
                          updateMyDataForm("shirtSize", e.target.value)
                        }
                        className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                      >
                        <option value="">Selecione</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                        <option value="XGG">XGG</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Endereço
                      </label>
                      <input
                        value={myDataForm.address}
                        onChange={(e) =>
                          updateMyDataForm("address", e.target.value)
                        }
                        className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:bg-white focus:ring-4 focus:ring-blue-100 sm:px-4"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveMyData}
                      disabled={savingMyData}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-black text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingMyData
                        ? "Salvando..."
                        : "Salvar meus dados"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    Este usuário não possui cadastro de oficial vinculado.
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                  🔒 Segurança
                </div>

                <h2 className="mt-3 text-xl font-black text-[var(--cdb-dark)]">
                  Alterar senha
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Confirme sua senha atual e informe uma nova senha para sua conta.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 min-w-0 max-w-2xl space-y-5"
              >
                <PasswordField
                  id="currentPassword"
                  label="Senha atual"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  visible={showCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      (value) => !value,
                    )
                  }
                  autoComplete="current-password"
                />

                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                  <PasswordField
                    id="newPassword"
                    label="Nova senha"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                    autoComplete="new-password"
                  />

                  <PasswordField
                    id="confirmPassword"
                    label="Confirmar nova senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    autoComplete="new-password"
                  />
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-600">
                    A nova senha deve possuir pelo menos{" "}
                    <span className="font-black text-[var(--cdb-blue)]">
                      8 caracteres
                    </span>
                    .
                  </p>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving
                      ? "Alterando..."
                      : "Alterar senha"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.confirmText}
        onConfirm={() =>
          setModal(initialModalState)
        }
      />
    </main>
  );
}
