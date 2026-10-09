import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({
    solicitudes = [],
    requisitosCupos = [],
    alertasDesempeno = [],
    programacionesDocentes = [],
    avanceCuposEstudiantes = [],
    docentes = [],
    estudiantes = [],
    pacientes = [],
    sillones = [],
    metricas = {},
    userRole = 'estudiante',
}) {
    const { auth, flash } = usePage().props;
    const isDocente = ['docente', 'director_clinica', 'admin'].includes(userRole);
    const isCoordinador = ['director_clinica', 'admin'].includes(userRole);
    const isEstudiante = userRole === 'estudiante';

    const [activeTab, setActiveTab] = useState('solicitudes'); // solicitudes | cupos | alertas | programacion | configuracion
    const [filtroHito, setFiltroHito] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');

    // Modales
    const [showNuevaSolicitudModal, setShowNuevaSolicitudModal] = useState(false);
    const [showResponderModal, setShowResponderModal] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [showAlertaModal, setShowAlertaModal] = useState(false);
    const [showNuevoRequisitoModal, setShowNuevoRequisitoModal] = useState(false);
    const [showNuevaProgramacionModal, setShowNuevaProgramacionModal] = useState(false);
    const [showVerFirmaModal, setShowVerFirmaModal] = useState(false);
    const [firmaDetalle, setFirmaDetalle] = useState(null);
    const [showResolverAlertaModal, setShowResolverAlertaModal] = useState(false);
    const [alertaAResolver, setAlertaAResolver] = useState(null);

    // Formulario de Nueva Solicitud (Estudiante)
    const { data: formSol, setData: setFormSol, post: postSol, processing: procSol, reset: resetSol, errors: errSol } = useForm({
        paciente_id: '',
        docente_id: '',
        sillon_id: '',
        asignatura: 'Endodoncia I',
        tipo_hito: 'diagnostico_pdt',
        procedimiento: '',
        pieza_dental: '',
        comentarios_estudiante: '',
    });

    // Formulario de Respuesta / Evaluación Docente (Docente)
    const { data: formResp, setData: setFormResp, post: postResp, processing: procResp, reset: resetResp, errors: errResp } = useForm({
        estado: 'aprobado',
        comentarios_docente: '',
        rubrica_bioseguridad: 5,
        rubrica_destreza: 5,
        rubrica_criterio: 5,
        rubrica_trato_paciente: 5,
        nota_final: 90,
    });

    // Formulario de Alerta Temprana (Docente)
    const { data: formAlerta, setData: setFormAlerta, post: postAlerta, processing: procAlerta, reset: resetAlerta, errors: errAlerta } = useForm({
        estudiante_id: '',
        asignatura: 'Operatoria Dental II',
        motivo_categoria: 'bioseguridad',
        motivo_detallado: '',
        medidas_sugeridas: 'Tutoría clínica de refuerzo y práctica en laboratorio con simulador.',
    });

    // Formulario de Configuración de Cupos (Coordinador)
    const { data: formCupo, setData: setFormCupo, post: postCupo, processing: procCupo, reset: resetCupo, errors: errCupo } = useForm({
        asignatura: '',
        semestre: '7mo Semestre',
        procedimiento_clave: '',
        cupos_minimos: 2,
        descripcion: '',
    });

    // Formulario de Programación Docente
    const { data: formProg, setData: setFormProg, post: postProg, processing: procProg, reset: resetProg, errors: errProg } = useForm({
        docente_id: '',
        asignatura: 'Endodoncia I',
        dia_semana: 'Lunes',
        turno: 'Mañana (08:00 - 12:00)',
        sala_clinica: 'Clínica Odontológica Integral Piso 2',
        gabinetes_asignados: 'Gabinetes 1 al 6',
    });

    // Formulario de Resolución de Alerta
    const { data: formResAlerta, setData: setFormResAlerta, post: postResAlerta, processing: procResAlerta, reset: resetResAlerta } = useForm({
        resolucion_coordinacion: '',
    });

    const handleCrearSolicitud = (e) => {
        e.preventDefault();
        postSol(route('supervision.solicitudes.store'), {
            onSuccess: () => {
                setShowNuevaSolicitudModal(false);
                resetSol();
            },
        });
    };

    const handleResponderSolicitud = (e) => {
        e.preventDefault();
        if (!solicitudSeleccionada) return;
        postResp(route('supervision.solicitudes.responder', solicitudSeleccionada.id), {
            onSuccess: () => {
                setShowResponderModal(false);
                setSolicitudSeleccionada(null);
                resetResp();
            },
        });
    };

    const handleCrearAlerta = (e) => {
        e.preventDefault();
        postAlerta(route('supervision.alertas.store'), {
            onSuccess: () => {
                setShowAlertaModal(false);
                resetAlerta();
            },
        });
    };

    const handleCrearCupo = (e) => {
        e.preventDefault();
        postCupo(route('supervision.cupos.store'), {
            onSuccess: () => {
                setShowNuevoRequisitoModal(false);
                resetCupo();
            },
        });
    };

    const handleCrearProg = (e) => {
        e.preventDefault();
        postProg(route('supervision.programacion.store'), {
            onSuccess: () => {
                setShowNuevaProgramacionModal(false);
                resetProg();
            },
        });
    };

    const handleResolverAlerta = (e) => {
        e.preventDefault();
        if (!alertaAResolver) return;
        postResAlerta(route('supervision.alertas.resolver', alertaAResolver.id), {
            onSuccess: () => {
                setShowResolverAlertaModal(false);
                setAlertaAResolver(null);
                resetResAlerta();
            },
        });
    };

    // Filtros
    const solicitudesFiltradas = solicitudes.filter((s) => {
        if (filtroHito !== 'todos' && s.tipo_hito !== filtroHito) return false;
        if (filtroEstado !== 'todos' && s.estado !== filtroEstado) return false;
        return true;
    });

    const alumnosFiltrados = avanceCuposEstudiantes.filter((a) => {
        if (!busquedaEstudiante) return true;
        const q = busquedaEstudiante.toLowerCase();
        return a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    });

    const getHitoBadge = (hito) => {
        switch (hito) {
            case 'diagnostico_pdt':
                return { label: '1. Diagnóstico / PdT', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'inicio_procedimiento_critico':
                return { label: '2. Inicio Crítico', color: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'cierre_alta_tecnica':
                return { label: '3. Cierre / Alta Técnica', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            default:
                return { label: hito, color: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { label: 'Pendiente Docente', color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' };
            case 'aprobado':
                return { label: 'Aprobado y Firmado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'rechazado':
                return { label: 'Observado / Rechazado', color: 'bg-rose-50 text-rose-700 border-rose-200' };
            default:
                return { label: estado, color: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Módulo 6: Formación y Supervisión Clínica - UNIFRANZ" />

            {/* Cabecera Principal */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
                            Módulo 6
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Formación y Supervisión Clínica
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestión académica, control de cupos obligatorios, flujos de supervisión docente y alertas tempranas.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    {/* Botón para Estudiante: Solicitar Supervisión */}
                    {(isEstudiante || isCoordinador) && (
                        <button
                            onClick={() => setShowNuevaSolicitudModal(true)}
                            className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Solicitar Aprobación de Hito
                        </button>
                    )}

                    {/* Botón para Docente: Lanzar Alerta Temprana */}
                    {isDocente && (
                        <button
                            onClick={() => setShowAlertaModal(true)}
                            className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Lanzar Alerta Temprana
                        </button>
                    )}

                    {/* Botón para Coordinador: Configurar Cupos */}
                    {isCoordinador && (
                        <button
                            onClick={() => setShowNuevoRequisitoModal(true)}
                            className="inline-flex items-center px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configurar Cuotas
                        </button>
                    )}
                </div>
            </div>

            {/* Tarjetas de Métricas Ejecutivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supervisiones Pendientes</p>
                        <h3 className="text-2xl font-black text-amber-600 mt-1">{metricas.solicitudes_pendientes ?? 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">En espera de firma docente</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hitos Aprobados y Validados</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">{metricas.solicitudes_aprobadas ?? 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Con firma digital SHA-256</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alumnos Retrasados</p>
                        <h3 className="text-2xl font-black text-rose-600 mt-1">{metricas.alumnos_retrasados ?? 0}</h3>
                        <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Avance de cupos &lt; 40%</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas Tempranas Activas</p>
                        <h3 className="text-2xl font-black text-orange-600 mt-1">{metricas.alertas_activas_total ?? 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Requieren acción preventiva</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Navegación por Pestañas */}
            <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-2xl px-4 pt-2 shadow-2xs overflow-x-auto">
                <button
                    onClick={() => setActiveTab('solicitudes')}
                    className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                        activeTab === 'solicitudes'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Flujo de Supervisión Clínica ({solicitudes.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('cupos')}
                    className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                        activeTab === 'cupos'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Control de Cupos & Avance ({avanceCuposEstudiantes.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('alertas')}
                    className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                        activeTab === 'alertas'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Alertas Tempranas ({alertasDesempeno.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('programacion')}
                    className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                        activeTab === 'programacion'
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Programación Docente / Turnos</span>
                </button>

                {isCoordinador && (
                    <button
                        onClick={() => setActiveTab('configuracion')}
                        className={`py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                            activeTab === 'configuracion'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span>Cuotas Requeridas ({requisitosCupos.length})</span>
                    </button>
                )}
            </div>

            {/* TAB 1: FLUJO DE SUPERVISIÓN CLÍNICA OBLIGATORIA */}
            {activeTab === 'solicitudes' && (
                <div className="space-y-4">
                    {/* Barra de Filtros */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Hito Clínico:</label>
                            <select
                                value={filtroHito}
                                onChange={(e) => setFiltroHito(e.target.value)}
                                className="border border-slate-200 rounded-xl text-sm py-1.5 px-3 bg-slate-50 font-medium text-slate-700 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="todos">Todos los hitos</option>
                                <option value="diagnostico_pdt">1. Diagnóstico / PdT</option>
                                <option value="inicio_procedimiento_critico">2. Inicio Crítico</option>
                                <option value="cierre_alta_tecnica">3. Cierre / Alta Técnica</option>
                            </select>

                            <label className="text-xs font-bold text-slate-500 uppercase ml-2">Estado:</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="border border-slate-200 rounded-xl text-sm py-1.5 px-3 bg-slate-50 font-medium text-slate-700 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="pendiente">Pendientes de Firma</option>
                                <option value="aprobado">Aprobados</option>
                                <option value="rechazado">Rechazados</option>
                            </select>
                        </div>

                        <div className="text-xs text-slate-500 font-semibold">
                            Mostrando <span className="font-bold text-slate-800">{solicitudesFiltradas.length}</span> solicitudes
                        </div>
                    </div>

                    {/* Tabla de Solicitudes */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3.5">Hito & Procedimiento</th>
                                        <th className="px-5 py-3.5">Estudiante</th>
                                        <th className="px-5 py-3.5">Paciente (IUP)</th>
                                        <th className="px-5 py-3.5">Docente Supervisor</th>
                                        <th className="px-5 py-3.5">Gabinete / SIllón</th>
                                        <th className="px-5 py-3.5">Estado</th>
                                        <th className="px-5 py-3.5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {solicitudesFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                                                No hay solicitudes de supervisión registradas con los filtros seleccionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        solicitudesFiltradas.map((sol) => {
                                            const hitoBadge = getHitoBadge(sol.tipo_hito);
                                            const estadoBadge = getEstadoBadge(sol.estado);
                                            return (
                                                <tr key={sol.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mb-1.5 ${hitoBadge.color}`}>
                                                            {hitoBadge.label}
                                                        </span>
                                                        <div className="font-bold text-slate-900">{sol.procedimiento}</div>
                                                        <div className="text-xs text-teal-700 font-medium">
                                                            {sol.asignatura} {sol.pieza_dental && `• Pieza ${sol.pieza_dental}`}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                                            Solicitado: {new Date(sol.solicitado_at).toLocaleString('es-BO')}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-900">{sol.estudiante?.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">
                                                            {sol.estudiante?.codigo_institucional ?? `EST-${sol.estudiante_id}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-900">
                                                            {sol.paciente?.nombres} {sol.paciente?.apellido_paterno}
                                                        </div>
                                                        <div className="text-xs font-mono text-teal-600 font-bold">
                                                            IUP: {sol.paciente?.iup}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-900">{sol.docente?.name}</div>
                                                        <div className="text-xs text-slate-400">{sol.docente?.email}</div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {sol.sillon ? (
                                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                                                {sol.sillon.codigo} - {sol.sillon.nombre}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No especificado</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${estadoBadge.color}`}>
                                                            {estadoBadge.label}
                                                        </span>
                                                        {sol.evaluacion_rubrica?.nota_final && (
                                                            <div className="text-[11px] font-bold text-slate-600 mt-1">
                                                                Nota: <span className="text-teal-700">{sol.evaluacion_rubrica.nota_final} / 100</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right space-x-2">
                                                        {/* Botón para que el docente responda si está pendiente */}
                                                        {isDocente && sol.estado === 'pendiente' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSolicitudSeleccionada(sol);
                                                                    setShowResponderModal(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                                                            >
                                                                Evaluar & Firmar
                                                            </button>
                                                        )}

                                                        {/* Ver Firma Digital si ya fue respondido */}
                                                        {sol.firma_digital && (
                                                            <button
                                                                onClick={() => {
                                                                    setFirmaDetalle(sol);
                                                                    setShowVerFirmaModal(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200"
                                                            >
                                                                Ver Firma Digital
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CONTROL DE CUPOS POR ASIGNATURA & ALUMNOS RETRASADOS */}
            {activeTab === 'cupos' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Seguimiento Automatizado de Requisitos Clínicos</h2>
                            <p className="text-xs text-slate-500">
                                Monitoreo en tiempo real del cumplimiento de procedimientos por alumno respecto a los cupos mínimos de cada asignatura.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                placeholder="Buscar por alumno o código..."
                                value={busquedaEstudiante}
                                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                className="border border-slate-200 rounded-xl text-sm py-2 px-3 w-64 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alumnosFiltrados.map((item) => (
                            <div
                                key={item.estudiante_id}
                                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                                    item.esta_retrasado
                                        ? 'border-rose-300 bg-rose-50/10 hover:shadow-md'
                                        : 'border-slate-200/80 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{item.nombre}</h3>
                                        <p className="text-xs text-slate-400 font-mono">{item.codigo}</p>
                                    </div>
                                    {item.esta_retrasado ? (
                                        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200 animate-pulse">
                                            Retrasado (&lt; 40%)
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                                            En Cronograma
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-slate-600">Avance de Cupos Aprobados</span>
                                        <span className="text-teal-700 font-bold">{item.porcentaje_avance}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                                item.esta_retrasado ? 'bg-rose-500' : 'bg-teal-600'
                                            }`}
                                            style={{ width: `${item.porcentaje_avance}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                                        <span>
                                            Procedimientos Validados: <strong>{item.procedimientos_aprobados}</strong> / {item.cupos_requeridos}
                                        </span>
                                        {item.alertas_activas > 0 && (
                                            <span className="text-orange-600 font-bold">
                                                ⚠️ {item.alertas_activas} Alerta(s)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 truncate max-w-[170px]">{item.email}</span>
                                    {isDocente && (
                                        <button
                                            onClick={() => {
                                                setFormAlerta('estudiante_id', item.estudiante_id);
                                                setShowAlertaModal(true);
                                            }}
                                            className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                                        >
                                            + Alerta Temprana
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: ALERTAS TEMPRANAS DE BAJO DESEMPEÑO */}
            {activeTab === 'alertas' && (
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
                        <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-sm">Protocolo Institucional de Alerta Temprana</h3>
                            <p className="text-xs text-amber-800 mt-1">
                                Las alertas son registradas por el Docente Supervisor ante deficiencias críticas de bioseguridad, destreza manual o rendimiento teórico-práctico. Se notifican automáticamente a la Coordinación Clínica para la asignación oportuna de tutorías o reasignación de casos.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3.5">Estudiante</th>
                                        <th className="px-5 py-3.5">Docente Emisor</th>
                                        <th className="px-5 py-3.5">Asignatura</th>
                                        <th className="px-5 py-3.5">Motivo / Categoría</th>
                                        <th className="px-5 py-3.5">Medidas Sugeridas</th>
                                        <th className="px-5 py-3.5">Estado</th>
                                        <th className="px-5 py-3.5 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {alertasDesempeno.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                                                No se registran alertas tempranas de bajo desempeño activas.
                                            </td>
                                        </tr>
                                    ) : (
                                        alertasDesempeno.map((alerta) => (
                                            <tr key={alerta.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900">{alerta.estudiante?.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        {alerta.estudiante?.codigo_institucional ?? `EST-${alerta.estudiante_id}`}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-slate-900">{alerta.docente?.name}</div>
                                                </td>
                                                <td className="px-5 py-4 font-semibold text-teal-700">
                                                    {alerta.asignatura}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                        {alerta.motivo_categoria.toUpperCase()}
                                                    </span>
                                                    <p className="text-xs text-slate-600 mt-1 max-w-xs">{alerta.motivo_detallado}</p>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-500 max-w-xs">
                                                    {alerta.medidas_sugeridas || 'Tutoría de refuerzo programada'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {alerta.estado === 'activa' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                            Activa
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                            Resuelta
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {isCoordinador && alerta.estado === 'activa' && (
                                                        <button
                                                            onClick={() => {
                                                                setAlertaAResolver(alerta);
                                                                setShowResolverAlertaModal(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                                        >
                                                            Resolver Alerta
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: PROGRAMACIÓN DOCENTE / TURNOS */}
            {activeTab === 'programacion' && (
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Programación de Supervisión Docente por Horario</h2>
                            <p className="text-xs text-slate-500">
                                Turnos, días y distribución de gabinetes clínicos asignados a cada docente supervisor.
                            </p>
                        </div>
                        {isCoordinador && (
                            <button
                                onClick={() => setShowNuevaProgramacionModal(true)}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                            >
                                + Nueva Programación Horaria
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programacionesDocentes.map((prog) => (
                            <div key={prog.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold">
                                        {prog.dia_semana}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">{prog.turno}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">{prog.docente?.name}</h3>
                                <p className="text-xs font-medium text-teal-600">{prog.asignatura}</p>
                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{prog.sala_clinica}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-semibold text-slate-700">{prog.gabinetes_asignados}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: CONFIGURACIÓN CENTRAL DE CUPOS (COORDINADOR) */}
            {activeTab === 'configuracion' && isCoordinador && (
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Catálogo de Cuotas Obligatorias por Asignatura</h2>
                            <p className="text-xs text-slate-500">
                                Parámetros mínimos de acreditación de procedimientos clínicos para cada materia del plan curricular.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNuevoRequisitoModal(true)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                        >
                            + Agregar Procedimiento Requerido
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">Asignatura</th>
                                    <th className="px-5 py-3.5">Semestre</th>
                                    <th className="px-5 py-3.5">Procedimiento Clave</th>
                                    <th className="px-5 py-3.5">Cupos Mínimos Exigidos</th>
                                    <th className="px-5 py-3.5">Descripción / Criterio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requisitosCupos.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-4 font-bold text-slate-900">{req.asignatura}</td>
                                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">{req.semestre}</td>
                                        <td className="px-5 py-4 font-semibold text-teal-700">{req.procedimiento_clave}</td>
                                        <td className="px-5 py-4">
                                            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-black">
                                                {req.cupos_minimos} cupo(s)
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 max-w-sm">{req.descripcion || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL 1: NUEVA SOLICITUD DE SUPERVISIÓN (ESTUDIANTE) */}
            {showNuevaSolicitudModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Solicitud Digital de Aprobación</h3>
                                <p className="text-xs text-slate-500">Enviar hito clínico para revisión y firma docente</p>
                            </div>
                            <button
                                onClick={() => setShowNuevaSolicitudModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCrearSolicitud} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente (IUP) *</label>
                                <select
                                    value={formSol.paciente_id}
                                    onChange={(e) => setFormSol('paciente_id', e.target.value)}
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="">Seleccione Paciente...</option>
                                    {pacientes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombres} {p.apellido_paterno} (IUP: {p.iup} | CI: {p.ci})
                                        </option>
                                    ))}
                                </select>
                                {errSol.paciente_id && <p className="text-xs text-rose-500 mt-1">{errSol.paciente_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Docente Supervisor *</label>
                                    <select
                                        value={formSol.docente_id}
                                        onChange={(e) => setFormSol('docente_id', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">Seleccione Docente...</option>
                                        {docentes.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sillón / Gabinete</label>
                                    <select
                                        value={formSol.sillon_id}
                                        onChange={(e) => setFormSol('sillon_id', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">Seleccione Sillón...</option>
                                        {sillones.map((s) => (
                                            <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asignatura *</label>
                                    <select
                                        value={formSol.asignatura}
                                        onChange={(e) => setFormSol('asignatura', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="Endodoncia I">Endodoncia I</option>
                                        <option value="Operatoria Dental II">Operatoria Dental II</option>
                                        <option value="Cirugía Bucal I">Cirugía Bucal I</option>
                                        <option value="Periodoncia">Periodoncia</option>
                                        <option value="Odontopediatría">Odontopediatría</option>
                                        <option value="Prótesis Fija y Removible">Prótesis Fija y Removible</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hito de Supervisión *</label>
                                    <select
                                        value={formSol.tipo_hito}
                                        onChange={(e) => setFormSol('tipo_hito', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500 font-semibold text-teal-800"
                                    >
                                        <option value="diagnostico_pdt">1. Diagnóstico / PdT</option>
                                        <option value="inicio_procedimiento_critico">2. Inicio Procedimiento Crítico</option>
                                        <option value="cierre_alta_tecnica">3. Cierre / Alta Técnica</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Procedimiento Específico *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Biopulpectomía / Resina compuesta Clase II"
                                        value={formSol.procedimiento}
                                        onChange={(e) => setFormSol('procedimiento', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pieza Dental</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1.6, 2.1"
                                        value={formSol.pieza_dental}
                                        onChange={(e) => setFormSol('pieza_dental', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comentarios / Observaciones Clínicas</label>
                                <textarea
                                    rows="3"
                                    placeholder="Detalles del aislamiento absoluto, anestésico empleado, hallazgos..."
                                    value={formSol.comentarios_estudiante}
                                    onChange={(e) => setFormSol('comentarios_estudiante', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNuevaSolicitudModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procSol}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-all"
                                >
                                    {procSol ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EVALUACIÓN Y FIRMA ELECTRÓNICA DOCENTE */}
            {showResponderModal && solicitudSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md text-xs font-bold uppercase">
                                    Firma Electrónica Docente
                                </span>
                                <h3 className="font-bold text-lg text-slate-900 mt-1">Supervisión Clínica de Responsabilidad</h3>
                                <p className="text-xs text-slate-500">
                                    Alumno: {solicitudSeleccionada.estudiante?.name} | Hito: {solicitudSeleccionada.tipo_hito}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowResponderModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleResponderSolicitud} className="space-y-4 text-sm">
                            {/* Información del Hito Solicitado */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                                <div><strong className="text-slate-700">Procedimiento:</strong> {solicitudSeleccionada.procedimiento} ({solicitudSeleccionada.asignatura})</div>
                                <div><strong className="text-slate-700">Paciente:</strong> {solicitudSeleccionada.paciente?.nombres} {solicitudSeleccionada.paciente?.apellido_paterno} (IUP: {solicitudSeleccionada.paciente?.iup})</div>
                                {solicitudSeleccionada.comentarios_estudiante && (
                                    <div className="mt-2 text-slate-600 italic border-l-2 border-teal-500 pl-2">
                                        "{solicitudSeleccionada.comentarios_estudiante}"
                                    </div>
                                )}
                            </div>

                            {/* Decisión: Aprobar o Rechazar */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dictamen Clínico *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`flex items-center justify-center p-3 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                                        formResp.estado === 'aprobado'
                                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="aprobado"
                                            checked={formResp.estado === 'aprobado'}
                                            onChange={() => setFormResp('estado', 'aprobado')}
                                            className="hidden"
                                        />
                                        ✓ APROBAR Y FIRMAR
                                    </label>
                                    <label className={`flex items-center justify-center p-3 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                                        formResp.estado === 'rechazado'
                                            ? 'border-rose-500 bg-rose-50/50 text-rose-800'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="rechazado"
                                            checked={formResp.estado === 'rechazado'}
                                            onChange={() => setFormResp('estado', 'rechazado')}
                                            className="hidden"
                                        />
                                        ✕ OBSERVAR / RECHAZAR
                                    </label>
                                </div>
                            </div>

                            {/* Rúbrica de Evaluación de Habilidades */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Rúbrica de Habilidades y Competencias (1 al 5)
                                </h4>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="font-semibold text-slate-700">1. Bioseguridad y Ergonomía</label>
                                        <select
                                            value={formResp.rubrica_bioseguridad}
                                            onChange={(e) => setFormResp('rubrica_bioseguridad', parseInt(e.target.value))}
                                            className="w-full mt-1 border border-slate-200 rounded-lg p-1.5 bg-white"
                                        >
                                            <option value="5">5 - Excelente (Aislamiento impecable)</option>
                                            <option value="4">4 - Bueno (Corrección menor)</option>
                                            <option value="3">3 - Regular (Falta de esterilidad)</option>
                                            <option value="2">2 - Deficiente</option>
                                            <option value="1">1 - Inaceptable</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-slate-700">2. Destreza Operatoria</label>
                                        <select
                                            value={formResp.rubrica_destreza}
                                            onChange={(e) => setFormResp('rubrica_destreza', parseInt(e.target.value))}
                                            className="w-full mt-1 border border-slate-200 rounded-lg p-1.5 bg-white"
                                        >
                                            <option value="5">5 - Preciso y seguro</option>
                                            <option value="4">4 - Aceptable con guía</option>
                                            <option value="3">3 - Lento / Inseguro</option>
                                            <option value="2">2 - Daño anatómico potencial</option>
                                            <option value="1">1 - Crítico</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-slate-700">3. Criterio Diagnóstico</label>
                                        <select
                                            value={formResp.rubrica_criterio}
                                            onChange={(e) => setFormResp('rubrica_criterio', parseInt(e.target.value))}
                                            className="w-full mt-1 border border-slate-200 rounded-lg p-1.5 bg-white"
                                        >
                                            <option value="5">5 - Fundamentado y certero</option>
                                            <option value="4">4 - Adecuado</option>
                                            <option value="3">3 - Duda en farmacología/plan</option>
                                            <option value="2">2 - Erróneo</option>
                                            <option value="1">1 - Sin criterio</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-slate-700">4. Trato y Empatía Paciente</label>
                                        <select
                                            value={formResp.rubrica_trato_paciente}
                                            onChange={(e) => setFormResp('rubrica_trato_paciente', parseInt(e.target.value))}
                                            className="w-full mt-1 border border-slate-200 rounded-lg p-1.5 bg-white"
                                        >
                                            <option value="5">5 - Excelente contención</option>
                                            <option value="4">4 - Cordial</option>
                                            <option value="3">3 - Poco comunicativo</option>
                                            <option value="2">2 - Brusco</option>
                                            <option value="1">1 - Queja del paciente</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">Calificación Numérica (0 - 100):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formResp.nota_final}
                                        onChange={(e) => setFormResp('nota_final', parseInt(e.target.value) || 0)}
                                        className="w-24 border border-slate-200 rounded-lg p-1.5 text-center font-bold text-teal-700 bg-white"
                                    />
                                </div>
                            </div>

                            {/* Comentarios del Docente Obligatorios */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Retroalimentación Clínica y Justificación *
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Escriba comentarios pedagógicos, advertencias o felicitaciones..."
                                    value={formResp.comentarios_docente}
                                    onChange={(e) => setFormResp('comentarios_docente', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800">
                                <strong>Aviso Legal & Ético:</strong> Al presionar confirmar, se generará una firma criptográfica irrevocable vinculada a su cuenta docente ({auth.user?.name}), asumiendo la corresponsabilidad clínica del acto realizado.
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowResponderModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procResp}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-all"
                                >
                                    {procResp ? 'Firmando electrónicamente...' : 'Confirmar & Registrar Firma'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: LANZAR ALERTA TEMPRANA DE BAJO DESEMPEÑO */}
            {showAlertaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-bold uppercase">
                                    Alerta Preventiva Docente
                                </span>
                                <h3 className="font-bold text-lg text-slate-900 mt-1">Lanzar Alerta Temprana de Desempeño</h3>
                                <p className="text-xs text-slate-500">Notificación directa y permanente a la Coordinación Clínica</p>
                            </div>
                            <button
                                onClick={() => setShowAlertaModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCrearAlerta} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estudiante en Observación *</label>
                                <select
                                    value={formAlerta.estudiante_id}
                                    onChange={(e) => setFormAlerta('estudiante_id', e.target.value)}
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="">Seleccione estudiante...</option>
                                    {estudiantes.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.name} ({est.codigo_institucional ?? `EST-${est.id}`})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asignatura *</label>
                                    <input
                                        type="text"
                                        value={formAlerta.asignatura}
                                        onChange={(e) => setFormAlerta('asignatura', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría del Motivo *</label>
                                    <select
                                        value={formAlerta.motivo_categoria}
                                        onChange={(e) => setFormAlerta('motivo_categoria', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 font-bold text-orange-800"
                                    >
                                        <option value="bioseguridad">Problemas recurrentes de Bioseguridad</option>
                                        <option value="destreza_manual">Necesita mayor destreza manual</option>
                                        <option value="rendimiento_teorico">Bajo rendimiento teórico-práctico</option>
                                        <option value="manejo_paciente">Dificultad en manejo del paciente</option>
                                        <option value="otro">Otro factor pedagógico</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo Detallado y Evidencia *</label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Describa la situación clínica observada con precisión pedagógica..."
                                    value={formAlerta.motivo_detallado}
                                    onChange={(e) => setFormAlerta('motivo_detallado', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medidas Proactivas Sugeridas</label>
                                <textarea
                                    rows="2"
                                    placeholder="Ej: Tutoría de refuerzo, asignación a paciente de menor complejidad..."
                                    value={formAlerta.medidas_sugeridas}
                                    onChange={(e) => setFormAlerta('medidas_sugeridas', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAlertaModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procAlerta}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm transition-all"
                                >
                                    {procAlerta ? 'Emitiendo alerta...' : 'Emitir Alerta Temprana'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: VER FIRMA ELECTRÓNICA Y DETALLE CRIPTOGRÁFICO */}
            {showVerFirmaModal && firmaDetalle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Certificado de Firma Electrónica</h3>
                                <p className="text-xs text-slate-500">Validez legal y clínica bajo estándares Unifranz</p>
                            </div>
                            <button
                                onClick={() => setShowVerFirmaModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <span className="font-bold text-slate-500 uppercase">Docente Firmante:</span>
                                <p className="text-slate-900 font-bold text-sm">{firmaDetalle.firma_digital?.docente_nombre}</p>
                                <p className="text-slate-500">{firmaDetalle.firma_digital?.docente_email}</p>
                            </div>
                            <div>
                                <span className="font-bold text-slate-500 uppercase">Fecha y Hora de Firma:</span>
                                <p className="text-slate-800 font-mono">
                                    {new Date(firmaDetalle.firma_digital?.fecha_hora).toLocaleString('es-BO')}
                                </p>
                            </div>
                            <div>
                                <span className="font-bold text-slate-500 uppercase">Hash SHA-256 de Autenticidad:</span>
                                <p className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 break-all text-teal-800 select-all">
                                    {firmaDetalle.firma_digital?.hash_seguridad}
                                </p>
                            </div>
                            <div>
                                <span className="font-bold text-slate-500 uppercase">Comentarios Registrados:</span>
                                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                                    "{firmaDetalle.comentarios_docente}"
                                </p>
                            </div>
                            {firmaDetalle.evaluacion_rubrica && (
                                <div className="pt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-500 uppercase">Calificación de Rúbrica:</span>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>Bioseguridad: <strong>{firmaDetalle.evaluacion_rubrica.bioseguridad} / 5</strong></div>
                                        <div>Destreza: <strong>{firmaDetalle.evaluacion_rubrica.destreza} / 5</strong></div>
                                        <div>Criterio: <strong>{firmaDetalle.evaluacion_rubrica.criterio} / 5</strong></div>
                                        <div>Trato: <strong>{firmaDetalle.evaluacion_rubrica.trato_paciente} / 5</strong></div>
                                    </div>
                                    <div className="mt-2 text-right font-black text-sm text-teal-700">
                                        Nota Final: {firmaDetalle.evaluacion_rubrica.nota_final} / 100
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setShowVerFirmaModal(false)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs"
                            >
                                Cerrar Certificado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 5: RESOLVER ALERTA TEMPRANA (COORDINACIÓN) */}
            {showResolverAlertaModal && alertaAResolver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Resolver Alerta Temprana</h3>
                                <p className="text-xs text-slate-500">
                                    Estudiante: {alertaAResolver.estudiante?.name} ({alertaAResolver.asignatura})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowResolverAlertaModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleResolverAlerta} className="space-y-4 text-sm">
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                                <strong className="text-amber-900">Motivo:</strong> {alertaAResolver.motivo_detallado}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Plan de Acción y Resolución de Coordinación *
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Ej: Se coordinó con Docente Tutor 3 horas de laboratorio de simulación en endodoncia. Reevaluación en 15 días."
                                    value={formResAlerta.resolucion_coordinacion}
                                    onChange={(e) => setFormResAlerta('resolucion_coordinacion', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowResolverAlertaModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procResAlerta}
                                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-sm"
                                >
                                    {procResAlerta ? 'Guardando...' : 'Marcar como Resuelta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: CONFIGURAR CUPO POR ASIGNATURA */}
            {showNuevoRequisitoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Configuración Central de Cupo</h3>
                                <p className="text-xs text-slate-500">Requisito obligatorio para aprobación de materia</p>
                            </div>
                            <button
                                onClick={() => setShowNuevoRequisitoModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCrearCupo} className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asignatura *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Endodoncia I"
                                        value={formCupo.asignatura}
                                        onChange={(e) => setFormCupo('asignatura', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semestre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 7mo Semestre"
                                        value={formCupo.semestre}
                                        onChange={(e) => setFormCupo('semestre', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Procedimiento Clave *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Tratamiento de conducto sector anterior"
                                        value={formCupo.procedimiento_clave}
                                        onChange={(e) => setFormCupo('procedimiento_clave', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cupos Mínimos *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formCupo.cupos_minimos}
                                        onChange={(e) => setFormCupo('cupos_minimos', parseInt(e.target.value) || 1)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 font-bold text-teal-700 text-center"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción / Criterios de Aprobación</label>
                                <textarea
                                    rows="2"
                                    placeholder="Detalles técnicos exigidos para que el hito sea computable..."
                                    value={formCupo.descripcion}
                                    onChange={(e) => setFormCupo('descripcion', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNuevoRequisitoModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procCupo}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                                >
                                    {procCupo ? 'Guardando...' : 'Guardar Requisito'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 7: NUEVA PROGRAMACIÓN DOCENTE */}
            {showNuevaProgramacionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Programación de Supervisión Horaria</h3>
                                <p className="text-xs text-slate-500">Asignar turnos y gabinetes al docente</p>
                            </div>
                            <button
                                onClick={() => setShowNuevaProgramacionModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCrearProg} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Docente Supervisor *</label>
                                <select
                                    value={formProg.docente_id}
                                    onChange={(e) => setFormProg('docente_id', e.target.value)}
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                >
                                    <option value="">Seleccione Docente...</option>
                                    {docentes.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asignatura *</label>
                                    <input
                                        type="text"
                                        value={formProg.asignatura}
                                        onChange={(e) => setFormProg('asignatura', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Día de la Semana *</label>
                                    <select
                                        value={formProg.dia_semana}
                                        onChange={(e) => setFormProg('dia_semana', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    >
                                        <option value="Lunes">Lunes</option>
                                        <option value="Martes">Martes</option>
                                        <option value="Miércoles">Miércoles</option>
                                        <option value="Jueves">Jueves</option>
                                        <option value="Viernes">Viernes</option>
                                        <option value="Sábado">Sábado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Turno / Horario *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Mañana (08:00 - 12:00)"
                                        value={formProg.turno}
                                        onChange={(e) => setFormProg('turno', e.target.value)}
                                        required
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gabinetes Asignados</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Gabinetes 1 al 6"
                                        value={formProg.gabinetes_asignados}
                                        onChange={(e) => setFormProg('gabinetes_asignados', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNuevaProgramacionModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procProg}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                                >
                                    {procProg ? 'Guardando...' : 'Guardar Programación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
