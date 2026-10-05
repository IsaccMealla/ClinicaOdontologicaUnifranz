import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PacienteDashboard({ paciente, citas, historia }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Portal del Paciente</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Consulta de citas programadas e historial clínico personal</p>
                </div>
            }
        >
            <Head title="Mi Portal de Paciente" />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Welcome Card */}
                <div className="bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-md shadow-blue-600/15">
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Bienvenido(a) a la Clínica Unifranz</span>
                    <h3 className="text-xl sm:text-2xl font-bold mt-1">
                        {paciente ? `${paciente.nombres} ${paciente.apellido_paterno}` : 'Estimado(a) Paciente'}
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-100 mt-1 max-w-xl">
                        A través de este portal puedes verificar tus próximas citas odontológicas, la unidad dental asignada y el estado de tu expediente clínico.
                    </p>
                </div>

                {/* Próximas Citas */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Mis Citas Odontológicas</h3>
                    <p className="text-xs text-slate-500 mb-4">Turnos confirmados en la clínica universitaria</p>

                    {citas.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No tienes citas programadas actualmente.</div>
                    ) : (
                        <div className="space-y-3">
                            {citas.map((c) => (
                                <div key={c.id} className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-md">
                                                {new Date(c.fecha_hora_inicio).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <span className="text-xs text-slate-600 font-semibold">
                                                {new Date(c.fecha_hora_inicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mt-1">{c.motivo}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Ubicación: <strong>{c.sillon?.nombre || 'Sillón en asignación'}</strong> ({c.sillon?.sala_clinica})
                                        </p>
                                    </div>
                                    <span className="self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                                        {c.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Historial Clínico Resumen */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Mi Expediente Clínico</h3>
                    <p className="text-xs text-slate-500 mb-3">Información sobre tu historia clínica base</p>

                    {historia ? (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-slate-700">{historia.numero_expediente}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                                    {historia.estado}
                                </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-2">
                                <strong>Diagnóstico:</strong> {historia.diagnostico_definitivo || historia.diagnostico_presuntivo || 'En evaluación clínica'}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-sm">
                            Tu historia clínica está siendo procesada en el área de admisión.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
