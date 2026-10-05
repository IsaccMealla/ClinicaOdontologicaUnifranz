import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function UsuariosCreate({ roles = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        rol_id: roles.find(r => r.slug === 'estudiante')?.id || roles[0]?.id || '',
        codigo_institucional: '',
        telefono: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('usuarios.store'));
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
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Registrar Nuevo Usuario</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Creación de cuenta para docentes, estudiantes operadores o personal</p>
                    </div>
                </div>
            }
        >
            <Head title="Nuevo Usuario" />

            <div className="max-w-3xl mx-auto">
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
                                placeholder="Ej: Dra. Valeria Mendoza Quinteros"
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

                        {/* Contraseña Inicial */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Contraseña Inicial <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                required
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
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                            <span className="text-sm font-semibold text-slate-800">
                                Cuenta activa para inicio de sesión
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('usuarios.index')}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-xs transition"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{processing ? 'Guardando...' : 'Crear Usuario'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
