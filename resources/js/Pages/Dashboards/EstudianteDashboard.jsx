import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function EstudianteDashboard({ activeShift, proximasCitas, seguimientos }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Mi Panel Clínico & Progreso Académico</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Control de turno en sillón, asignación de pacientes y cupos de materias</p>
                </div>
            }
        >
            <Head title="Panel de Estudiante" />

            <div className="space-y-6">
                {/* Active Shift Indicator (RF10 / HU-10) */}
                {activeShift ? (
                    <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                        Turno Clínico Activo
                                    </span>
                                    <span className="text-xs text-emerald-600 font-medium">Habilitado para registrar</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 mt-1">
                                    {activeShift.sillon?.nombre} ({activeShift.sillon?.codigo}) - {activeShift.sillon?.sala_clinica}
                                </h3>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Paciente asignado: <strong>{activeShift.paciente?.nombres} {activeShift.paciente?.apellido_paterno}</strong> • Motivo: {activeShift.motivo}
                                </p>
                            </div>
                        </div>
                        <div className="self-end sm:self-center">
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition">
                                Abrir Odontograma FDI
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 border border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-xl bg-slate-400 text-white shrink-0 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                                    Fuera de Turno Clínico (RF10)
                                </span>
                                <h3 className="text-sm font-semibold text-slate-700 mt-1">No tienes un turno clínico activo en este instante</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Las mutaciones en historias clínicas y odontogramas están restringidas hasta tu próxima cita o autorización docente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cupos Académicos por Materia */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Cumplimiento de Cupos Clínicos</h3>
                    <p className="text-xs text-slate-500 mb-4">Progreso por asignatura y procedimiento requerido para aprobación de semestre</p>

                    {seguimientos.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">No tienes asignaturas clínicas registradas este periodo.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {seguimientos.map((s) => {
                                const percentage = Math.min(100, Math.round((s.cupos_completados / s.cupos_requeridos) * 100));
                                return (
                                    <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-700">{s.asignatura}</span>
                                            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                                                {s.periodo_academico}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2">{s.procedimiento_clave}</div>

                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-medium text-slate-600">{s.cupos_completados} de {s.cupos_requeridos} cupos</span>
                                            <span className="font-bold text-slate-800">{percentage}%</span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                                    percentage >= 100 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-cyan-500' : 'bg-amber-500'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Próximas Citas Programadas */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base mb-0.5">Mi Agenda de Turnos</h3>
                            <p className="text-xs text-slate-500">Próximas atenciones clínicas en sillón</p>
                        </div>
                        <Link
                            href={route('citas.index')}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                            Ver Agenda Completa &rarr;
                        </Link>
                    </div>

                    {proximasCitas.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">No tienes citas programadas próximamente.</div>
                    ) : (
                        <div className="space-y-3">
                            {proximasCitas.map((c) => (
                                <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <span className="font-semibold text-xs text-slate-800">
                                            {new Date(c.fecha_hora_inicio).toLocaleString('es-BO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className="text-xs text-slate-600 mt-0.5">
                                            Paciente: <strong>{c.paciente?.nombres} {c.paciente?.apellido_paterno}</strong>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Unidad: {c.sillon?.nombre} • {c.motivo}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-center capitalize">
                                        {c.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
