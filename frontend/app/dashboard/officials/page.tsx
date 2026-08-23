"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { api } from "../../../services/api";
import { ConfirmModal } from "../../../components/ConfirmModal";

type Official = {
  id: string;
  phone: string | null;
  pixKey: string | null;
  active: boolean;
  documentType?: string | null;
  documentNumber?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  address?: string | null;
  shirtSize?: string | null;
  operationalRole?: string | null;
  personalDataUpdatedAt?: string | null;
  user: {
    id?: string;
    name: string;
    email?: string | null;
    role?: string | null;
  };
};

type OfficialForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  pixKey: string;
  active: boolean;
  role: string;
  documentType: string;
  documentNumber: string;
  cpf: string;
  birthDate: string;
  address: string;
  shirtSize: string;
  operationalRole: string;
};

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant?: "danger" | "success" | "warning" | "default";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
};

type ResetPasswordState = {
  open: boolean;
  official: Official | null;
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  saving: boolean;
};

const initialResetPasswordState: ResetPasswordState = {
  open: false,
  official: null,
  newPassword: "",
  confirmPassword: "",
  showNewPassword: false,
  showConfirmPassword: false,
  saving: false,
};

const emptyForm: OfficialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  pixKey: "",
  active: true,
  role: "OFFICIAL",
  documentType: "RG",
  documentNumber: "",
  cpf: "",
  birthDate: "",
  address: "",
  shirtSize: "",
  operationalRole: "DCO",
};

function getStoredUserRole() {
  if (typeof window === "undefined") return null;

  const possibleKeys = ["user", "authUser", "currentUser"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      const parsed = JSON.parse(value);

      if (parsed?.role) return parsed.role;
      if (parsed?.user?.role) return parsed.user.role;
    } catch {
      // Ignora valores que não estão em JSON.
    }
  }

  return null;
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function formatDateBR(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function formatCpf(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

  return onlyNumbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function clearCpf(value: string) {
  return value.replace(/\D/g, "");
}

function officialToForm(official: Official): OfficialForm {
  return {
    name: official.user.name || "",
    email: official.user.email || "",
    password: "",
    phone: official.phone || "",
    pixKey: official.pixKey || "",
    active: official.active,
    role: official.user.role || "OFFICIAL",
    documentType: official.documentType || "RG",
    documentNumber: official.documentNumber || "",
    cpf: official.cpf ? formatCpf(official.cpf) : "",
    birthDate: formatDateForInput(official.birthDate),
    address: official.address || "",
    shirtSize: official.shirtSize || "",
    operationalRole: official.operationalRole || "DCO",
  };
}

function buildPayload(form: OfficialForm, includeAdminFields = true) {
  return {
    ...(includeAdminFields
      ? {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          active: form.active,
        }
      : {}),
    phone: form.phone.trim(),
    pixKey: form.pixKey.trim() || null,
    documentType: form.documentType.trim() || null,
    documentNumber: form.documentNumber.trim() || null,
    cpf: form.cpf.trim() ? clearCpf(form.cpf) : null,
    birthDate: form.birthDate || null,
    address: form.address.trim() || null,
    shirtSize: form.shirtSize.trim() || null,
    operationalRole: form.operationalRole.trim() || null,
  };
}

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [myOfficial, setMyOfficial] = useState<Official | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingMyData, setSavingMyData] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<OfficialForm>(emptyForm);
  const [myForm, setMyForm] = useState<OfficialForm>(emptyForm);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
    variant: "default",
    confirmText: "Fechar",
  });
  const [resetPasswordModal, setResetPasswordModal] =
    useState<ResetPasswordState>(initialResetPasswordState);

  const isAdmin = currentUserRole === "ADMIN";
  const canEditOwnData = false;

  function closeModal() {
    setModal((current) => ({
      ...current,
      open: false,
      onConfirm: undefined,
    }));
  }

  function showModal(data: Omit<ModalState, "open">) {
    setModal({
      open: true,
      ...data,
    });
  }

  function showSuccess(title: string, message: string) {
    showModal({
      title,
      message,
      variant: "success",
      confirmText: "Fechar",
    });
  }

  function showError(title: string, message: string) {
    showModal({
      title,
      message,
      variant: "danger",
      confirmText: "Fechar",
    });
  }

  function showWarning(title: string, message: string) {
    showModal({
      title,
      message,
      variant: "warning",
      confirmText: "Fechar",
    });
  }

  function updateForm<K extends keyof OfficialForm>(
    field: K,
    value: OfficialForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateMyForm<K extends keyof OfficialForm>(
    field: K,
    value: OfficialForm[K],
  ) {
    setMyForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function loadCurrentUserRole() {
    const storedRole = getStoredUserRole();

    if (storedRole) {
      setCurrentUserRole(storedRole);
    }

    try {
      const response = await api.get("/auth/me");
      const apiRole = response.data?.role || response.data?.user?.role;

      if (apiRole) {
        setCurrentUserRole(apiRole);
        return apiRole as string;
      }
    } catch {
      // Se não conseguir buscar /auth/me, mantém o perfil encontrado no localStorage.
    }

    return storedRole;
  }

  async function loadOfficials() {
    const response = await api.get("/officials");
    setOfficials(response.data);
  }

  async function loadMyOfficial() {
    const response = await api.get("/officials/me");
    const official = response.data as Official;

    setMyOfficial(official);
    setMyForm(officialToForm(official));
  }

  async function loadPage() {
    try {
      setLoading(true);

      const userRole = await loadCurrentUserRole();

      await loadOfficials();
    } catch (error) {
      console.error("Erro ao carregar oficiais:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeOfficials = officials.filter(
    (official) => official.active,
  ).length;

  const inactiveOfficials = officials.filter(
    (official) => !official.active,
  ).length;

  const filteredOfficials = officials
    .filter((official) => {
      const value = isAdmin
        ? `
          ${official.user.name}
          ${official.user.email}
          ${official.phone}
          ${official.pixKey}
          ${official.documentType}
          ${official.documentNumber}
          ${official.cpf}
          ${official.address}
          ${official.shirtSize}
          ${official.operationalRole}
        `.toLowerCase()
        : `
          ${official.user.name}
          ${official.phone}
          ${official.address}
        `.toLowerCase();

      return value.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const roleOrder = (role?: string | null) => {
        const normalizedRole = String(role || '').trim().toUpperCase();

        if (normalizedRole === 'DCO') return 0;
        if (normalizedRole === 'ESCOLTA') return 1;

        return 2;
      };

      const roleComparison = roleOrder(a.operationalRole) - roleOrder(b.operationalRole);

      if (roleComparison !== 0) return roleComparison;

      return String(a.user.name || '').localeCompare(
        String(b.user.name || ''),
        'pt-BR',
        { sensitivity: 'base' },
      );
    });

  function clearForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(official: Official) {
    if (!isAdmin) return;

    setEditingId(official.id);
    setForm(officialToForm(official));

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function createOfficial() {
    try {
      await api.post("/officials/full", {
        ...buildPayload(form),
        password: form.password,
      });

      clearForm();
      await loadOfficials();

      showSuccess("Oficial cadastrado", "Oficial cadastrado com sucesso!");
    } catch (error: any) {
      showError(
        "Erro ao cadastrar oficial",
        error.response?.data?.message || "Erro ao cadastrar oficial",
      );
    }
  }

  async function updateOfficial() {
    if (!editingId) return;

    try {
      await api.patch(`/officials/${editingId}`, buildPayload(form));

      clearForm();
      await loadOfficials();

      showSuccess("Oficial atualizado", "Oficial atualizado com sucesso!");
    } catch (error: any) {
      showError(
        "Erro ao atualizar oficial",
        error.response?.data?.message || "Erro ao atualizar oficial",
      );
    }
  }

  async function handleSubmit() {
    if (!isAdmin) {
      showWarning(
        "Ação não permitida",
        "Apenas administradores podem cadastrar ou editar oficiais.",
      );
      return;
    }

    if (!form.name || !form.email || !form.phone) {
      showWarning("Campos obrigatórios", "Preencha nome, e-mail e telefone.");
      return;
    }

    if (!editingId && !form.password) {
      showWarning("Senha obrigatória", "Informe a senha do oficial.");
      return;
    }

    if (editingId) {
      await updateOfficial();
      return;
    }

    await createOfficial();
  }

  async function handleSaveMyData() {
    try {
      setSavingMyData(true);

      await api.patch("/officials/me", buildPayload(myForm, false));

      await loadMyOfficial();

      showSuccess("Dados atualizados", "Seus dados foram atualizados com sucesso!");
    } catch (error: any) {
      showError(
        "Erro ao atualizar seus dados",
        error.response?.data?.message || "Erro ao atualizar seus dados",
      );
    } finally {
      setSavingMyData(false);
    }
  }

  function openResetPasswordModal(official: Official) {
    if (!isAdmin) return;

    if (!official.user?.id) {
      showError(
        "Usuário não identificado",
        "Não foi possível identificar o usuário vinculado a este oficial.",
      );
      return;
    }

    setResetPasswordModal({
      ...initialResetPasswordState,
      open: true,
      official,
    });
  }

  function closeResetPasswordModal() {
    if (resetPasswordModal.saving) return;
    setResetPasswordModal(initialResetPasswordState);
  }

  async function handleResetPassword() {
    const official = resetPasswordModal.official;

    if (!official?.user?.id) {
      showError(
        "Usuário não identificado",
        "Não foi possível identificar o usuário vinculado a este oficial.",
      );
      return;
    }

    if (resetPasswordModal.newPassword.length < 8) {
      showWarning(
        "Senha inválida",
        "A nova senha deve possuir no mínimo 8 caracteres.",
      );
      return;
    }

    if (
      resetPasswordModal.newPassword !==
      resetPasswordModal.confirmPassword
    ) {
      showWarning(
        "Senhas diferentes",
        "A confirmação da nova senha não confere.",
      );
      return;
    }

    try {
      setResetPasswordModal((current) => ({
        ...current,
        saving: true,
      }));

      const response = await api.patch(
        `/users/${official.user.id}/reset-password`,
        {
          newPassword: resetPasswordModal.newPassword,
          confirmPassword: resetPasswordModal.confirmPassword,
        },
      );

      setResetPasswordModal(initialResetPasswordState);

      showSuccess(
        "Senha redefinida",
        response.data?.message ||
          `A senha de ${official.user.name} foi redefinida com sucesso.`,
      );
    } catch (error: any) {
      setResetPasswordModal((current) => ({
        ...current,
        saving: false,
      }));

      showError(
        "Erro ao redefinir senha",
        error.response?.data?.message ||
          "Não foi possível redefinir a senha do usuário.",
      );
    }
  }

  function renderPersonalFields(
    values: OfficialForm,
    onChange: <K extends keyof OfficialForm>(
      field: K,
      value: OfficialForm[K],
    ) => void,
    options?: {
      disabledAdminFields?: boolean;
      hideOperationalRole?: boolean;
    },
  ) {
    return (
      <>
        <div className="flex flex-col-reverse">
          <select
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            value={values.documentType}
            onChange={(e) => onChange("documentType", e.target.value)}
          >
            <option value="RG">RG</option>
            <option value="RNE">RNE</option>
            <option value="CNH">CNH</option>
            <option value="OUTRO">Outro</option>
          </select>
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Tipo de documento
          </label>
        </div>

        <div className="flex flex-col-reverse">
          <input
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            placeholder="Documento"
            value={values.documentNumber}
            onChange={(e) => onChange("documentNumber", e.target.value)}
          />
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Nº documento
          </label>
        </div>

        <div className="flex flex-col-reverse">
          <input
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            placeholder="000.000.000-00"
            maxLength={14}
            value={values.cpf}
            onChange={(e) => onChange("cpf", formatCpf(e.target.value))}
          />
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            CPF
          </label>
        </div>

        <div className="flex flex-col-reverse">
          <input
            type="date"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            value={values.birthDate}
            onChange={(e) => onChange("birthDate", e.target.value)}
          />
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Data de nascimento
          </label>
        </div>

        <div className="flex flex-col-reverse">
          <select
            disabled={options?.hideOperationalRole}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)] disabled:bg-slate-100 disabled:text-slate-500"
            value={values.operationalRole}
            onChange={(e) => onChange("operationalRole", e.target.value)}
          >
            <option value="DCO">DCO</option>
            <option value="ESCOLTA">Escolta</option>
          </select>
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Função operacional
          </label>
        </div>

        <div className="flex flex-col-reverse">
          <select
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            value={values.shirtSize}
            onChange={(e) => onChange("shirtSize", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
            <option value="XGG">XGG</option>
          </select>
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Tamanho
          </label>
        </div>

        <div className="md:col-span-2 xl:col-span-3 flex flex-col-reverse">
          <input
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
            placeholder="Endereço completo"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
          <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
            Endereço
          </label>
        </div>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] inline-flex items-center gap-2">
                👥 Gestão operacional
              </p>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Oficiais
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Consulte os oficiais e, para administradores, gerencie cadastros, acessos e senhas.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {isAdmin
                ? `${officials.length} cadastrados`
                : `${officials.length} contatos`}
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
              Carregando oficiais...
            </div>
          ) : (
            <>
              {canEditOwnData && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                  Meus dados
                </h2>

                <p className="text-slate-500 mt-1">
                  Visualize e atualize seus dados pessoais e informações de contato.
                </p>
              </div>

              {!myOfficial ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                    Cadastro de oficial não encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Seu usuário ainda não está vinculado a um cadastro de oficial.
                    Procure um administrador.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="flex flex-col-reverse">
                      <input
                        disabled
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 text-slate-500"
                        value={myForm.name}
                      />
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Nome completo
                      </label>
                    </div>

                    <div className="flex flex-col-reverse">
                      <input
                        disabled
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 text-slate-500"
                        value={myForm.email}
                      />
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        E-mail
                      </label>
                    </div>

                    <div className="flex flex-col-reverse">
                      <input
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                        placeholder="Telefone"
                        value={myForm.phone}
                        onChange={(e) => updateMyForm("phone", e.target.value)}
                      />
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Telefone
                      </label>
                    </div>

                    <div className="flex flex-col-reverse">
                      <input
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                        placeholder="Chave PIX"
                        value={myForm.pixKey}
                        onChange={(e) => updateMyForm("pixKey", e.target.value)}
                      />
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Chave PIX
                      </label>
                    </div>

                    {renderPersonalFields(myForm, updateMyForm, {
                      hideOperationalRole: true,
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleSaveMyData}
                      disabled={savingMyData}
                      className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingMyData
                        ? "Salvando..."
                        : "Salvar meus dados"}
                    </button>
                  </div>
                </>
              )}
            </div>
              )}

              {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-8">
                <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-500 text-sm font-semibold">
                        Total de oficiais
                      </p>

                      <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                        {officials.length}
                      </h2>
                    </div>

                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-500 text-sm font-bold">
                        Ativos
                      </p>

                      <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                        {activeOfficials}
                      </h2>
                    </div>

                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                      ✅
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-semibold">
                        Inativos
                      </p>

                      <h2 className="text-3xl lg:text-4xl font-black mt-2 text-red-600">
                        {inactiveOfficials}
                      </h2>
                    </div>

                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl">
                      ⛔
                    </div>
                  </div>
                </div>
                </div>
              )}

              {isAdmin && (
              <div
                ref={formRef}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6 mb-8 scroll-mt-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                      {editingId
                        ? "Editar oficial"
                        : "Cadastrar oficial"}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Mantenha os dados operacionais, pessoais e financeiros atualizados.
                    </p>
                  </div>

                  {editingId && (
                    <span className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-2xl text-sm font-bold border border-slate-200">
                      Modo edição
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="flex flex-col-reverse">
                    <input
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                    />
                    <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Nome completo <span className="text-red-600">*</span>
                    </label>
                  </div>

                  <div className="flex flex-col-reverse">
                    <input
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      placeholder="E-mail"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                    />
                    <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      E-mail <span className="text-red-600">*</span>
                    </label>
                  </div>

                  {!editingId && (
                    <div className="flex flex-col-reverse">
                      <input
                        type="password"
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                        placeholder="Senha"
                        value={form.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                      />
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Senha <span className="text-red-600">*</span>
                      </label>
                    </div>
                  )}

                  <div className="flex flex-col-reverse">
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      value={form.role}
                      onChange={(e) => updateForm("role", e.target.value)}
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="COORDINATOR">Coordenador</option>
                      <option value="OFFICIAL">Oficial</option>
                    </select>
                    <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Perfil <span className="text-red-600">*</span>
                    </label>
                  </div>

                  <div className="flex flex-col-reverse">
                    <input
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      placeholder="Telefone"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                    />
                    <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Telefone <span className="text-red-600">*</span>
                    </label>
                  </div>

                  <div className="flex flex-col-reverse">
                    <input
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      placeholder="Chave PIX"
                      value={form.pixKey}
                      onChange={(e) => updateForm("pixKey", e.target.value)}
                    />
                    <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Chave PIX
                    </label>
                  </div>

                  {editingId && (
                    <div className="flex flex-col-reverse">
                      <select
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                        value={form.active ? "true" : "false"}
                        onChange={(e) =>
                          updateForm("active", e.target.value === "true")
                        }
                      >
                        <option value="true">
                          Ativo
                        </option>

                        <option value="false">
                          Inativo
                        </option>
                      </select>
                      <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                        Situação <span className="text-red-600">*</span>
                      </label>
                    </div>
                  )}

                  {renderPersonalFields(form, updateForm)}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleSubmit}
                    className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                  >
                    {editingId
                      ? "Salvar edição"
                      : "Cadastrar oficial"}
                  </button>

                  {editingId && (
                    <button
                      onClick={clearForm}
                      className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              )}

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                      Lista de oficiais
                    </h2>

                    <p className="text-slate-500 mt-1">
                      {isAdmin
                        ? "Consulte, filtre e edite a base de oficiais."
                        : "Consulte a lista com nome, telefone e endereço dos oficiais."}
                    </p>
                  </div>

                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 w-full xl:w-[380px] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder={isAdmin ? "Buscar por nome, e-mail, telefone, CPF, documento ou endereço..." : "Buscar por nome, telefone ou endereço..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {filteredOfficials.map((official) => (
                    <div
                      key={official.id}
                      className="min-w-0 overflow-hidden border border-slate-200 rounded-3xl p-5 hover:border-[var(--cdb-blue)] transition bg-white"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="h-14 w-14 shrink-0 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-2xl font-black">
                            {official.user.name
                              ?.slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="min-w-0 break-words text-xl font-black text-[var(--cdb-dark)]">
                                {official.user.name}
                              </h3>

                              {isAdmin && official.operationalRole && (
                                <span className="bg-blue-50 text-[var(--cdb-blue)] px-3 py-1 rounded-full text-xs font-black border border-blue-100">
                                  {official.operationalRole}
                                </span>
                              )}
                            </div>

                            {isAdmin && (
                              <p className="break-all text-slate-500">
                                {official.user.email}
                              </p>
                            )}

                            <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                              <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                📱 {official.phone || "Sem telefone"}
                              </span>

                              {isAdmin && (
                                <>
                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    🔑 PIX: {official.pixKey || "Não informado"}
                                  </span>

                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    Perfil:{" "}
                                    {official.user.role === "ADMIN"
                                      ? "Administrador"
                                      : official.user.role === "COORDINATOR"
                                        ? "Coordenador"
                                        : official.user.role === "OFFICIAL"
                                          ? "Oficial"
                                          : official.user.role}
                                  </span>

                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    🪪 {official.documentType || "Doc"}:{" "}
                                    {official.documentNumber || "Não informado"}
                                  </span>

                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    CPF:{" "}
                                    {official.cpf
                                      ? formatCpf(official.cpf)
                                      : "Não informado"}
                                  </span>

                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    🎂 {formatDateBR(official.birthDate)}
                                  </span>

                                  <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                    👕 {official.shirtSize || "Não informado"}
                                  </span>
                                </>
                              )}

                              {official.address && (
                                <span className="max-w-full break-words bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                                  📍 {official.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <span
                            className={`w-fit shrink-0 px-4 py-2 rounded-2xl text-sm font-bold ${
                              official.active
                                ? "bg-[var(--cdb-green-soft)] text-[var(--cdb-green)]"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {official.active
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                          <button
                            onClick={() => startEdit(official)}
                            className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => openResetPasswordModal(official)}
                            className="border border-amber-200 bg-amber-50 px-5 py-3 rounded-2xl font-bold text-amber-800 hover:bg-amber-100 transition"
                          >
                            🔑 Redefinir senha
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredOfficials.length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2 bg-slate-50">
                      <div className="text-6xl mb-4">
                        👥
                      </div>

                      <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                        Nenhum oficial encontrado
                      </h3>

                      <p className="text-slate-500 mt-2">
                        Ajuste sua busca ou cadastre um novo oficial.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      {resetPasswordModal.open && resetPasswordModal.official && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Fechar redefinição de senha"
            onClick={closeResetPasswordModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-[81] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-800">
                    🔑 Segurança
                  </div>

                  <h2 className="mt-3 text-2xl font-black text-[var(--cdb-dark)]">
                    Redefinir senha
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Usuário:{" "}
                    <span className="font-bold text-slate-700">
                      {resetPasswordModal.official.user.name}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeResetPasswordModal}
                  disabled={resetPasswordModal.saving}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                  Nova senha
                </label>

                <div className="relative">
                  <input
                    type={
                      resetPasswordModal.showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={resetPasswordModal.newPassword}
                    onChange={(e) =>
                      setResetPasswordModal((current) => ({
                        ...current,
                        newPassword: e.target.value,
                      }))
                    }
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 focus:border-[var(--cdb-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Mínimo de 8 caracteres"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setResetPasswordModal((current) => ({
                        ...current,
                        showNewPassword: !current.showNewPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
                    aria-label={
                      resetPasswordModal.showNewPassword
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {resetPasswordModal.showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--cdb-dark)]">
                  Confirmar nova senha
                </label>

                <div className="relative">
                  <input
                    type={
                      resetPasswordModal.showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={resetPasswordModal.confirmPassword}
                    onChange={(e) =>
                      setResetPasswordModal((current) => ({
                        ...current,
                        confirmPassword: e.target.value,
                      }))
                    }
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 focus:border-[var(--cdb-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Digite novamente a nova senha"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setResetPasswordModal((current) => ({
                        ...current,
                        showConfirmPassword:
                          !current.showConfirmPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
                    aria-label={
                      resetPasswordModal.showConfirmPassword
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {resetPasswordModal.showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                O administrador não visualiza a senha atual do usuário. A nova senha substitui a anterior imediatamente.
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeResetPasswordModal}
                disabled={resetPasswordModal.saving}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetPasswordModal.saving}
                className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-black text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetPasswordModal.saving
                  ? "Redefinindo..."
                  : "Redefinir senha"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.confirmText || "Fechar"}
        cancelText={modal.cancelText}
        onCancel={closeModal}
        onClose={closeModal}
        onConfirm={async () => {
          if (modal.onConfirm) {
            await modal.onConfirm();
            return;
          }

          closeModal();
        }}
      />

    </main>
  );
}
