import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function UsuariosEdit({ usuario, roles = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: usuario.name || '',
        email: usuario.email || '',
        password: '',
        rol_id: usuario.rol_id || '',
        codigo_institucional: usuario.codigo_institucional || '',
        telefono: usuario.telefono || '',
        is_active: Boolean(usuario.is_active),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('usuarios.update', usuario.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('usuarios.index')}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Volver a la lista de usuarios"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Editar Usuario</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Modificar credenciales, rol o estado de acceso institucional
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${usuario.name}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Info Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-base border border-teal-200">
                            {usuario.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{usuario.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{usuario.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            usuario.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                            {usuario.is_active ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                            ID #{usuario.id} · Rol: {usuario.rol?.nombre || 'Sin Rol'}
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Nombre Completo */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nombre Completo <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Dr. Fernando Méndez Paz"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            {errors.name && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
                        </div>

                        {/* Correo Electrónico */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Correo Institucional <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="usuario@unifranz.edu.bo"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        {/* Nueva Contraseña (Opcional) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nueva Contraseña <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Dejar en blanco para conservar actual"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        {/* Rol Institucional */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Rol Institucional <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.rol_id}
                                onChange={(e) => setData('rol_id', e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre} ({r.slug})
                                    </option>
                                ))}
                            </select>
                            {errors.rol_id && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.rol_id}</p>}
                        </div>

                        {/* Código Institucional */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Código Institucional / Matrícula
                            </label>
                            <input
                                type="text"
                                value={data.codigo_institucional}
                                onChange={(e) => setData('codigo_institucional', e.target.value)}
                                placeholder="Ej: DOC-2026-04, EST-88392"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            {errors.codigo_institucional && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.codigo_institucional}</p>}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Teléfono / Celular
                            </label>
                            <input
                                type="text"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                placeholder="Ej: 77281920"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            {errors.telefono && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.telefono}</p>}
                        </div>

                        {/* Estado Activo */}
                        <div className="flex items-center space-x-3 pt-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                            <div>
                                <span className="text-sm font-semibold text-slate-800">Usuario Activo</span>
                                <p className="text-xs text-slate-500">Permite inicio de sesión y asignación operativa</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href={route('usuarios.index')}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{processing ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
