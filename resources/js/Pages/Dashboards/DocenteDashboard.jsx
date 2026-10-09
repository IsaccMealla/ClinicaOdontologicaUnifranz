import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function DocenteDashboard({ historiasPendientes, odontogramasPendientes, fasesPendientes }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Bandeja de Supervisión Docente</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Control académico, aprobación de expedientes y calificación de procedimientos</p>
                </div>
            }
        >
            <Head title="Supervisión Docente" />

            <div className="space-y-6">
                {/* Pending Summary Banner */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Atención Requerida</span>
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">
                            {historiasPendientes.length + odontogramasPendientes.length + fasesPendientes.length} Registros Pendientes de Revisión
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Los estudiantes requieren su validación para proseguir con los tratamientos en sillón.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="block text-xl font-bold text-slate-900">{historiasPendientes.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Historias</span>
                        </div>
                        <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="block text-xl font-bold text-slate-900">{odontogramasPendientes.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Odontogramas</span>
                        </div>
                        <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="block text-xl font-bold text-slate-900">{fasesPendientes.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Fases</span>
                        </div>
                        <Link
                            href={route('citas.index')}
                            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                            Agenda & Citas &rarr;
                        </Link>
                    </div>
                </div>


                {/* Historias Clínicas Pendientes */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Historias Clínicas por Validar</h3>
                    <p className="text-xs text-slate-500 mb-4">Expedientes HC-001 con diagnóstico preliminar</p>

                    {historiasPendientes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No hay historias clínicas pendientes de firma.</div>
                    ) : (
                        <div className="space-y-3">
                            {historiasPendientes.map((h) => (
                                <div key={h.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-300 transition">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                                {h.numero_expediente}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                Paciente: <strong className="text-slate-700">{h.paciente?.nombres} {h.paciente?.apellido_paterno}</strong> (CI: {h.paciente?.ci})
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1 font-medium">
                                            Motivo: <span className="text-slate-500">{h.motivo_consulta}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            Registrado por: {h.estudiante?.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center">
                                        <a
                                            href={route('historias-clinicas.show', h.id)}
                                            className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition"
                                        >
                                            Revisar & Aprobar HC-001 →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Odontogramas Pendientes */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Odontogramas por Calificar (FDI)</h3>
                    <p className="text-xs text-slate-500 mb-4">Mapeo de hallazgos por cara dental y piezas</p>

                    {odontogramasPendientes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No hay odontogramas pendientes de revisión.</div>
                    ) : (
                        <div className="space-y-3">
                            {odontogramasPendientes.map((o) => (
                                <div key={o.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-300 transition">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 capitalize">
                                                Odontograma {o.tipo} (v{o.version})
                                            </span>
                                            <span className="text-xs text-slate-600 font-medium">
                                                {o.paciente?.nombres} {o.paciente?.apellido_paterno}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {o.especificaciones || 'Sin observaciones adicionales.'}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            Estudiante: {o.estudiante?.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center">
                                        <button className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition">
                                            Revisar Caras FDI
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
