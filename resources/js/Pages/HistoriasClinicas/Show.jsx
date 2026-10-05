import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function HistoriaClinicaShow({ historia }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleSlug = auth?.role || user?.rol?.slug || 'estudiante';

    const isDocenteOrAdmin = ['docente', 'admin', 'director_clinica'].includes(roleSlug);

    const { data, setData, post, processing } = useForm({
        estado: '',
        observaciones_docente: historia.observaciones_docente || '',
    });

    const handleCambiarEstado = (nuevoEstado) => {
        data.estado = nuevoEstado;
        post(route('historias-clinicas.estado', historia.id), {
            preserveScroll: true,
        });
    };

    const sv = historia.signos_vitales || {};
    const ex = historia.examen_estomatologico || {};
    const atm = ex.atm || {};
    const p = historia.paciente;

    const estadoColores = {
        borrador: 'bg-slate-100 text-slate-800 border-slate-300',
        en_revision: 'bg-amber-100 text-amber-900 border-amber-300',
        aprobada: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        aprobado: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        rechazada: 'bg-rose-100 text-rose-900 border-rose-300',
        rechazado: 'bg-rose-100 text-rose-900 border-rose-300',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('historias-clinicas.index')}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                    Expediente Clínico {historia.numero_expediente}
                                </h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${estadoColores[historia.estado] || 'bg-slate-100'}`}>
                                    ● {historia.estado.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Paciente: <Link href={route('pacientes.show', p.id)} className="font-bold text-teal-600 hover:underline">{p.nombres} {p.apellido_paterno}</Link> (CI: {p.ci}) • Alumno: {historia.estudiante?.name || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('pacientes.show', p.id)}
                            className="inline-flex items-center px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition shadow-2xs"
                        >
                            <svg className="w-4 h-4 mr-1.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Ir al Expediente Clínico</span>
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition shadow-2xs"
                        >
                            <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Imprimir HC-001</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Historia ${historia.numero_expediente}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* ALERTA DE REVISIÓN DOCENTE */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Supervisión Académica:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${estadoColores[historia.estado] || 'bg-slate-100'}`}>
                                ● {historia.estado.replace('_', ' ')}
                            </span>
                        </div>
                        {historia.docente_supervisor && (
                            <span className="text-xs text-slate-500">
                                Docente Asignado: <strong className="text-slate-800">{historia.docente_supervisor.name}</strong>
                            </span>
                        )}
                    </div>

                    {historia.observaciones_docente && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                            <strong>Observaciones del Docente:</strong> {historia.observaciones_docente}
                        </div>
                    )}

                    {/* Acciones de Workflow para Docente / Admin */}
                    {isDocenteOrAdmin && historia.estado !== 'aprobada' && (
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <input
                                type="text"
                                value={data.observaciones_docente}
                                onChange={(e) => setData('observaciones_docente', e.target.value)}
                                placeholder="Observaciones o correcciones para el estudiante..."
                                className="w-full sm:flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            />
                            <div className="flex items-center space-x-2 shrink-0">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleCambiarEstado('rechazada')}
                                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                                >
                                    Rechazar / Observar
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleCambiarEstado('aprobada')}
                                    className="inline-flex items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Aprobar Historia Clínica</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Si es estudiante y está en borrador */}
                    {!isDocenteOrAdmin && (historia.estado === 'borrador' || historia.estado === 'rechazada') && (
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => handleCambiarEstado('en_revision')}
                                className="inline-flex items-center px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>Enviar a Revisión del Docente</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* DOCUMENTO MÉDICO OFICIAL (HC-001) */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-slate-800">
                    {/* Encabezado del Formulario Clínico */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl">
                                U
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Universidad Franz Tamayo</h1>
                                <p className="text-xs font-bold text-teal-600 tracking-wide uppercase">Clínica Odontológica Unifranz</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-base font-mono font-bold text-slate-900">{historia.numero_expediente}</div>
                            <div className="text-xs text-slate-400 font-medium">Formulario HC-001</div>
                        </div>
                    </div>

                    {/* Resumen Paciente */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                            <span className="text-slate-400 font-bold uppercase">Paciente:</span>
                            <div className="font-bold text-slate-900 mt-0.5">{p.nombres} {p.apellido_paterno} {p.apellido_materno}</div>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase">CI / Edad:</span>
                            <div className="font-semibold text-slate-900 mt-0.5">{p.ci} ({p.edad} años)</div>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase">Sexo / Ocupación:</span>
                            <div className="font-semibold text-slate-900 mt-0.5">{p.sexo} • {p.ocupacion || '-'}</div>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase">Alumno a Cargo:</span>
                            <div className="font-semibold text-slate-900 mt-0.5">{historia.estudiante?.name || '-'}</div>
                        </div>
                    </div>

                    {/* 1. Motivo de Consulta y Enfermedad Actual */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                            1. Motivo de Consulta & Enfermedad Actual
                        </h3>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase">Motivo de Consulta:</span>
                            <p className="text-sm text-slate-800 italic mt-0.5">"{historia.motivo_consulta}"</p>
                        </div>
                        {historia.enfermedad_actual && (
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Historia de la Enfermedad Actual:</span>
                                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed whitespace-pre-line">{historia.enfermedad_actual}</p>
                            </div>
                        )}
                    </div>

                    {/* 2. Signos Vitales y Examen Físico */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                            2. Signos Vitales y Estado Físico General
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Presión Arterial:</span>
                                <div className="font-bold text-slate-800 mt-0.5">{sv.presion_arterial || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Pulso:</span>
                                <div className="font-bold text-slate-800 mt-0.5">{sv.pulso ? `${sv.pulso} lpm` : '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Temperatura:</span>
                                <div className="font-bold text-slate-800 mt-0.5">{sv.temperatura_c ? `${sv.temperatura_c} °C` : '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Frec. Respiratoria:</span>
                                <div className="font-bold text-slate-800 mt-0.5">{sv.frecuencia_respiratoria ? `${sv.frecuencia_respiratoria} rpm` : '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Peso / Talla:</span>
                                <div className="font-bold text-slate-800 mt-0.5">{sv.peso_kg ? `${sv.peso_kg} kg` : '-'} / {sv.talla_m ? `${sv.talla_m} m` : '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-3">
                                <span className="text-slate-400 font-semibold">Estado General & Sensorio:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">{sv.estado_general || '-'} • {sv.consciencia || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Examen Estomatológico Regional */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                            3. Examen Físico Regional Estomatognático
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Cráneo, Cara y Perfil:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">{ex.craneo || '-'}, {ex.cara_simetria || '-'}, perfil {ex.perfil || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Cuello y Ganglios:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">{ex.ganglios || ex.cuello || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Labios y Carrillos:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">{ex.labios || '-'} • {ex.carrillos || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 font-semibold">Paladar y Piso de Boca:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">{ex.paladar || '-'} • {ex.piso_boca || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                                <span className="text-slate-400 font-semibold">Lengua y Encías:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">Lengua: {ex.lengua || '-'} | Encías: {ex.encias || '-'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                                <span className="text-slate-400 font-semibold">ATM y Oclusión:</span>
                                <div className="font-semibold text-slate-800 mt-0.5">
                                    Apertura: {atm.apertura || 'Normal'} | Chasquidos: {atm.chasquidos ? 'Sí' : 'No'} | Dolor: {atm.dolor ? 'Sí' : 'No'} | Oclusión: {ex.oclusion || 'Clase I'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Diagnóstico, Pronóstico y Plan */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                            4. Juicio Diagnóstico & Plan Terapéutico
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                                <span className="text-teal-800 font-bold uppercase">Diagnóstico Presuntivo:</span>
                                <p className="text-slate-800 font-semibold mt-1">{historia.diagnostico_presuntivo || 'No registrado'}</p>
                            </div>
                            <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-300">
                                <span className="text-teal-900 font-bold uppercase">Diagnóstico Definitivo:</span>
                                <p className="text-slate-900 font-bold mt-1">{historia.diagnostico_definitivo || 'En evaluación'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700 uppercase">Plan de Tratamiento General:</span>
                                <span className="font-bold text-teal-700">Pronóstico: {historia.pronostico || 'Favorable'}</span>
                            </div>
                            <p className="text-slate-800 whitespace-pre-line leading-relaxed font-sans">{historia.plan_tratamiento || 'Sin plan detallado'}</p>
                        </div>
                    </div>

                    {/* Firmas Digitales / Conformidad */}
                    <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                        <div>
                            <div className="w-48 mx-auto border-b border-slate-400 pb-1 font-bold text-slate-800">
                                {historia.estudiante?.name || 'Firma Estudiante'}
                            </div>
                            <span className="text-[11px] text-slate-400">Estudiante Responsable</span>
                        </div>
                        <div>
                            <div className="w-48 mx-auto border-b border-slate-400 pb-1 font-bold text-slate-800">
                                {historia.docente_supervisor?.name || (historia.estado === 'aprobada' ? 'Docente Aprobador' : 'Pendiente Firma')}
                            </div>
                            <span className="text-[11px] text-slate-400">
                                {historia.estado === 'aprobada' ? `Aprobado el ${historia.fecha_aprobacion?.slice(0, 10) || ''}` : 'Docente Supervisor'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
