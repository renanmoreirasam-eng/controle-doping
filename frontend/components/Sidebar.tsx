'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '../services/auth';
import { PendingAnnouncementsModal } from './PendingAnnouncementsModal';

const allMenus = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  
  
  {
    name: 'Escalas',
    href: '/dashboard/scales',
    icon: '📋',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Jogos',
    href: '/dashboard/matches',
    icon: '🏟️',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
   {
    name: 'Estoque de Kits',
    href: '/dashboard/inventory',
    icon: '📦',
    roles: ['ADMIN', 'COORDINATOR'],
  },
  {
    name: 'Inspeções de Sala',
    href: '/dashboard/room-inspections',
    icon: '🔎',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Atletas Sorteados',
    href: '/dashboard/drawn-athletes',
    icon: '🎲',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Oficiais',
    href: '/dashboard/officials',
    icon: '👥',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Comunicados',
    href: '/dashboard/announcements',
    icon: '📢',
    roles: ['ADMIN'],
  },
  {
    name: 'Campeonatos',
    href: '/dashboard/championships',
    icon: '🏆',
    roles: ['ADMIN'],
  },
  {
    name: 'Estádios',
    href: '/dashboard/stadiums',
    icon: '📍',
    roles: ['ADMIN', 'COORDINATOR'],
  },
  {
    name: 'Times',
    href: '/dashboard/teams',
    icon: '⚽',
    roles: ['ADMIN', 'COORDINATOR'],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const rawRole = user?.role || user?.user?.role || '';

  const userRole = String(rawRole).trim().toUpperCase();

  const menus = allMenus.filter((menu) => menu.roles.includes(userRole));

  function renderLogo(compact = false) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-2xl p-2 shadow-lg shadow-blue-950/20">
          <img
            src="/CDB_logo_colorido_retangular.png"
            alt="Controle de Doping Brasil"
            className={`${compact ? 'h-9' : 'h-12'} w-auto object-contain`}
          />
        </div>

        {!compact && (
          <div>
            <h1 className="text-xl font-black leading-tight text-white">
              CDB
            </h1>

            <p className="text-blue-100 text-xs font-semibold tracking-wide">
              Controle de Doping Brasil
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderMenu(onNavigate?: () => void) {
    return (
      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {
          const active =
  menu.href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === menu.href ||
      pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={onNavigate}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                ${
                  active
  ? 'bg-white text-[var(--cdb-blue)] shadow-xl shadow-blue-950/20'
  : 'text-blue-50 hover:bg-white/12 hover:text-white'                }
              `}
            >
              <span
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center text-base transition
                  ${
                    active
                      ? 'bg-white/80'
                      : 'bg-white/10 group-hover:bg-white/20'
                  }
                `}
              >
                {menu.icon}
              </span>

              <span className="font-semibold">{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  if (!mounted) {
    return (
      <>
        <div className="lg:hidden h-16 bg-[var(--cdb-blue)]" />
        <aside className="hidden lg:block w-72 bg-[var(--cdb-blue)] min-h-screen" />
      </>
    );
  }

  return (
    <>
      <header className="lg:hidden bg-[var(--cdb-blue)] text-white px-4 py-3 sticky top-0 z-50 border-b border-white/10 shadow-lg shadow-blue-950/20">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {renderLogo(true)}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-white/12 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold transition"
          >
            Menu
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[999]">
          <button
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <aside className="absolute left-0 top-0 h-full w-[88%] max-w-86 bg-[var(--cdb-blue)] text-white p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              {renderLogo()}

              <button
                onClick={() => setOpen(false)}
                className="bg-white/12 hover:bg-white/20 px-3 py-2 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-blue-100 font-semibold px-3 mb-4">
              Menu
            </p>

            {renderMenu(() => setOpen(false))}

            <div className="mt-8 bg-white/10 border border-white/15 rounded-3xl p-4">
              <p className="text-sm font-bold">{user?.name || 'Usuário'}</p>

              <p className="text-xs text-blue-100 mt-1">
                Perfil: {userRole || 'Não identificado'}
              </p>

              <button
                onClick={logout}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-sm font-semibold transition"
              >
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden lg:block w-72 bg-[var(--cdb-blue)] text-white min-h-screen px-5 py-6 border-r border-white/10 shrink-0 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-[var(--cdb-green)]/25 blur-2xl" />
        <div className="absolute -left-20 bottom-24 w-48 h-48 rounded-full bg-[var(--cdb-yellow)]/25 blur-2xl" />

        <div className="relative mb-10">
          {renderLogo()}
        </div>

        <div className="relative mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100 font-semibold px-3">
            Menu
          </p>
        </div>

        <div className="relative">{renderMenu()}</div>

        <div className="relative mt-10 bg-white/10 border border-white/15 rounded-3xl p-4">
          <p className="text-sm font-bold">{user?.name || 'Usuário'}</p>

          <p className="text-xs text-blue-100 mt-1">
            Perfil: {userRole || 'Não identificado'}
          </p>

          <button
            onClick={logout}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-sm font-semibold transition"
          >
            Sair
          </button>
        </div>
      </aside>

      <PendingAnnouncementsModal />
    </>
  );
}
