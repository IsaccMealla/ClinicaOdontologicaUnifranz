import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function UsuariosIndex({ usuarios, roles = [], filtros }) {
    const [buscar, setBuscar] = useState(filtros?.buscar || '');
    const [rolFiltro, setRolFiltro] = useState(filtros?.rol || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros?.estado || '');

    // Modal de confirmación de eliminación
    const [modalEliminar, setModalEliminar] = useState({
        open: false,
        usuario: null,
        procesando: false,
    });

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('usuarios.index'), {
            buscar: buscar || undefined,
            rol: rolFiltro || undefined,
            estado: estadoFiltro || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleToggleEstado = (usuario) => {
        router.patch(route('usuarios.toggle-active', usuario.id), {}, {
            preserveScroll: true,
        });
    };

    const confirmarEliminacion = () => {
        if (!modalEliminar.usuario) return;
        setModalEliminar(prev => ({ ...prev, procesando: true }));
        router.delete(route('usuarios.destroy', modalEliminar.usuario.id), {
            preserveScroll: true,
            onSuccess: () => setModalEliminar({ open: false, usuario: null, procesando: false }),
            onError: () => setModalEliminar(prev => ({ ...prev, procesando: false })),
        });
    };

    const roleBadges = {
        admin: 'bg-purple-50 text-purple-800 border-purple-200',
        director_clinica: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        docente: 'bg-blue-50 text-blue-800 border-blue-200',
        estudiante: 'bg-teal-50 text-teal-800 border-teal-200',
        admision: 'bg-amber-50 text-amber-800 border-amber-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Gestión de Usuarios</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Control de cuentas de docentes, estudiantes operadores y personal clínico</p>
                    </div>

                    <Link
                        href={route('usuarios.create')}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nuevo Usuario</span>
                    </Link>
                </div>
            }
        >
            <Head title="Gestión de Usuarios" />

            <div className="space-y-5">
                {/* FILTROS Y BÚSQUEDA */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar por nombre, correo electrónico o código institucional..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filtro por Rol */}
                        <div className="min-w-[180px]">
                            <select
                                value={rolFiltro}
                                onChange={(e) => {
                                    setRolFiltro(e.target.value);
                                    router.get(route('usuarios.index'), {
                                        buscar: buscar || undefined,
                                        rol: e.target.value || undefined,
                                        estado: estadoFiltro || undefined,
                                    }, { preserveState: true, replace: true });
                                }}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            >
                                <option value="">Todos los Roles</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.slug}>{r.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Estado */}
                        <div className="min-w-[150px]">
                            <select
                                value={estadoFiltro}
                                onChange={(e) => {
                                    setEstadoFiltro(e.target.value);
                                    router.get(route('usuarios.index'), {
                                        buscar: buscar || undefined,
                                        rol: rolFiltro || undefined,
                                        estado: e.target.value || undefined,
                                    }, { preserveState: true, replace: true });
                                }}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            >
                                <option value="">Todos los Estados</option>
                                <option value="activo">Solo Activos</option>
                                <option value="inactivo">Solo Inactivos</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* TABLA DE USUARIOS */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="py-3.5 px-4">Usuario</th>
                                    <th className="py-3.5 px-4">Rol Institucional</th>
                                    <th className="py-3.5 px-4">Código / Teléfono</th>
                                    <th className="py-3.5 px-4 text-center">Pacientes Asignados</th>
                                    <th className="py-3.5 px-4 text-center">Estado</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {usuarios.data.length > 0 ? (
                                    usuarios.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 leading-tight">{u.name}</div>
                                                        <div className="text-xs text-slate-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadges[u.rol?.slug] || 'bg-slate-100'}`}>
                                                    {u.rol?.nombre || 'Sin Rol'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-mono">
                                                <div className="font-semibold text-slate-800">{u.codigo_institucional || '-'}</div>
                                                <div className="text-slate-400 font-sans">{u.telefono || 'Sin teléfono'}</div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                {u.rol?.slug === 'estudiante' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                                        {u.pacientes_asignados_count || 0} pacientes
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">-</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleEstado(u)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                                                        u.is_active
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                    title="Haga clic para cambiar estado"
                                                >
                                                    ● {u.is_active ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('usuarios.edit', u.id)}
                                                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                                                        title="Editar usuario"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setModalEliminar({ open: true, usuario: u, procesando: false })}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        title="Eliminar usuario"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            No se encontraron usuarios para los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {usuarios.links && usuarios.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div>Total: <strong className="text-slate-800">{usuarios.total}</strong> usuarios registrados</div>
                            <div className="flex space-x-1">
                                {usuarios.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg border transition ${
                                            link.active
                                                ? 'bg-teal-600 text-white font-bold border-teal-600'
                                                : link.url
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
            {modalEliminar.open && modalEliminar.usuario && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center space-x-3 text-rose-600">
                            <div className="p-2 rounded-xl bg-rose-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Eliminar Cuenta de Usuario</h3>
                                <p className="text-xs text-slate-500">Esta acción dará de baja definitiva al usuario</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600">
                            ¿Estás seguro de que deseas eliminar permanentemente a{' '}
                            <strong>{modalEliminar.usuario.name}</strong> ({modalEliminar.usuario.email})?
                            Si tiene pacientes asignados, estos pasarán a estado libre sin operador.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setModalEliminar({ open: false, usuario: null, procesando: false })}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={modalEliminar.procesando}
                                onClick={confirmarEliminacion}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            >
                                {modalEliminar.procesando ? 'Eliminando...' : 'Sí, Eliminar Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
