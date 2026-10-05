import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AdmisionDashboard({ sillones, citasHoy, pacientes }) {
    const statusBadges = {
        disponible: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ocupado: 'bg-blue-100 text-blue-800 border-blue-200',
        en_mantenimiento: 'bg-amber-100 text-amber-800 border-amber-200',
        fuera_servicio: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Módulo de Admisión & Control de Sillones</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Recepción de pacientes, triaje, agenda clínica y distribución de capacidad</p>
                </div>
            }
        >
            <Head title="Admisión Clínica" />

            <div className="space-y-6">
                {/* Visual Chair Status Monitor */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Estado Físico de Sillones (Aforo)</h3>
                            <p className="text-xs text-slate-500">Supervisión en tiempo real para asignación de turnos</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                            {sillones.filter(s => s.estado === 'disponible').length} Disponibles de {sillones.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                        {sillones.map((s) => (
                            <div
                                key={s.id}
                                className={`p-3 rounded-xl border text-center transition ${
                                    s.estado === 'disponible'
                                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                                        : s.estado === 'ocupado'
                                        ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
                                        : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                                }`}
                            >
                                <span className="font-mono text-xs font-bold block">{s.codigo}</span>
                                <span className="text-[10px] text-slate-500 block truncate mt-0.5">{s.sala_clinica.split(' ')[0]}</span>
                                <span className={`inline-block mt-2 text-[10px] font-bold px-1.5 py-0.2 rounded-full border capitalize ${statusBadges[s.estado]}`}>
                                    {s.estado.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Citas de Hoy para Recepción */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Citas Programadas para Hoy</h3>
                            <p className="text-xs text-slate-500">Control de check-in y llegada de pacientes a sala de espera</p>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {citasHoy.length} citas hoy
                        </span>
                    </div>

                    {citasHoy.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No hay citas registradas para la fecha de hoy.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3">Hora</th>
                                        <th className="py-2.5 px-3">Paciente</th>
                                        <th className="py-2.5 px-3">Alumno Asignado</th>
                                        <th className="py-2.5 px-3">Sillón</th>
                                        <th className="py-2.5 px-3">Estado</th>
                                        <th className="py-2.5 px-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {citasHoy.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/80">
                                            <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                                {new Date(c.fecha_hora_inicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-2.5 px-3 font-medium text-slate-800">
                                                {c.paciente?.nombres} {c.paciente?.apellido_paterno}
                                                <span className="block text-[11px] text-slate-400">CI: {c.paciente?.ci}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600">
                                                {c.estudiante?.name}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-xs text-slate-700">
                                                {c.sillon?.codigo || 'Sin asignar'}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusBadges[c.estado] || 'bg-gray-100'}`}>
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <button className="px-2.5 py-1 rounded bg-cyan-600 text-white text-[11px] font-medium hover:bg-cyan-700 transition">
                                                    Check-In
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Últimos Pacientes Registrados */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Padrón de Pacientes Recientes</h3>
                    <p className="text-xs text-slate-500 mb-4">Fichas demográficas registradas en el sistema</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {pacientes.map((p) => (
                            <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition">
                                <div className="font-bold text-slate-800 text-xs truncate">{p.nombres} {p.apellido_paterno}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">CI: {p.ci} • Cel: {p.celular || 'N/A'}</div>
                                <div className="text-[10px] text-slate-400 mt-1">Reg: {new Date(p.created_at).toLocaleDateString('es-BO')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
