import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const roleSlug = auth?.role || user?.rol?.slug || 'estudiante';
    const roleName = auth?.roleName || user?.rol?.nombre || 'Usuario';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Badges institucionales limpios de acuerdo a la identidad Unifranz
    const roleBadges = {
        admin: { label: 'Administrador', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
        director_clinica: { label: 'Director Clínica', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
        docente: { label: 'Docente Odontólogo', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        estudiante: { label: 'Estudiante', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
        admision: { label: 'Personal Admisión', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
        paciente: { label: 'Paciente', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    };

    const currentBadge = roleBadges[roleSlug] || { label: roleName, bg: 'bg-slate-100 text-slate-800 border-slate-200' };

    // Navegación clínica completa por roles
    const getNavItems = () => {
        const items = [];

        // 1. Dashboard Principal
        items.push({
            name: 'Panel Principal',
            href: route('dashboard'),
            active: route().current('dashboard') || route().current('*.dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        });

        // 2. Módulo de Pacientes (Para personal clínico y administrativo)
        if (['admin', 'director_clinica', 'docente', 'estudiante', 'admision'].includes(roleSlug)) {
            items.push({
                name: 'Pacientes',
                href: route('pacientes.index'),
                active: route().current('pacientes.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
            });
        }

        // 3. Asignación Clínica (Estudiantes <-> Pacientes)
        if (['admin', 'director_clinica', 'docente', 'admision'].includes(roleSlug)) {
            items.push({
                name: 'Asignaciones',
                href: route('asignaciones.index'),
                active: route().current('asignaciones.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                ),
            });
        }

        // 4. Agenda & Citas (Módulo 4 Multi-Recurso)
        if (['admin', 'director_clinica', 'docente', 'estudiante', 'admision'].includes(roleSlug)) {
            items.push({
                name: 'Agenda & Citas',
                href: route('citas.index'),
                active: route().current('citas.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                ),
            });
        }

        // 5. Imágenes & Radiografías (Módulo 5 PSP / CBCT / Fotos)
        if (['admin', 'director_clinica', 'docente', 'estudiante'].includes(roleSlug)) {
            items.push({
                name: 'Imágenes & Radiografías',
                href: route('imagenes.index'),
                active: route().current('imagenes.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                ),
            });
        }



        // 4. Historias Clínicas HC-001
        if (['admin', 'director_clinica', 'docente', 'estudiante'].includes(roleSlug)) {
            items.push({
                name: 'Historias Clínicas',
                href: route('historias-clinicas.index'),
                active: route().current('historias-clinicas.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
            });
        }

        // 5. Módulo 6: Formación y Supervisión Clínica
        if (['admin', 'director_clinica', 'docente', 'estudiante'].includes(roleSlug)) {
            items.push({
                name: 'Formación & Supervisión',
                href: route('supervision.index'),
                active: route().current('supervision.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                ),
            });
        }

        // 6. Gestión de Sillones y Aforo
        if (['admin', 'director_clinica', 'admision'].includes(roleSlug)) {
            items.push({
                name: 'Sillones & Aforo',
                href: route('admision.dashboard'),
                active: route().current('admision.dashboard'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
            });
        }

        // 7. Gestión Integral de Usuarios (CRUD Docentes, Estudiantes, Personal)
        if (['admin', 'director_clinica'].includes(roleSlug)) {
            items.push({
                name: 'Usuarios',
                href: route('usuarios.index'),
                active: route().current('usuarios.*'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ),
            });
        }

        return items;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
            {/* Desktop / Tablet Sidebar (Tema Médico Limpio Unifranz) */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200 shrink-0 shadow-sm z-20">
                {/* Cabecera del Sidebar con Logo Institucional */}
                <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-600/20 text-xl tracking-wider">
                        U
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-base tracking-tight leading-tight">Clínica Unifranz</h1>
                        <p className="text-xs text-teal-600 font-semibold tracking-wide">Gestión Odontológica</p>
                    </div>
                </div>

                {/* Perfil del Usuario en Sidebar */}
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate mb-2">{user.email}</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentBadge.bg}`}>
                        {currentBadge.label}
                    </span>
                </div>

                {/* Enlaces de Navegación */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-teal-50 text-teal-700 font-bold shadow-xs border border-teal-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                            }`}
                        >
                            <span className={item.active ? 'text-teal-600' : 'text-slate-400'}>
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Pie del Sidebar con Botón de Cerrar Sesión */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header Bar */}
            <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                            U
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Clínica Unifranz</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentBadge.bg}`}>
                        {currentBadge.label}
                    </span>
                </div>
            </header>

            {/* Mobile Drawer (Menú Lateral Deslizable) */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                                    U
                                </div>
                                <span className="font-bold text-slate-900">Clínica Unifranz</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                        </div>

                        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                                        item.active
                                            ? 'bg-teal-50 text-teal-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className={item.active ? 'text-teal-600' : 'text-slate-400'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-100">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100"
                            >
                                <span>Cerrar Sesión</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
                {header && (
                    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-2xs">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (Barra Táctil Inferior Optimizada) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around py-2 px-3 z-30 shadow-lg">
                <Link
                    href={route('dashboard')}
                    className={`flex flex-col items-center text-xs font-medium ${
                        route().current('dashboard') || route().current('*.dashboard')
                            ? 'text-teal-600 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Inicio</span>
                </Link>

                {['admin', 'director_clinica', 'docente', 'estudiante', 'admision'].includes(roleSlug) && (
                    <Link
                        href={route('pacientes.index')}
                        className={`flex flex-col items-center text-xs font-medium ${
                            route().current('pacientes.*') ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Pacientes</span>
                    </Link>
                )}

                {['admin', 'director_clinica', 'docente', 'estudiante'].includes(roleSlug) && (
                    <Link
                        href={route('historias-clinicas.index')}
                        className={`flex flex-col items-center text-xs font-medium ${
                            route().current('historias-clinicas.*') ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Historias</span>
                    </Link>
                )}

                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex flex-col items-center text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                    <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Más</span>
                </button>
            </nav>
        </div>
    );
}
