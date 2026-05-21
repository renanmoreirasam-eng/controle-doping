'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '../services/auth';

const allMenus = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['ADMIN', 'COORDINATOR'],
  },
  {
    name: 'Jogos',
    href: '/dashboard/matches',
    icon: '🏟️',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Escalas',
    href: '/dashboard/scales',
    icon: '📋',
    roles: ['ADMIN', 'COORDINATOR', 'OFFICIAL'],
  },
  {
    name: 'Oficiais',
    href: '/dashboard/officials',
    icon: '👥',
    roles: ['ADMIN', 'COORDINATOR'],
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

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  if (!mounted) {
    return (
      <aside className="w-72 bg-slate-950 text-white min-h-screen px-5 py-6 border-r border-slate-800" />
    );
  }

  const rawRole =
    user?.role ||
    user?.user?.role ||
    '';

  const userRole = String(rawRole).trim().toUpperCase();

  const menus = allMenus.filter((menu) =>
    menu.roles.includes(userRole),
  );

  return (
    <aside className="w-72 bg-slate-950 text-white min-h-screen px-5 py-6 border-r border-slate-800">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-black text-xl">
            CD
          </div>

          <div>
            <h1 className="text-xl font-black leading-tight">
              Controle
            </h1>

            <p className="text-slate-400 text-sm">
              Doping System
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold px-3">
          Menu
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                ${
                  active
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <span
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center text-base
                  ${
                    active
                      ? 'bg-slate-100'
                      : 'bg-slate-900 group-hover:bg-slate-700'
                  }
                `}
              >
                {menu.icon}
              </span>

              <span className="font-semibold">
                {menu.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-4">
        <p className="text-sm font-bold">
          {user?.name || 'Usuário'}
        </p>

        <p className="text-xs text-slate-400 mt-1">
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
  );
}