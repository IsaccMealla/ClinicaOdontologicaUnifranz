import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import TabEvaluacionGeneral from '@/Components/Expediente/TabEvaluacionGeneral';
import TabOdontopediatria from '@/Components/Expediente/TabOdontopediatria';
import TabPeriodoncia from '@/Components/Expediente/TabPeriodoncia';
import TabPeriodontogramaGrafico from '@/Components/Expediente/TabPeriodontogramaGrafico';
import { PeriodontogramaProvider } from '@/Components/Expediente/PeriodontogramaContext';
import TabHistorialTratamientos from '@/Components/Expediente/TabHistorialTratamientos';
import TabOdontogramaDigital from '@/Components/Expediente/TabOdontogramaDigital';
import TabDiagnosticoYPlanTratamiento from '@/Components/Expediente/TabDiagnosticoYPlanTratamiento';
import TabDocumentacionConsentimientos from '@/Components/Expediente/TabDocumentacionConsentimientos';
import TabModulo3PlanesYTratamiento from '@/Components/Expediente/TabModulo3PlanesYTratamiento';

export default function PacienteExpediente({ paciente, antecedentes, historiasClinicas, docentes, estudiantes = [], periodontograma, aranceles = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleSlug = auth?.role || user?.rol?.slug || 'estudiante';

    const [activeTab, setActiveTab] = useState('evaluacion');
    const [activeSubTab, setActiveSubTab] = useState('personales');
    const [periodonciaSubTab, setPeriodonciaSubTab] = useState('grafico');
    const [copiadoIup, setCopiadoIup] = useState(false);

    // Modal de asignación / reasignación / transferencia de paciente
    const [modalTransferirOpen, setModalTransferirOpen] = useState(false);
    const [selectedEstudianteId, setSelectedEstudianteId] = useState(
        paciente.estudiante_asignado_id ? String(paciente.estudiante_asignado_id) : ''
    );
    const [motivoTransferencia, setMotivoTransferencia] = useState('');
    const [guardandoTransferencia, setGuardandoTransferencia] = useState(false);

    const isDocenteOrAdmin = ['docente', 'admin', 'director_clinica', 'admision'].includes(roleSlug);
    const isEstudiante = roleSlug === 'estudiante';
    const isReadOnlyStudent = isEstudiante && paciente.estudiante_asignado_id !== user?.id;

    const handleCopiarIup = () => {
        if (!paciente.iup) return;
        navigator.clipboard.writeText(paciente.iup);
        setCopiadoIup(true);
        setTimeout(() => setCopiadoIup(false), 2000);
    };

    const handleTransferirEstudiante = (e) => {
        e.preventDefault();
        setGuardandoTransferencia(true);
        router.post(
            route('pacientes.asignar-estudiante', paciente.id),
            {
                estudiante_id: selectedEstudianteId || null,
                motivo: motivoTransferencia || 'Reasignación desde expediente clínico',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setGuardandoTransferencia(false);
                    setModalTransferirOpen(false);
                },
                onError: () => {
                    setGuardandoTransferencia(false);
                }
            }
        );
    };

    // Inicializar el formulario con todos los módulos del expediente clínico (Módulos 1 y 2)
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        patologicos_personales: antecedentes?.patologicos_personales || {},
        patologicos_familiares: antecedentes?.patologicos_familiares || {},
        no_patologicos: antecedentes?.no_patologicos || {},
        ginecologicos: antecedentes?.ginecologicos || {},
        examen_clinico_fisico: antecedentes?.examen_clinico_fisico || {},
        habitos: antecedentes?.habitos || {},
        historia_odontopediatrica: antecedentes?.historia_odontopediatrica || {},
        antecedentes_periodontales: antecedentes?.antecedentes_periodontales || {},
        examen_periodontal: antecedentes?.examen_periodontal || {},
        procedimientos_tratamientos: antecedentes?.procedimientos_tratamientos || [],
        motivo_consulta_paciente: antecedentes?.motivo_consulta_paciente || '',
        antecedentes_odontologicos: antecedentes?.antecedentes_odontologicos || {},
        odontograma: antecedentes?.odontograma || {},
        diagnosticos_codificados: antecedentes?.diagnosticos_codificados || [],
        plan_tratamiento_secuencia: antecedentes?.plan_tratamiento_secuencia || [],
        odontologia_legal_forense: antecedentes?.odontologia_legal_forense || {},
        estado_revision: antecedentes?.estado_revision || 'borrador',
        comentarios_docente: antecedentes?.comentarios_docente || '',
        docente_supervisor_id: antecedentes?.docente_supervisor_id || '',
    });

    const handleInputChange = (seccion, campo, valor) => {
        setData(seccion, {
            ...data[seccion],
            [campo]: valor,
        });
    };

    const handlePersonalesChange = (campo, valor) => {
        setData('patologicos_personales', {
            ...data.patologicos_personales,
            [campo]: valor,
        });
    };

    const handleFamiliaresChange = (campo, valor) => {
        setData('patologicos_familiares', {
            ...data.patologicos_familiares,
            [campo]: valor,
        });
    };

    const handleNoPatologicosChange = (campo, valor) => {
        setData('no_patologicos', {
            ...data.no_patologicos,
            [campo]: valor,
        });
    };

    const handleGinecologicosChange = (campo, valor) => {
        setData('ginecologicos', {
            ...data.ginecologicos,
            [campo]: valor,
        });
    };

    const handleActualizarProcedimientos = (nuevaLista, guardarInmediato = true) => {
        setData('procedimientos_tratamientos', nuevaLista);
        if (guardarInmediato) {
            router.post(
                route('pacientes.antecedentes.guardar', paciente.id),
                {
                    ...data,
                    procedimientos_tratamientos: nuevaLista,
                },
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const handleGuardarAntecedentes = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isReadOnlyStudent) {
            alert('Modo Consulta: No tienes permisos para modificar el expediente de un paciente no asignado a tu usuario.');
            return;
        }
        post(route('pacientes.antecedentes.guardar', paciente.id), {
            preserveScroll: true,
        });
    };

    const operadorNombre = paciente.estudiante_asignado?.name || paciente.estudianteAsignado?.name || null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('pacientes.index')}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Volver al padrón"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                    {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                                </h2>
                                
                                {/* Badge de IUP Oficial UNIFRANZ */}
                                {paciente.iup && (
                                    <button
                                        type="button"
                                        onClick={handleCopiarIup}
                                        title="Copiar Identificador Único de Paciente"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-teal-300 border border-slate-700 hover:bg-slate-800 transition shadow-2xs"
                                    >
                                        <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        <span>IUP: {paciente.iup}</span>
                                        {copiadoIup && <span className="text-[10px] text-emerald-400 font-sans font-bold">¡Copiado!</span>}
                                    </button>
                                )}

                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                    CI: {paciente.ci} {paciente.ci_expedido ? `(${paciente.ci_expedido})` : ''}
                                </span>

                                {/* Estado del Paciente */}
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    paciente.estado_paciente === 'activo'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : paciente.estado_paciente === 'referido'
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                    {paciente.estado_paciente || 'activo'}
                                </span>

                                {/* Estado Clínico */}
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                    {paciente.estado_clinico ? paciente.estado_clinico.replace('_', ' ').toUpperCase() : 'EN EVALUACIÓN'}
                                </span>

                                {/* Badge de Estudiante / Operador Asignado */}
                                {operadorNombre ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Operador: <strong>{operadorNombre}</strong></span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        <span>Sin operador asignado</span>
                                    </span>
                                )}

                                {isDocenteOrAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedEstudianteId(paciente.estudiante_asignado_id ? String(paciente.estudiante_asignado_id) : '');
                                            setMotivoTransferencia('');
                                            setModalTransferirOpen(true);
                                        }}
                                        className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 shadow-2xs transition"
                                        title="Transferir o asignar operador odontológico"
                                    >
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span>Transferir Paciente</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {paciente.edad} años • {paciente.sexo === 'M' ? 'Masculino' : (paciente.sexo === 'F' ? 'Femenino' : paciente.sexo)} • {paciente.ocupacion || 'Sin ocupación'} • {paciente.nivel_instruccion ? `Nivel: ${paciente.nivel_instruccion} • ` : ''}Tel: {paciente.celular || paciente.telefono || 'Sin teléfono'}{paciente.email ? ` • ${paciente.email}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {!isReadOnlyStudent && (
                            <button
                                type="button"
                                onClick={handleGuardarAntecedentes}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition"
                            >
                                {processing ? (
                                    <span>Guardando...</span>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-1.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>Guardar Expediente</span>
                                    </>
                                )}
                            </button>
                        )}
                        <Link
                            href={route('historias-clinicas.create', { paciente_id: paciente.id })}
                            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Nueva Historia HC-001</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Expediente - ${paciente.nombre_completo}`} />

            <div className="space-y-6">
                {/* ALERTA DE MODO CONSULTA PARA ESTUDIANTES NO ASIGNADOS */}
                {isReadOnlyStudent && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-amber-200/80 rounded-lg text-amber-800 shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <strong className="font-bold">Modo Consulta (Solo Lectura):</strong> Este paciente está asignado a{' '}
                                <span className="font-bold text-amber-950 underline">{operadorNombre || 'otro estudiante'}</span>. Las modificaciones clínicas están restringidas al operador responsable o docente supervisor.
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                            Acceso Lectura
                        </span>
                    </div>
                )}

                {/* ALERTA DE GUARDADO RECIENTE */}
                {recentlySuccessful && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            ¡Expediente clínico actualizado exitosamente en el servidor!
                        </span>
                    </div>
                )}

                {/* BANNER DE ALERTAS MÉDICAS CRÍTICAS */}
                {paciente.alertas_medicas && paciente.alertas_medicas.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-xl bg-rose-200/80 text-rose-800 shrink-0 mt-0.5">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                                    Alerta Médica de Riesgo Clínico
                                </h4>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {paciente.alertas_medicas.map((alerta, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-2xs"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
                                            {alerta.titulo}: <span className="font-normal ml-1">{alerta.detalle}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-3 py-1.5 rounded-xl self-end sm:self-center">
                            Precaución antes de anestesia o cirugía
                        </span>
                    </div>
                )}

                {/* NAVEGACIÓN POR PESTAÑAS DEL EXPEDIENTE (Sin Emojis, con Iconos SVG Limpios) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50/60 px-4 sm:px-6 flex space-x-1 sm:space-x-3 overflow-x-auto">
                        {/* 1. Evaluación, Motivo de Consulta & Hábitos */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('evaluacion')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'evaluacion'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Evaluación & Motivo Consulta</span>
                        </button>

                        {/* 2. Odontograma Digital (Adulto & Temporal) */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('odontograma')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'odontograma'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                            <span>Odontograma Digital</span>
                        </button>

                        {/* 3. Periodoncia & Periodontograma */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('periodoncia')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'periodoncia'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Periodontograma</span>
                        </button>

                        {/* 4. Diagnósticos CIE-10/CDT-2 & Plan PdT */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('plan')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'plan'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span>Diagnósticos & Plan PdT ({data.plan_tratamiento_secuencia?.length || 0})</span>
                        </button>

                        {/* 5. Antecedentes Médicos (4 Bloques) */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('antecedentes')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'antecedentes'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Antecedentes Médicos (4 Bloques)</span>
                        </button>

                        {/* 6. Tratamientos & Procedimientos */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('tratamientos')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'tratamientos'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Tratamientos & Procedimientos ({data.procedimientos_tratamientos?.length || 0})</span>
                        </button>

                        {/* 7. Historias HC-001 */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('historias')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'historias'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                            <span>Historias HC-001 ({historiasClinicas?.length || 0})</span>
                        </button>

                        {/* 8. Odontopediatría */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('odontopediatria')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'odontopediatria'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Odontopediatría</span>
                            {paciente.edad <= 14 && (
                                <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] font-extrabold rounded-md">
                                    Pediátrico
                                </span>
                            )}
                        </button>

                        {/* 9. Documentación Digital & Consentimiento Informado */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('consentimientos')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'consentimientos'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Documentos & Consentimiento</span>
                            {paciente.consentimiento_inicial?.firmado ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Consentimiento firmado"></span>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-400" title="Consentimiento pendiente"></span>
                            )}
                        </button>

                        {/* 10. Filiación Demográfica & Admisión */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('filiacion')}
                            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'filiacion'
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Ficha Demográfica & Admisión</span>
                        </button>
                    </div>

                    {/* PESTAÑA 0: EVALUACIÓN CLÍNICA GENERAL & HÁBITOS */}
                    {activeTab === 'evaluacion' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Evaluación Clínica General, Signos Vitales y Hábitos
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Signos vitales, examen físico regional extraoral, articulación temporomandibular (ATM) y hábitos.
                                    </p>
                                </div>
                                {!isReadOnlyStudent && (
                                    <button
                                        type="button"
                                        onClick={handleGuardarAntecedentes}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>{processing ? 'Guardando...' : 'Guardar Evaluación'}</span>
                                    </button>
                                )}
                            </div>

                            <TabEvaluacionGeneral
                                formData={data}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* PESTAÑA 1: ANTECEDENTES MÉDICOS (4 BLOQUES) */}
                    {activeTab === 'antecedentes' && (
                        <form onSubmit={handleGuardarAntecedentes} className="p-4 sm:p-6 space-y-6">
                            {/* Selector de Sub-bloque de Antecedentes */}
                            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-xl max-w-2xl">
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('personales')}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                                        activeSubTab === 'personales'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    1. Patológicos Personales
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('familiares')}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                                        activeSubTab === 'familiares'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    2. Patológicos Familiares
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('no_patologicos')}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                                        activeSubTab === 'no_patologicos'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    3. No Patológicos / Hábitos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('ginecologicos')}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                                        activeSubTab === 'ginecologicos'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    4. Gineco-Obstétricos
                                </button>
                            </div>

                            {/* SUB-BLOQUE 1: PATOLÓGICOS PERSONALES */}
                            {activeSubTab === 'personales' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado de Salud General</label>
                                            <input
                                                type="text"
                                                value={data.patologicos_personales.estado_salud || ''}
                                                onChange={(e) => handlePersonalesChange('estado_salud', e.target.value)}
                                                placeholder="Ej: Aparentemente sano, regular..."
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha de Último Examen Médico</label>
                                            <input
                                                type="date"
                                                value={data.patologicos_personales.fecha_ultimo_examen_medico || ''}
                                                onChange={(e) => handlePersonalesChange('fecha_ultimo_examen_medico', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* 1.1 Alergias Medicamentosas */}
                                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200">
                                        <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-rose-600 mr-2"></span>
                                            Alergias a Fármacos y Materiales Odontológicos
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { id: 'alergia_penicilina', label: 'Penicilina / Antibióticos' },
                                                { id: 'alergia_anestesia', label: 'Anestésicos Locales' },
                                                { id: 'alergia_aspirina', label: 'Aspirina / AINEs' },
                                                { id: 'alergia_yodo', label: 'Yodo / Látex' },
                                            ].map((item) => (
                                                <label key={item.id} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-rose-200/80 cursor-pointer hover:bg-rose-100/30">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!data.patologicos_personales[item.id]}
                                                        onChange={(e) => handlePersonalesChange(item.id, e.target.checked)}
                                                        className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                value={data.patologicos_personales.otras_alergias || ''}
                                                onChange={(e) => handlePersonalesChange('otras_alergias', e.target.value)}
                                                placeholder="Otras alergias conocidas (alimentos, sustancias, medicamentos específicos)..."
                                                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* 1.2 Trastornos Hematológicos / Coagulación */}
                                    <div className="bg-red-50/40 p-4 rounded-xl border border-red-200">
                                        <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                                            Hematológicos y Trastornos de la Coagulación
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'sangra_excesivamente', label: 'Sangrado Excesivo al herirse o cepillado' },
                                                { id: 'hemofilia', label: 'Hemofilia / Púrpura' },
                                                { id: 'problema_sanguineo', label: 'Anemia / Leucemia / Discrasia' },
                                                { id: 'deficit_vitamina_k', label: 'Déficit de Vitamina K' },
                                                { id: 'transfusion_sanguinea', label: 'Ha recibido transfusiones previas' },
                                            ].map((item) => (
                                                <label key={item.id} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-red-200/80 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!data.patologicos_personales[item.id]}
                                                        onChange={(e) => handlePersonalesChange(item.id, e.target.checked)}
                                                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 1.3 Patologías Sistémicas */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                                            Enfermedades Sistémicas y Quirúrgicas
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {[
                                                { id: 'tension_arterial', label: 'Hipertensión Arterial' },
                                                { id: 'diabetes', label: 'Diabetes Mellitus' },
                                                { id: 'problemas_corazon', label: 'Cardiopatías / Infartos' },
                                                { id: 'asma', label: 'Asma Bronquial' },
                                                { id: 'problemas_renales', label: 'Insuficiencia Renal' },
                                                { id: 'hepatitis', label: 'Hepatitis (A, B, C)' },
                                                { id: 'ulcera_gastrica', label: 'Úlcera Gástrica / Gastritis' },
                                                { id: 'fiebre_reumatica', label: 'Fiebre Reumática' },
                                                { id: 'vih_positivo', label: 'VIH / SIDA' },
                                                { id: 'enfermedades_venereas', label: 'Infecciones Transmisión Sexual' },
                                                { id: 'problemas_oncologicos', label: 'Neoplasias / Cáncer' },
                                                { id: 'bajo_tratamiento_medico', label: 'Actualmente bajo tratamiento médico' },
                                                { id: 'toma_medicamentos', label: 'Toma medicamentos de uso continuo' },
                                                { id: 'intervencion_quirurgica', label: 'Intervenciones Quirúrgicas previas' },
                                            ].map((item) => (
                                                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!data.patologicos_personales[item.id]}
                                                            onChange={(e) => handlePersonalesChange(item.id, e.target.checked)}
                                                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                                        />
                                                        <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                                                    </label>
                                                    {data.patologicos_personales[item.id] && (
                                                        <input
                                                            type="text"
                                                            value={data.patologicos_personales[`${item.id}_obs`] || ''}
                                                            onChange={(e) => handlePersonalesChange(`${item.id}_obs`, e.target.value)}
                                                            placeholder="Especificar detalle / medicación..."
                                                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-BLOQUE 2: PATOLÓGICOS FAMILIARES */}
                            {activeSubTab === 'familiares' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500">Marque las patologías hereditarias o presentes en parientes directos (padres, abuelos, hermanos):</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { id: 'diabetes', label: 'Diabetes Mellitus' },
                                            { id: 'hipertension_arterial', label: 'Hipertensión Arterial' },
                                            { id: 'cardiologicos', label: 'Cardiopatías / Infartos' },
                                            { id: 'oncologicos', label: 'Neoplasias / Cáncer' },
                                            { id: 'asma_bronquial', label: 'Asma Bronquial / Alergias' },
                                            { id: 'discrasias_sanguineas', label: 'Discrasias Sanguíneas / Coagulación' },
                                            { id: 'renales', label: 'Nefropatías / Enfermedades Renales' },
                                            { id: 'patologias_orales', label: 'Anomalías Dentomaxilares Hereditarias' },
                                        ].map((item) => (
                                            <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!data.patologicos_familiares[item.id]}
                                                        onChange={(e) => handleFamiliaresChange(item.id, e.target.checked)}
                                                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                                    />
                                                    <span className="text-sm font-bold text-slate-800">{item.label}</span>
                                                </label>
                                                {data.patologicos_familiares[item.id] && (
                                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                                        <input
                                                            type="text"
                                                            value={data.patologicos_familiares[`${item.id}_familiar`] || ''}
                                                            onChange={(e) => handleFamiliaresChange(`${item.id}_familiar`, e.target.value)}
                                                            placeholder="Parentesco (Ej: Madre, Abuelo)"
                                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={data.patologicos_familiares[`${item.id}_obs`] || ''}
                                                            onChange={(e) => handleFamiliaresChange(`${item.id}_obs`, e.target.value)}
                                                            placeholder="Detalles / Medicación"
                                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SUB-BLOQUE 3: NO PATOLÓGICOS Y HÁBITOS */}
                            {activeSubTab === 'no_patologicos' && (
                                <div className="space-y-6">
                                    {/* Hábitos Orales y Parafuncionales */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                                            Hábitos Parafuncionales y Bucales
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {[
                                                { id: 'apretamiento_dentario', label: 'Bruxismo / Apretamiento Dentario' },
                                                { id: 'respira_boca', label: 'Respiración Bucal' },
                                                { id: 'muerde_unas_labios', label: 'Onicofagia (Morderse las uñas / labios)' },
                                                { id: 'muerde_objetos', label: 'Interposición de objetos (bolígrafos, etc.)' },
                                                { id: 'consume_citricos', label: 'Consumo habitual de cítricos' },
                                            ].map((item) => (
                                                <label key={item.id} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!data.no_patologicos[item.id]}
                                                        onChange={(e) => handleNoPatologicosChange(item.id, e.target.checked)}
                                                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                                    />
                                                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hábitos Tóxicos e Higiene */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hábitos Tóxicos</h4>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!data.no_patologicos.fuma}
                                                    onChange={(e) => handleNoPatologicosChange('fuma', e.target.checked)}
                                                    className="w-4 h-4 text-teal-600 rounded"
                                                />
                                                <span className="text-xs font-bold text-slate-800">Tabaquismo</span>
                                            </label>
                                            {data.no_patologicos.fuma && (
                                                <input
                                                    type="text"
                                                    value={data.no_patologicos.fuma_cantidad_diaria || ''}
                                                    onChange={(e) => handleNoPatologicosChange('fuma_cantidad_diaria', e.target.value)}
                                                    placeholder="Cigarrillos al día / frecuencia"
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                            )}
                                            <label className="flex items-center space-x-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!data.no_patologicos.bebe}
                                                    onChange={(e) => handleNoPatologicosChange('bebe', e.target.checked)}
                                                    className="w-4 h-4 text-teal-600 rounded"
                                                />
                                                <span className="text-xs font-bold text-slate-800">Consumo de Alcohol</span>
                                            </label>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Higiene Bucal</h4>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Frecuencia de Cepillado</label>
                                                <select
                                                    value={data.no_patologicos.veces_cepilla_dia || ''}
                                                    onChange={(e) => handleNoPatologicosChange('veces_cepilla_dia', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                >
                                                    <option value="">Seleccione...</option>
                                                    <option value="1 vez al dia">1 vez al día</option>
                                                    <option value="2 veces al dia">2 veces al día</option>
                                                    <option value="3 o mas veces al dia">3 o más veces al día</option>
                                                    <option value="Ocasional">Ocasional</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Elementos Auxiliares</label>
                                                <input
                                                    type="text"
                                                    value={data.no_patologicos.elementos_higiene || ''}
                                                    onChange={(e) => handleNoPatologicosChange('elementos_higiene', e.target.value)}
                                                    placeholder="Hilo dental, enjuague bucal, cepillos interproximales..."
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-BLOQUE 4: GINECO-OBSTÉTRICOS */}
                            {activeSubTab === 'ginecologicos' && (
                                <div className="space-y-4">
                                    {paciente.sexo !== 'F' && paciente.sexo !== 'Femenino' ? (
                                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                                            Sección aplicable a pacientes de sexo femenino.
                                        </div>
                                    ) : (
                                        <div className="p-5 bg-purple-50/40 rounded-xl border border-purple-200 space-y-4">
                                            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                                                Antecedentes Gineco-Obstétricos
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-purple-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!data.ginecologicos.posibilidad_embarazo}
                                                            onChange={(e) => handleGinecologicosChange('posibilidad_embarazo', e.target.checked)}
                                                            className="w-4 h-4 text-purple-600 rounded"
                                                        />
                                                        <span className="text-xs font-bold text-slate-800">¿Posibilidad de Embarazo / Gestante?</span>
                                                    </label>
                                                    {data.ginecologicos.posibilidad_embarazo && (
                                                        <input
                                                            type="text"
                                                            value={data.ginecologicos.embarazo_meses || ''}
                                                            onChange={(e) => handleGinecologicosChange('embarazo_meses', e.target.value)}
                                                            placeholder="Meses o semanas de gestación"
                                                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                                        />
                                                    )}
                                                </div>

                                                <div className="bg-white p-4 rounded-xl border border-purple-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!data.ginecologicos.lactancia}
                                                            onChange={(e) => handleGinecologicosChange('lactancia', e.target.checked)}
                                                            className="w-4 h-4 text-purple-600 rounded"
                                                        />
                                                        <span className="text-xs font-bold text-slate-800">Lactancia Materna Activa</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 pt-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!data.ginecologicos.toma_anticonceptivos}
                                                            onChange={(e) => handleGinecologicosChange('toma_anticonceptivos', e.target.checked)}
                                                            className="w-4 h-4 text-purple-600 rounded"
                                                        />
                                                        <span className="text-xs font-bold text-slate-800">Uso de Anticonceptivos Hormonales</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BARRA DE SUPERVISIÓN ACADÉMICA Y GUARDADO */}
                            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Estado de Revisión:</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                                        data.estado_revision === 'aprobado'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : data.estado_revision === 'en_revision'
                                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}>
                                        ● {data.estado_revision}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {recentlySuccessful && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>¡Guardado con éxito!</span>
                                        </span>
                                    )}
                                    {!isReadOnlyStudent && (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            <span>{processing ? 'Guardando...' : 'Guardar Antecedentes Médicos'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}

                    {/* PESTAÑA: ODONTOPEDIATRÍA */}
                    {activeTab === 'odontopediatria' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Historia Clínica Odontopediátrica
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Desarrollo perinatal y psicomotor, hábitos infantiles, oclusión y clasificación conductual de Escobar.
                                    </p>
                                </div>
                                {!isReadOnlyStudent && (
                                    <button
                                        type="button"
                                        onClick={handleGuardarAntecedentes}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>{processing ? 'Guardando...' : 'Guardar Odontopediatría'}</span>
                                    </button>
                                )}
                            </div>

                            <TabOdontopediatria
                                formData={data}
                                onChange={handleInputChange}
                                pacienteEdad={paciente.edad}
                            />
                        </div>
                    )}

                    {/* PESTAÑA: PERIODONCIA & PERIODONTOGRAMA */}
                    {activeTab === 'periodoncia' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setPeriodonciaSubTab('grafico')}
                                        className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition ${
                                            periodonciaSubTab === 'grafico'
                                                ? 'bg-white text-teal-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <span>Periodontograma Gráfico 2D</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPeriodonciaSubTab('clinico')}
                                        className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition ${
                                            periodonciaSubTab === 'clinico'
                                                ? 'bg-white text-teal-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Examen Periodontal & Síntomas</span>
                                        </span>
                                    </button>
                                </div>
                                {!isReadOnlyStudent && (
                                    <button
                                        type="button"
                                        onClick={handleGuardarAntecedentes}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>{processing ? 'Guardando...' : 'Guardar Cambios Periodontales'}</span>
                                    </button>
                                )}
                            </div>

                            {periodonciaSubTab === 'grafico' ? (
                                <PeriodontogramaProvider initialData={periodontograma} pacienteId={paciente.id}>
                                    <TabPeriodontogramaGrafico pacienteId={paciente.id} />
                                </PeriodontogramaProvider>
                            ) : (
                                <TabPeriodoncia
                                    formData={data}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>
                    )}

                    {/* PESTAÑA: TRATAMIENTOS & PROCEDIMIENTOS (MÓDULO 3 + CARDEX MULTISESIÓN) */}
                    {activeTab === 'tratamientos' && (
                        <div className="p-4 sm:p-6 space-y-8">
                            <TabModulo3PlanesYTratamiento
                                paciente={paciente}
                                aranceles={aranceles}
                                docentes={docentes}
                                estudiantes={estudiantes}
                                readOnly={isReadOnlyStudent}
                            />

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Cardex de Sesiones Clínicas & Registro de Evidencias (Fotos y Radiografías)</span>
                                </h3>
                                <TabHistorialTratamientos
                                    paciente={paciente}
                                    procedimientos={data.procedimientos_tratamientos || []}
                                    onActualizarProcedimientos={handleActualizarProcedimientos}
                                    currentUser={user}
                                    roleSlug={roleSlug}
                                    isDocenteOrAdmin={isDocenteOrAdmin}
                                    onGuardarExpediente={handleGuardarAntecedentes}
                                    processing={processing}
                                />
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA: HISTORIAS CLÍNICAS HC-001 */}
                    {activeTab === 'historias' && (
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-base">Historias Clínicas Odontológicas (HC-001)</h3>
                                <Link
                                    href={route('historias-clinicas.create', { paciente_id: paciente.id })}
                                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                                >
                                    + Redactar Nueva Historia
                                </Link>
                            </div>

                            {historiasClinicas && historiasClinicas.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {historiasClinicas.map((hc) => (
                                        <div key={hc.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 shadow-xs transition space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                                                    {hc.numero_expediente}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                                                    hc.estado === 'aprobada' || hc.estado === 'aprobado'
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                        : hc.estado === 'en_revision'
                                                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    ● {hc.estado}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-slate-400 uppercase">Motivo de Consulta:</div>
                                                <p className="text-sm font-semibold text-slate-800 line-clamp-2">{hc.motivo_consulta}</p>
                                            </div>

                                            {hc.diagnostico_definitivo && (
                                                <div>
                                                    <div className="text-xs font-semibold text-slate-400 uppercase">Diagnóstico Definitivo:</div>
                                                    <p className="text-xs text-slate-700 line-clamp-2">{hc.diagnostico_definitivo}</p>
                                                </div>
                                            )}

                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                                <span>Elaborado por: {hc.estudiante?.name || 'Estudiante'}</span>
                                                <Link
                                                    href={route('historias-clinicas.show', hc.id)}
                                                    className="font-bold text-teal-600 hover:text-teal-800 underline"
                                                >
                                                    Ver Historia Completa →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <p className="font-semibold text-slate-700">No hay historias clínicas registradas</p>
                                    <p className="text-xs text-slate-400 mt-1">Haga clic en el botón superior para abrir el formulario HC-001 por pasos.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA: ODONTOGRAMA DIGITAL ADULTO Y TEMPORAL */}
                    {activeTab === 'odontograma' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Odontograma Digital Interactivo (Adulto & Temporal)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Representación gráfica interactiva FDI con 5 caras por pieza dental, registro de patologías y cálculo de índice CPO-D.
                                    </p>
                                </div>
                                {!isReadOnlyStudent && (
                                    <button
                                        type="button"
                                        onClick={handleGuardarAntecedentes}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>{processing ? 'Guardando...' : 'Guardar Odontograma'}</span>
                                    </button>
                                )}
                            </div>

                            <TabOdontogramaDigital
                                odontogramaData={data.odontograma}
                                onChange={(nuevoOdontograma) => setData('odontograma', nuevoOdontograma)}
                                readOnly={isReadOnlyStudent}
                                pacienteEdad={paciente.edad}
                            />
                        </div>
                    )}

                    {/* PESTAÑA: DIAGNÓSTICOS CIE-10/CDT-2, PLAN DE TRATAMIENTO & FORENSE */}
                    {activeTab === 'plan' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Diagnósticos Codificados, Plan de Tratamiento & Odontología Forense
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Vinculación CIE-10 y CDT-2, priorización de tratamientos (Urgente, Prioritario, Electivo) y fichaje de características dentales forenses.
                                    </p>
                                </div>
                                {!isReadOnlyStudent && (
                                    <button
                                        type="button"
                                        onClick={handleGuardarAntecedentes}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        <span>{processing ? 'Guardando...' : 'Guardar Plan y Diagnósticos'}</span>
                                    </button>
                                )}
                            </div>

                            <TabDiagnosticoYPlanTratamiento
                                diagnosticos={data.diagnosticos_codificados}
                                planTratamiento={data.plan_tratamiento_secuencia}
                                odontologiaForense={data.odontologia_legal_forense}
                                onActualizarDiagnosticos={(nuevos) => setData('diagnosticos_codificados', nuevos)}
                                onActualizarPlanTratamiento={(nuevoPlan) => setData('plan_tratamiento_secuencia', nuevoPlan)}
                                onActualizarForense={(nuevoForense) => setData('odontologia_legal_forense', nuevoForense)}
                                readOnly={isReadOnlyStudent}
                            />
                        </div>
                    )}

                    {/* PESTAÑA: DOCUMENTACIÓN DIGITAL Y CONSENTIMIENTO INFORMADO */}
                    {activeTab === 'consentimientos' && (
                        <div className="p-4 sm:p-6 space-y-6">
                            <TabDocumentacionConsentimientos
                                paciente={paciente}
                                onActualizarConsentimiento={(datosConsent) => {
                                    router.post(
                                        route('pacientes.consentimiento.guardar', paciente.id),
                                        datosConsent,
                                        { preserveScroll: true }
                                    );
                                }}
                                onSubirCi={(formData) => {
                                    router.post(
                                        route('pacientes.documento-ci.subir', paciente.id),
                                        formData,
                                        { preserveScroll: true }
                                    );
                                }}
                                readOnly={isReadOnlyStudent}
                            />
                        </div>
                    )}

                    {/* PESTAÑA: FILIACIÓN DEMOGRÁFICA COMPLETA & ADMISIÓN */}
                    {activeTab === 'filiacion' && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Ficha de Admisión y Filiación Institucional</h3>
                                    <p className="text-xs text-slate-500">Módulo 1: Puerta de entrada y captación de datos de la Clínica Odontológica UNIFRANZ</p>
                                </div>
                                {paciente.iup && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500">IUP Asignado:</span>
                                        <button
                                            type="button"
                                            onClick={handleCopiarIup}
                                            className="px-3 py-1 bg-slate-900 text-teal-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition"
                                        >
                                            <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            <span>{paciente.iup}</span>
                                            {copiadoIup && <span className="text-[10px] text-emerald-400">✓</span>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Documento Oficial</span>
                                    <div className="text-base font-bold text-slate-900 mt-1">{paciente.ci} ({paciente.ci_expedido || 'LP'})</div>
                                    <span className="text-xs text-slate-500">Nacionalidad: {paciente.nacionalidad || 'Boliviana'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Nacimiento & Edad</span>
                                    <div className="text-base font-bold text-slate-900 mt-1">{paciente.fecha_nacimiento} ({paciente.edad} años)</div>
                                    <span className="text-xs text-slate-500">Lugar: {paciente.lugar_nacimiento || 'No especificado'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Estado Civil & Sexo</span>
                                    <div className="text-base font-bold text-slate-900 mt-1">{paciente.estado_civil || 'Soltero(a)'} • {paciente.sexo === 'M' ? 'Masculino' : (paciente.sexo === 'F' ? 'Femenino' : paciente.sexo)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Ocupación & Instrucción</span>
                                    <div className="text-sm font-bold text-slate-900 mt-1">{paciente.ocupacion || 'Sin ocupación'}</div>
                                    <span className="text-xs text-slate-500">Nivel: {paciente.nivel_instruccion || 'No registrado'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Dirección Domiciliaria</span>
                                    <div className="text-sm font-semibold text-slate-900 mt-1">{paciente.direccion || 'Sin dirección registrada'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Teléfono y Móvil</span>
                                    <div className="text-sm font-bold text-slate-900 mt-1">{paciente.celular || paciente.telefono || 'Sin teléfono'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Correo Electrónico (Recordatorios)</span>
                                    <div className="text-sm font-semibold text-teal-700 mt-1">{paciente.email || 'Sin correo electrónico'}</div>
                                </div>

                                {/* Admisión Clínica */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Fuente de Referencia</span>
                                    <div className="text-sm font-semibold text-slate-800 mt-1">{paciente.fuente_referencia || 'No registrada'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Seguro / Convenio</span>
                                    <div className="text-sm font-semibold text-slate-800 mt-1">{paciente.seguro_convenio || 'Particular (Sin convenio)'}</div>
                                    {paciente.numero_poliza && <span className="text-xs text-slate-500">Póliza: {paciente.numero_poliza}</span>}
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Saldo de Cuenta</span>
                                    <div className={`text-base font-extrabold mt-1 ${Number(paciente.saldo_cuenta) > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        Bs. {Number(paciente.saldo_cuenta || 0).toFixed(2)}
                                    </div>
                                    <span className="text-[11px] text-slate-400">{Number(paciente.saldo_cuenta) > 0 ? 'Pendiente de cobro' : 'Al día'}</span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Contacto de Emergencia</span>
                                    <div className="text-sm font-semibold text-slate-900 mt-1">
                                        {paciente.contacto_emergencia || 'No registrado'} {paciente.parentesco_emergencia ? `(${paciente.parentesco_emergencia})` : ''} - Tel: {paciente.telefono_emergencia || '-'}
                                    </div>
                                </div>

                                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 sm:col-span-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-teal-800 uppercase">Consentimiento Informado Inicial</span>
                                            <div className="text-sm font-medium text-slate-800 mt-0.5">
                                                {paciente.consentimiento_inicial?.firmado ? (
                                                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Aceptado y firmado digitalmente el {paciente.consentimiento_inicial?.fecha_hora || 'en admisión'}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-700 font-bold">Pendiente de firma o escaneo</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('consentimientos')}
                                            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition"
                                        >
                                            Ver Documentación & Firma
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE TRANSFERENCIA / ASIGNACIÓN DE ESTUDIANTE */}
            {modalTransferirOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Transferir o Asignar Paciente</h3>
                                    <p className="text-xs text-slate-500">Asignar operador responsable del tratamiento clínico</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalTransferirOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="font-bold text-slate-800 text-sm">
                                {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                            </div>
                            <div className="text-slate-500">
                                CI: {paciente.ci} • Edad: {paciente.edad} años
                            </div>
                            <div className="pt-1 text-slate-600">
                                <strong>Operador Actual:</strong>{' '}
                                {operadorNombre ? (
                                    <span className="text-teal-700 font-semibold">{operadorNombre}</span>
                                ) : (
                                    <span className="text-slate-400 italic">Sin operador asignado</span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleTransferirEstudiante} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Seleccionar Nuevo Estudiante / Operador
                                </label>
                                <select
                                    value={selectedEstudianteId}
                                    onChange={(e) => setSelectedEstudianteId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                >
                                    <option value="">-- Dejar sin asignar (Liberar paciente) --</option>
                                    {estudiantes.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.name} ({est.codigo_institucional || 'Alumno'}) - {est.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Motivo de la Transferencia / Asignación
                                </label>
                                <input
                                    type="text"
                                    value={motivoTransferencia}
                                    onChange={(e) => setMotivoTransferencia(e.target.value)}
                                    placeholder="Ej: Continuidad de endodoncia en multisesión, cambio de rotación semestral..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    El cambio quedará registrado en la auditoría del paciente para trazabilidad clínica.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalTransferirOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoTransferencia}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {guardandoTransferencia ? 'Guardando...' : 'Confirmar Transferencia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
