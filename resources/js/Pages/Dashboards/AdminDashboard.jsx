import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AdminDashboard({ metrics, sillones, auditorias }) {
    const statusColors = {
        disponible: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ocupado: 'bg-blue-100 text-blue-800 border-blue-200',
        en_mantenimiento: 'bg-amber-100 text-amber-800 border-amber-200',
        fuera_servicio: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Panel Administrativo & Gestión Clínica</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Control operativo, métricas globales y capacidad instalada</p>
                </div>
            }
        >
            <Head title="Panel de Administración" />

            <div className="space-y-6">
                {/* Metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pacientes</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.totalPacientes}</span>
                            {metrics.alertasAbandono > 0 && (
                                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    {metrics.alertasAbandono} en abandono
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sillones Disponibles</span>
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline space-x-2">
                            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.sillonesDisponibles}</span>
                            <span className="text-sm text-slate-500 font-medium">/ {metrics.totalSillones} activos</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Citas Hoy</span>
                            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.citasHoy}</span>
                            <span className="text-xs text-slate-500 font-medium">{metrics.citasTotal} acumuladas</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Equipo Clínico</span>
                            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline space-x-2">
                            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.estudiantesActivos}</span>
                            <span className="text-xs text-slate-500 font-medium">alumnos • {metrics.docentesActivos} docentes</span>
                        </div>
                    </div>
                </div>

                {/* Sillones Grid */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Unidades Dentales Físicas (Aforo en Tiempo Real)</h3>
                            <p className="text-xs text-slate-500">Monitoreo de estado por sala y unidad</p>
                        </div>
                        <span className="text-xs text-cyan-700 bg-cyan-50 font-semibold px-3 py-1 rounded-full border border-cyan-200">
                            {sillones.length} sillones catalogados
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {sillones.map((s) => (
                            <div
                                key={s.id}
                                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-cyan-300 transition"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                        {s.codigo}
                                    </span>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[s.estado] || 'bg-gray-100'}`}>
                                        {s.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="font-semibold text-slate-800 text-sm truncate">{s.nombre}</div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">{s.sala_clinica}</div>
                                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                                    <span>{s.marca} {s.modelo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit logs preview */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Trazabilidad Inmutable (Últimas Acciones)</h3>
                    <p className="text-xs text-slate-500 mb-4">Registro inmutable en PostgreSQL con snapshots JSONB</p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-3">Fecha / Hora</th>
                                    <th className="py-2.5 px-3">Usuario</th>
                                    <th className="py-2.5 px-3">Acción</th>
                                    <th className="py-2.5 px-3">Entidad</th>
                                    <th className="py-2.5 px-3">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {auditorias.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50/80">
                                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                                            {new Date(a.created_at).toLocaleString('es-BO')}
                                        </td>
                                        <td className="py-2.5 px-3 font-medium text-slate-800">
                                            {a.user?.name || 'Sistema'}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-700">
                                                {a.accion}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                                            {a.tabla} #{a.registro_id}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                                            {a.ip_address}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
