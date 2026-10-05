import React, { useState, useMemo, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function TabModulo3PlanesYTratamiento({
    paciente,
    aranceles = [],
    docentes = [],
    estudiantes = [],
    readOnly = false,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleSlug = auth?.role || user?.rol?.slug || 'estudiante';
    const isDocenteOrAdmin = ['docente', 'admin', 'director_clinica'].includes(roleSlug);
    const isEstudiante = roleSlug === 'estudiante';

    // Planes del paciente
    const planes = paciente.planes_tratamiento || paciente.planesTratamiento || [];
    const activePlan = planes.length > 0 ? planes[0] : null;

    // Remisiones y Transferencias
    const remisiones = paciente.remisiones_intercatedra || paciente.remisionesIntercatedra || [];
    const transferencias = paciente.transferencias || [];

    // Remisión activa para trazabilidad inmediata
    const remisionActiva = useMemo(() => {
        return remisiones.find(r => r.estado === 'activa' || r.estado === 'pendiente');
    }, [remisiones]);

    // Vista de agrupación: 'fases' o 'especialidad'
    const [agrupacion, setAgrupacion] = useState('fases'); // 'fases' | 'especialidad'

    // Modales
    const [modalCrearPlanOpen, setModalCrearPlanOpen] = useState(false);
    const [modalValidarDocenteOpen, setModalValidarDocenteOpen] = useState(false);
    const [modalAceptarPacienteOpen, setModalAceptarPacienteOpen] = useState(false);
    const [modalActualizarProcOpen, setModalActualizarProcOpen] = useState(false);
    const [modalRemisionOpen, setModalRemisionOpen] = useState(false);
    const [modalResolverRemisionOpen, setModalResolverRemisionOpen] = useState(false);
    const [modalTransferirOpen, setModalTransferirOpen] = useState(false);
    const [modalAltaClinicaOpen, setModalAltaClinicaOpen] = useState(false);
    const [modalPresupuestoOpen, setModalPresupuestoOpen] = useState(false);
    const [modalReportesOpen, setModalReportesOpen] = useState(false);

    // Estados para formularios
    const [faseSeleccionada, setFaseSeleccionada] = useState(null);
    const [remisionSeleccionada, setRemisionSeleccionada] = useState(null);

    // Formulario de creación de plan
    const [formPlan, setFormPlan] = useState({
        titulo: 'Plan de Tratamiento Integral Odontológico',
        descripcion: 'Formulación y secuenciación según diagnóstico clínico integral.',
        docente_supervisor_id: docentes.length > 0 ? String(docentes[0].id) : '',
        procedimientos: [
            {
                numero_fase: 1,
                fase_categoria: 'Fase I: Control de Infección',
                nombre_fase: 'Control de Infección',
                especialidad: 'Periodoncia',
                procedimiento: 'Profilaxis dental y tartrectomía por arcada',
                pieza_fdi: '',
                diagnostico_codigo: 'K05.1',
                arancel_codigo: 'PER-001',
                costo_arancel: 100.00,
                prioridad: 'Urgente',
                tiempo_estimado_minutos: 45,
            }
        ]
    });

    // Formulario de validación docente
    const [formValidacionDocente, setFormValidacionDocente] = useState({
        aprobado: true,
        observaciones: 'Plan de tratamiento verificado y aprobado según estándares académicos de la Clínica Odontológica UNIFRANZ.',
    });

    // Formulario de aceptación de paciente
    const [formAceptacion, setFormAceptacion] = useState({
        firma_digital: 'Aceptación formal digital presencial registrada',
        observaciones: 'El paciente ha sido informado de los procedimientos, fases y presupuesto total estimado.',
    });

    // Formulario de actualización de procedimiento / sesión
    const [formProcedimiento, setFormProcedimiento] = useState({
        estado: 'en_ejecucion',
        tiempo_empleado_minutos: 45,
        observaciones_evolucion: '',
        calificacion_docente: '',
        observaciones_docente: '',
        materiales: [
            { material: '', cantidad: 1, unidad: 'unidad' }
        ]
    });

    // Formulario de Remisión Inter-Cátedra
    const [formRemision, setFormRemision] = useState({
        catedra_origen: 'Operatoria Dental',
        catedra_receptora: 'Endodoncia',
        pieza_dental: '',
        procedimiento_solicitado: '',
        motivo_remision: '',
        docente_autoriza_id: docentes.length > 0 ? String(docentes[0].id) : '',
    });

    // Formulario de Transferencia Estudiante a Estudiante
    const [formTransferencia, setFormTransferencia] = useState({
        estudiante_nuevo_id: '',
        motivo_estandarizado: 'Fin de semestre/rotación del estudiante anterior',
        justificacion_detallada: '',
    });

    // Formulario de Alta Clínica Definitiva
    const [formAltaClinica, setFormAltaClinica] = useState({
        recomendaciones_finales: 'Mantener técnica de cepillado Bass modificada, uso de hilo dental interdental diario y enjuague con clorhexidina 0.12% según indicación.',
        proximo_control_meses: 6,
        observaciones: 'Tratamiento rehabilitador integral completado con éxito y alta clínica aprobada.',
    });

    // Datos de Reportes de Producción
    const [reportesData, setReportesData] = useState(null);
    const [cargandoReportes, setCargandoReportes] = useState(false);

    // Helpers para agregar/remover ítems en el plan
    const handleAgregarProcedimiento = () => {
        setFormPlan(prev => ({
            ...prev,
            procedimientos: [
                ...prev.procedimientos,
                {
                    numero_fase: 2,
                    fase_categoria: 'Fase II: Restauradora',
                    nombre_fase: 'Restauradora',
                    especialidad: 'Operatoria Dental',
                    procedimiento: '',
                    pieza_fdi: '',
                    diagnostico_codigo: 'K02.1',
                    arancel_codigo: '',
                    costo_arancel: 0,
                    prioridad: 'Prioritario',
                    tiempo_estimado_minutos: 45,
                }
            ]
        }));
    };

    const handleEliminarProcedimiento = (idx) => {
        if (formPlan.procedimientos.length <= 1) return;
        setFormPlan(prev => ({
            ...prev,
            procedimientos: prev.procedimientos.filter((_, i) => i !== idx)
        }));
    };

    const handleCambiarArancel = (idx, arancelCodigo) => {
        const itemArancel = aranceles.find(a => a.codigo === arancelCodigo);
        setFormPlan(prev => {
            const copia = [...prev.procedimientos];
            if (itemArancel) {
                copia[idx].arancel_codigo = itemArancel.codigo;
                copia[idx].procedimiento = itemArancel.nombre;
                copia[idx].costo_arancel = itemArancel.precio_base;
                copia[idx].especialidad = itemArancel.categoria;
                copia[idx].tiempo_estimado_minutos = itemArancel.tiempo_estimado_minutos || 45;
            } else {
                copia[idx].arancel_codigo = '';
            }
            return { ...prev, procedimientos: copia };
        });
    };

    const costoTotalCalculado = useMemo(() => {
        return formPlan.procedimientos.reduce((acc, curr) => acc + (parseFloat(curr.costo_arancel) || 0), 0);
    }, [formPlan.procedimientos]);

    // Enviar Creación de Plan
    const handleGuardarPlan = (e) => {
        e.preventDefault();
        router.post(route('planes-tratamiento.store', paciente.id), formPlan, {
            preserveScroll: true,
            onSuccess: () => {
                setModalCrearPlanOpen(false);
            }
        });
    };

    // Validar Docente
    const handleEnviarValidacionDocente = (e) => {
        e.preventDefault();
        if (!activePlan) return;
        router.post(route('planes-tratamiento.validar-docente', activePlan.id), formValidacionDocente, {
            preserveScroll: true,
            onSuccess: () => {
                setModalValidarDocenteOpen(false);
            }
        });
    };

    // Aceptar Paciente
    const handleEnviarAceptacionPaciente = (e) => {
        e.preventDefault();
        if (!activePlan) return;
        router.post(route('planes-tratamiento.aceptar-paciente', activePlan.id), formAceptacion, {
            preserveScroll: true,
            onSuccess: () => {
                setModalAceptarPacienteOpen(false);
            }
        });
    };

    // Abrir modal de actualizar procedimiento
    const handleAbrirActualizarProc = (fase) => {
        setFaseSeleccionada(fase);
        setFormProcedimiento({
            estado: fase.estado || 'en_ejecucion',
            tiempo_empleado_minutos: fase.tiempo_empleado_minutos || fase.tiempo_estimado_minutos || 45,
            observaciones_evolucion: '',
            calificacion_docente: '',
            observaciones_docente: '',
            materiales: Array.isArray(fase.materiales_consumidos) && fase.materiales_consumidos.length > 0
                ? fase.materiales_consumidos
                : [{ material: '', cantidad: 1, unidad: 'unidad' }]
        });
        setModalActualizarProcOpen(true);
    };

    // Enviar actualización de procedimiento
    const handleEnviarActualizarProc = (e) => {
        e.preventDefault();
        if (!activePlan || !faseSeleccionada) return;

        const payload = {
            estado: formProcedimiento.estado,
            tiempo_empleado_minutos: formProcedimiento.tiempo_empleado_minutos,
            observaciones_evolucion: formProcedimiento.observaciones_evolucion,
            calificacion_docente: formProcedimiento.calificacion_docente ? parseInt(formProcedimiento.calificacion_docente) : null,
            observaciones_docente: formProcedimiento.observaciones_docente,
            materiales_consumidos: formProcedimiento.materiales.filter(m => m.material.trim() !== '')
        };

        router.post(route('planes-tratamiento.fases.actualizar', [activePlan.id, faseSeleccionada.id]), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setModalActualizarProcOpen(false);
            }
        });
    };

    // Enviar Remisión Inter-Cátedra
    const handleEnviarRemision = (e) => {
        e.preventDefault();
        router.post(route('remisiones.store', paciente.id), formRemision, {
            preserveScroll: true,
            onSuccess: () => {
                setModalRemisionOpen(false);
            }
        });
    };

    // Resolver Remisión
    const handleEnviarResolverRemision = (e) => {
        e.preventDefault();
        if (!remisionSeleccionada) return;
        router.post(route('remisiones.resolver', remisionSeleccionada.id), {
            estado: 'completada',
            observaciones_resolucion: 'Procedimiento de interconsulta inter-cátedra finalizado y verificado por el docente.',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setModalResolverRemisionOpen(false);
            }
        });
    };

    // Enviar Transferencia Formal Estudiante a Estudiante
    const handleEnviarTransferencia = (e) => {
        e.preventDefault();
        router.post(route('pacientes.transferir-formal', paciente.id), formTransferencia, {
            preserveScroll: true,
            onSuccess: () => {
                setModalTransferirOpen(false);
            }
        });
    };

    // Enviar Alta Clínica Definitiva
    const handleEnviarAltaClinica = (e) => {
        e.preventDefault();
        if (!activePlan) return;
        router.post(route('planes-tratamiento.alta-clinica', activePlan.id), formAltaClinica, {
            preserveScroll: true,
            onSuccess: () => {
                setModalAltaClinicaOpen(false);
            }
        });
    };

    // Cargar Reportes de Producción
    const handleAbrirReportes = async () => {
        setModalReportesOpen(true);
        setCargandoReportes(true);
        try {
            const res = await fetch(route('tratamientos.reportes-produccion'));
            const data = await res.json();
            setReportesData(data);
        } catch (error) {
            console.error('Error al cargar reportes de producción:', error);
        } finally {
            setCargandoReportes(false);
        }
    };

    // Agrupación de fases del plan activo
    const fasesAgrupadas = useMemo(() => {
        if (!activePlan || !activePlan.fases) return {};
        const grupos = {};

        activePlan.fases.forEach(f => {
            const key = agrupacion === 'fases'
                ? (f.fase_categoria || `Fase ${f.numero_fase || 1}`)
                : (f.especialidad || 'General');

            if (!grupos[key]) {
                grupos[key] = [];
            }
            grupos[key].push(f);
        });

        return grupos;
    }, [activePlan, agrupacion]);

    return (
        <div className="space-y-6">
            {/* --- BANNER DE TRAZABILIDAD: REMISIÓN INTER-CÁTEDRA ACTIVA --- */}
            {remisionActiva && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                                    Trazabilidad: Remisión Inter-Cátedra Activa
                                </span>
                                <span className="text-xs text-amber-700 font-medium">
                                    Pieza FDI: <strong>{remisionActiva.pieza_dental || 'General'}</strong>
                                </span>
                            </div>
                            <p className="text-sm text-amber-900 font-semibold mt-1">
                                Derivado de: <span className="underline">{remisionActiva.catedra_origen}</span> → Hacia: <span className="underline font-bold text-teal-800">{remisionActiva.catedra_receptora}</span>
                            </p>
                            <p className="text-xs text-amber-800 mt-0.5">
                                Procedimiento requerido: <strong>{remisionActiva.procedimiento_solicitado}</strong>. Motivo: {remisionActiva.motivo_remision}
                            </p>
                        </div>
                    </div>
                    {isDocenteOrAdmin && (
                        <button
                            type="button"
                            onClick={() => {
                                setRemisionSeleccionada(remisionActiva);
                                setModalResolverRemisionOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-sm transition shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Concluir Remisión</span>
                        </button>
                    )}
                </div>
            )}

            {/* --- CABECERA INSTITUCIONAL MÓDULO 3 --- */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-black rounded uppercase tracking-wider">
                                Módulo 3 UNIFRANZ
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                Plan de Tratamiento (PdT) & Procedimientos Clínicos
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mt-1 flex items-center gap-2">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span>Gestión, Ejecución y Seguimiento de Tratamientos</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Estructuración jerárquica por fases/especialidades, vinculación estricta con aranceles clínicos, validación docente obligatoria y control de altas.
                        </p>
                    </div>

                    {/* Acciones principales de cabecera */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAbrirReportes}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
                            title="Ver indicadores y productividad clínica"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Reportes Producción</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setModalRemisionOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                        >
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Remisión Inter-Cátedra</span>
                        </button>

                        {isDocenteOrAdmin && (
                            <button
                                type="button"
                                onClick={() => setModalTransferirOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 transition"
                            >
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span>Transferencia Estudiante</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setModalCrearPlanOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>+ Formular Plan (PdT)</span>
                        </button>
                    </div>
                </div>

                {/* --- DETALLES DEL PLAN ACTIVO --- */}
                {activePlan ? (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Plan de Tratamiento</span>
                                <h3 className="text-sm font-bold text-slate-800 truncate" title={activePlan.titulo}>
                                    {activePlan.titulo}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {activePlan.descripcion}
                                </p>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Presupuesto Arancelario</span>
                                <div className="text-lg font-black text-teal-700">
                                    Bs. {parseFloat(activePlan.costo_total_estimado || 0).toFixed(2)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalPresupuestoOpen(true)}
                                    className="text-[11px] text-teal-600 hover:text-teal-800 underline font-medium mt-0.5 flex items-center gap-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span>Imprimir Presupuesto Formal</span>
                                </button>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Progreso Clínico Global</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${activePlan.porcentaje_avance || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-black text-slate-700">
                                        {activePlan.porcentaje_avance || 0}%
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">
                                    Estado: <strong className="capitalize">{activePlan.estado.replace('_', ' ')}</strong>
                                </span>
                            </div>

                            <div className="flex flex-col justify-center gap-2">
                                {/* Estado de Validación Docente (Doble Check) */}
                                {activePlan.requiere_validacion_docente && activePlan.estado !== 'aprobado_docente' && activePlan.estado !== 'aprobado' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded border border-amber-200">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span>Validación Docente Pendiente</span>
                                        </span>
                                        {isDocenteOrAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => setModalValidarDocenteOpen(true)}
                                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-sm transition"
                                            >
                                                Evaluar
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Doble Check Docente Aprobado</span>
                                    </div>
                                )}

                                {/* Estado de Aceptación del Paciente */}
                                {activePlan.aceptacion_paciente?.firmado || activePlan.aceptacion_paciente?.aceptado ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Aceptación Paciente Formal Firmada</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setModalAceptarPacienteOpen(true)}
                                        className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        <span>Registrar Firma Aceptación Paciente</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Alta Clínica Definitiva */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-600">Agrupar procedimientos por:</span>
                                <div className="inline-flex rounded-md shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setAgrupacion('fases')}
                                        className={`px-3 py-1 text-xs font-bold rounded-l-md border ${
                                            agrupacion === 'fases'
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        Fases Clínicas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAgrupacion('especialidad')}
                                        className={`px-3 py-1 text-xs font-bold rounded-r-md border-t border-b border-r ${
                                            agrupacion === 'especialidad'
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        Especialidad
                                    </button>
                                </div>
                            </div>

                            {activePlan.estado === 'completado' || activePlan.porcentaje_avance === 100 || isDocenteOrAdmin ? (
                                <button
                                    type="button"
                                    onClick={() => setModalAltaClinicaOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Emitir Alta Clínica Definitiva</span>
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-sm font-bold text-slate-700">Sin Plan de Tratamiento Registrado</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                            El paciente aún no cuenta con un Plan de Tratamiento formal estructurado. Presione el botón superior para formular el plan jerárquico.
                        </p>
                    </div>
                )}
            </div>

            {/* --- LISTADO JERÁRQUICO DE PROCEDIMIENTOS DEL PLAN ACTIVO --- */}
            {activePlan && (
                <div className="space-y-4">
                    {Object.keys(fasesAgrupadas).length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                            No hay procedimientos cargados en este plan.
                        </div>
                    ) : (
                        Object.entries(fasesAgrupadas).map(([grupoNombre, procs]) => (
                            <div key={grupoNombre} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            {grupoNombre} ({procs.length} procedimiento{procs.length > 1 ? 's' : ''})
                                        </h4>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">
                                        Subtotal: Bs. {procs.reduce((acc, p) => acc + (parseFloat(p.costo_arancel) || 0), 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {procs.map((proc, pIdx) => {
                                        const isCompletado = proc.estado === 'completado' || proc.estado === 'Completado';
                                        const isEnEjecucion = proc.estado === 'en_ejecucion' || proc.estado === 'En Curso';

                                        return (
                                            <div key={proc.id || pIdx} className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {/* Badge de Pieza FDI */}
                                                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex flex-col items-center justify-center shrink-0">
                                                        <span className="text-[9px] font-black text-teal-600 uppercase">FDI</span>
                                                        <span className="text-sm font-black text-teal-800 leading-none">
                                                            {proc.pieza_fdi || proc.pieza_dental || '—'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h5 className="text-sm font-bold text-slate-800">
                                                                {proc.procedimiento}
                                                            </h5>
                                                            {proc.arancel_codigo && (
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                                                                    Cód: {proc.arancel_codigo}
                                                                </span>
                                                            )}
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                                                proc.prioridad === 'Urgente'
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : proc.prioridad === 'Prioritario'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {proc.prioridad}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                            <span>Especialidad: <strong>{proc.especialidad}</strong></span>
                                                            <span>Arancel: <strong>Bs. {parseFloat(proc.costo_arancel || 0).toFixed(2)}</strong></span>
                                                            <span>Tiempo est: <strong>{proc.tiempo_estimado_minutos || 45} min</strong></span>
                                                            {proc.tiempo_empleado_minutos && (
                                                                <span className="text-teal-700 font-semibold">
                                                                    Tiempo real: {proc.tiempo_empleado_minutos} min
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Materiales consumidos */}
                                                        {Array.isArray(proc.materiales_consumidos) && proc.materiales_consumidos.length > 0 && (
                                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Materiales:</span>
                                                                {proc.materiales_consumidos.map((mat, mIdx) => (
                                                                    <span key={mIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded border border-slate-200">
                                                                        {mat.material} ({mat.cantidad} {mat.unidad})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {/* Badge de Estado */}
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        isCompletado
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : isEnEjecucion
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {proc.estado}
                                                    </span>

                                                    {/* Botón de acción clínica */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAbrirActualizarProc(proc)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Registrar Sesión / Cerrar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- MODAL: FORMULAR PLAN DE TRATAMIENTO (JERÁRQUICO POR FASES) --- */}
            {modalCrearPlanOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Formular Plan de Tratamiento Jerárquico</h3>
                                    <p className="text-xs text-slate-500">Módulo 3: Creación estructurada por Fases o Especialidades con Arancel Clínico</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalCrearPlanOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGuardarPlan} className="space-y-4 overflow-y-auto flex-1 pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Título del Plan *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formPlan.titulo}
                                        onChange={e => setFormPlan({ ...formPlan, titulo: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Docente Supervisor Responsable *</label>
                                    <select
                                        required
                                        value={formPlan.docente_supervisor_id}
                                        onChange={e => setFormPlan({ ...formPlan, docente_supervisor_id: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="">Seleccione Docente...</option>
                                        {docentes.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Objetivos Clínicos</label>
                                <textarea
                                    rows="2"
                                    value={formPlan.descripcion}
                                    onChange={e => setFormPlan({ ...formPlan, descripcion: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    placeholder="Detalle de los objetivos del plan, secuencia y consideraciones sistémicas..."
                                />
                            </div>

                            {/* Constructor de Procedimientos por Fases */}
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Procedimientos Vinculados al Catálogo de Aranceles ({formPlan.procedimientos.length})
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAgregarProcedimiento}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded hover:bg-teal-100 transition"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Agregar Procedimiento</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formPlan.procedimientos.map((p, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                                            {formPlan.procedimientos.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarProcedimiento(idx)}
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                                                    title="Eliminar procedimiento"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Fase Clínica *</label>
                                                    <select
                                                        value={p.fase_categoria}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const num = val.startsWith('Fase I') ? 1 : (val.startsWith('Fase II') ? 2 : 3);
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].fase_categoria = val;
                                                                copia[idx].numero_fase = num;
                                                                copia[idx].nombre_fase = val.replace(/^Fase [I|V]+:\s*/, '');
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    >
                                                        <option value="Fase I: Control de Infección">Fase I: Control de Infección</option>
                                                        <option value="Fase II: Restauradora">Fase II: Restauradora</option>
                                                        <option value="Fase III: Mantenimiento y Rehabilitación">Fase III: Mantenimiento y Rehab</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Vincular Arancel UNIFRANZ</label>
                                                    <select
                                                        value={p.arancel_codigo || ''}
                                                        onChange={e => handleCambiarArancel(idx, e.target.value)}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    >
                                                        <option value="">Seleccione Arancel...</option>
                                                        {aranceles.map(a => (
                                                            <option key={a.codigo} value={a.codigo}>
                                                                [{a.codigo}] {a.nombre.slice(0, 35)}... (Bs. {a.precio_base})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Pieza FDI</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Ej: 16, 21, 36"
                                                        value={p.pieza_fdi || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].pieza_fdi = val;
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Prioridad</label>
                                                    <select
                                                        value={p.prioridad}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].prioridad = val;
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    >
                                                        <option value="Urgente">Urgente</option>
                                                        <option value="Prioritario">Prioritario</option>
                                                        <option value="Electivo">Electivo</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nombre Procedimiento *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={p.procedimiento}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].procedimiento = val;
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        placeholder="Ej: Obturación con resina compuesta simple en pieza 16"
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Especialidad</label>
                                                    <select
                                                        value={p.especialidad}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].especialidad = val;
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    >
                                                        <option value="Operatoria Dental">Operatoria Dental</option>
                                                        <option value="Periodoncia">Periodoncia</option>
                                                        <option value="Endodoncia">Endodoncia</option>
                                                        <option value="Cirugía Bucal">Cirugía Bucal</option>
                                                        <option value="Prótesis y Rehabilitación">Prótesis y Rehabilitación</option>
                                                        <option value="Odontopediatría">Odontopediatría</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Arancel (Bs.) *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        value={p.costo_arancel}
                                                        onChange={e => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setFormPlan(prev => {
                                                                const copia = [...prev.procedimientos];
                                                                copia[idx].costo_arancel = val;
                                                                return { ...prev, procedimientos: copia };
                                                            });
                                                        }}
                                                        className="w-full text-xs rounded border-slate-300 py-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resumen del Presupuesto */}
                            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-xs text-teal-800 font-bold">
                                    Presupuesto Total Estimado ({formPlan.procedimientos.length} procedimientos):
                                </span>
                                <span className="text-base font-black text-teal-900">
                                    Bs. {costoTotalCalculado.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalCrearPlanOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
                                >
                                    Guardar Plan y Solicitar Validación Docente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: DOBLE CHECK VALIDACIÓN DOCENTE OBLIGATORIA --- */}
            {modalValidarDocenteOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Doble Check: Validación Docente</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Autorización académica obligatoria para inicio clínico</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarValidacionDocente} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Resolución Académica *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-bold ${
                                        formValidacionDocente.aprobado
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                            : 'border-slate-200 text-slate-600'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="aprobado"
                                            checked={formValidacionDocente.aprobado}
                                            onChange={() => setFormValidacionDocente({ ...formValidacionDocente, aprobado: true })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Aprobar y Autorizar Inicio</span>
                                    </label>

                                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-bold ${
                                        !formValidacionDocente.aprobado
                                            ? 'border-rose-500 bg-rose-50 text-rose-800'
                                            : 'border-slate-200 text-slate-600'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="aprobado"
                                            checked={!formValidacionDocente.aprobado}
                                            onChange={() => setFormValidacionDocente({ ...formValidacionDocente, aprobado: false })}
                                            className="text-rose-600 focus:ring-rose-500"
                                        />
                                        <span>Observar / Rechazar</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones / Dictamen Académico</label>
                                <textarea
                                    rows="3"
                                    value={formValidacionDocente.observaciones}
                                    onChange={e => setFormValidacionDocente({ ...formValidacionDocente, observaciones: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalValidarDocenteOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition"
                                >
                                    Confirmar Dictamen Docente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: REGISTRO DE ACEPTACIÓN FORMAL DEL PACIENTE --- */}
            {modalAceptarPacienteOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Aceptación Formal del Paciente</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Consentimiento de presupuesto y plan</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarAceptacionPaciente} className="space-y-4">
                            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200 text-xs text-teal-800">
                                <strong>Paciente:</strong> {paciente.nombres} {paciente.apellido_paterno} | CI: {paciente.ci} {paciente.ci_expedido || ''}
                                <br />
                                <strong>Presupuesto Aceptado:</strong> Bs. {parseFloat(activePlan?.costo_total_estimado || 0).toFixed(2)}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Declaración de Firma o Escaneo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formAceptacion.firma_digital}
                                    onChange={e => setFormAceptacion({ ...formAceptacion, firma_digital: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Notas / Observaciones del Paciente</label>
                                <textarea
                                    rows="2"
                                    value={formAceptacion.observaciones}
                                    onChange={e => setFormAceptacion({ ...formAceptacion, observaciones: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAceptarPacienteOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
                                >
                                    Registrar Aceptación Formal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: REGISTRAR SESIÓN / ACTUALIZAR PROCEDIMIENTO --- */}
            {modalActualizarProcOpen && faseSeleccionada && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Registrar Sesión & Recursos</h3>
                                    <p className="text-xs text-slate-500">Módulo 3: Evolución, tiempos y consumo de materiales</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalActualizarProcOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEnviarActualizarProc} className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                                <strong>Procedimiento:</strong> {faseSeleccionada.procedimiento} (Pieza {faseSeleccionada.pieza_fdi || '—'})
                                <br />
                                <strong>Especialidad:</strong> {faseSeleccionada.especialidad} | <strong>Arancel:</strong> Bs. {faseSeleccionada.costo_arancel}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado del Procedimiento *</label>
                                    <select
                                        value={formProcedimiento.estado}
                                        onChange={e => setFormProcedimiento({ ...formProcedimiento, estado: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_ejecucion">En Curso / Ejecución</option>
                                        <option value="completado">Completado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo Empleado (minutos) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        value={formProcedimiento.tiempo_empleado_minutos}
                                        onChange={e => setFormProcedimiento({ ...formProcedimiento, tiempo_empleado_minutos: parseInt(e.target.value) || 0 })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Consumo de Materiales (Vinculación Inventario) */}
                            <div className="space-y-2 border-t border-slate-100 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">Consumo de Materiales Clínicos (Módulo 8)</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormProcedimiento({
                                            ...formProcedimiento,
                                            materiales: [...formProcedimiento.materiales, { material: '', cantidad: 1, unidad: 'unidad' }]
                                        })}
                                        className="text-[11px] text-teal-600 font-bold hover:underline"
                                    >
                                        + Agregar Material
                                    </button>
                                </div>

                                {formProcedimiento.materiales.map((m, mIdx) => (
                                    <div key={mIdx} className="grid grid-cols-12 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Material (ej: Resina A2, Conos de gutapercha)"
                                            value={m.material}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormProcedimiento(prev => {
                                                    const copia = [...prev.materiales];
                                                    copia[mIdx].material = val;
                                                    return { ...prev, materiales: copia };
                                                });
                                            }}
                                            className="col-span-6 text-xs rounded border-slate-300 py-1"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cant."
                                            value={m.cantidad}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 1;
                                                setFormProcedimiento(prev => {
                                                    const copia = [...prev.materiales];
                                                    copia[mIdx].cantidad = val;
                                                    return { ...prev, materiales: copia };
                                                });
                                            }}
                                            className="col-span-3 text-xs rounded border-slate-300 py-1"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unidad"
                                            value={m.unidad}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormProcedimiento(prev => {
                                                    const copia = [...prev.materiales];
                                                    copia[mIdx].unidad = val;
                                                    return { ...prev, materiales: copia };
                                                });
                                            }}
                                            className="col-span-3 text-xs rounded border-slate-300 py-1"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Notas de Evolución Clínica de la Sesión</label>
                                <textarea
                                    rows="2"
                                    value={formProcedimiento.observaciones_evolucion}
                                    onChange={e => setFormProcedimiento({ ...formProcedimiento, observaciones_evolucion: e.target.value })}
                                    placeholder="Descripción de maniobras clínicas, anestesia empleada y respuesta tisular..."
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            {/* Evaluación Docente Final (si el usuario es docente) */}
                            {isDocenteOrAdmin && (
                                <div className="border-t border-slate-100 pt-2 grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nota Docente (1-100)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formProcedimiento.calificacion_docente}
                                            onChange={e => setFormProcedimiento({ ...formProcedimiento, calificacion_docente: e.target.value })}
                                            className="w-full text-xs rounded border-slate-300 py-1"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Feedback Docente</label>
                                        <input
                                            type="text"
                                            value={formProcedimiento.observaciones_docente}
                                            onChange={e => setFormProcedimiento({ ...formProcedimiento, observaciones_docente: e.target.value })}
                                            placeholder="Criterio de evaluación..."
                                            className="w-full text-xs rounded border-slate-300 py-1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalActualizarProcOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition"
                                >
                                    Guardar y Actualizar % de Avance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: REMISIÓN INTER-CÁTEDRA (FORMULARIO DIGITAL) --- */}
            {modalRemisionOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Formulario Digital de Remisión Inter-Cátedra</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Derivación clínica y trazabilidad en UNIFRANZ</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarRemision} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Cátedra Origen *</label>
                                    <select
                                        value={formRemision.catedra_origen}
                                        onChange={e => setFormRemision({ ...formRemision, catedra_origen: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="Operatoria Dental">Operatoria Dental</option>
                                        <option value="Periodoncia">Periodoncia</option>
                                        <option value="Endodoncia">Endodoncia</option>
                                        <option value="Cirugía Bucal">Cirugía Bucal</option>
                                        <option value="Prótesis y Rehabilitación">Prótesis y Rehabilitación</option>
                                        <option value="Odontopediatría">Odontopediatría</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Cátedra Receptora *</label>
                                    <select
                                        value={formRemision.catedra_receptora}
                                        onChange={e => setFormRemision({ ...formRemision, catedra_receptora: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="Endodoncia">Endodoncia</option>
                                        <option value="Cirugía Bucal">Cirugía Bucal</option>
                                        <option value="Periodoncia">Periodoncia</option>
                                        <option value="Operatoria Dental">Operatoria Dental</option>
                                        <option value="Prótesis y Rehabilitación">Prótesis y Rehabilitación</option>
                                        <option value="Odontopediatría">Odontopediatría</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Pieza Dental (FDI)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 21, 36, 48"
                                        value={formRemision.pieza_dental}
                                        onChange={e => setFormRemision({ ...formRemision, pieza_dental: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Docente que Autoriza</label>
                                    <select
                                        value={formRemision.docente_autoriza_id}
                                        onChange={e => setFormRemision({ ...formRemision, docente_autoriza_id: e.target.value })}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="">Seleccione...</option>
                                        {docentes.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Procedimiento Solicitado *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Biopulpectomía total unirradicular previa a rehabilitación protésica"
                                    value={formRemision.procedimiento_solicitado}
                                    onChange={e => setFormRemision({ ...formRemision, procedimiento_solicitado: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Clínico de la Remisión *</label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Explique la necesidad formativa o complejidad que fundamenta la derivación temporal..."
                                    value={formRemision.motivo_remision}
                                    onChange={e => setFormRemision({ ...formRemision, motivo_remision: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalRemisionOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                                >
                                    Emitir Remisión y Activar Trazabilidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: CONCLUIR / RESOLVER REMISIÓN INTER-CÁTEDRA --- */}
            {modalResolverRemisionOpen && remisionSeleccionada && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Concluir Remisión Inter-Cátedra</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Devolución a la cátedra de origen</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarResolverRemision} className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                                <strong>De:</strong> {remisionSeleccionada.catedra_origen} → <strong>A:</strong> {remisionSeleccionada.catedra_receptora}
                                <br />
                                <strong>Pieza:</strong> {remisionSeleccionada.pieza_dental} | <strong>Procedimiento:</strong> {remisionSeleccionada.procedimiento_solicitado}
                            </div>

                            <p className="text-xs text-slate-600">
                                Al marcar esta remisión como concluida, se actualizará el historial del paciente indicando que la interconsulta ha sido finalizada y el paciente puede continuar su tratamiento en la cátedra original.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalResolverRemisionOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                                >
                                    Concluir y Archivar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: TRANSFERENCIA FORMAL ESTUDIANTE A ESTUDIANTE --- */}
            {modalTransferirOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Transferencia Formal de Paciente</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Reasignación de estudiante con motivos institucionales obligatorios</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarTransferencia} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nuevo Estudiante Responsable *</label>
                                <select
                                    required
                                    value={formTransferencia.estudiante_nuevo_id}
                                    onChange={e => setFormTransferencia({ ...formTransferencia, estudiante_nuevo_id: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                >
                                    <option value="">Seleccione estudiante nuevo...</option>
                                    {estudiantes
                                        .filter(est => est.id !== paciente.estudiante_asignado_id)
                                        .map(est => (
                                            <option key={est.id} value={est.id}>
                                                {est.name} ({est.codigo_institucional || est.email})
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Institucional Estandarizado *</label>
                                <select
                                    required
                                    value={formTransferencia.motivo_estandarizado}
                                    onChange={e => setFormTransferencia({ ...formTransferencia, motivo_estandarizado: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                >
                                    <option value="Fin de semestre/rotación del estudiante anterior">Fin de semestre/rotación del estudiante anterior</option>
                                    <option value="Necesidad de mayor experiencia">Necesidad de mayor experiencia</option>
                                    <option value="Bajo desempeño del estudiante">Bajo desempeño del estudiante</option>
                                    <option value="Acuerdo entre partes">Acuerdo entre partes</option>
                                    <option value="Otro motivo justificado">Otro motivo justificado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Justificación Detallada (mínimo 10 caracteres) *</label>
                                <textarea
                                    rows="3"
                                    required
                                    minLength="10"
                                    value={formTransferencia.justificacion_detallada}
                                    onChange={e => setFormTransferencia({ ...formTransferencia, justificacion_detallada: e.target.value })}
                                    placeholder="Indique las razones académicas o de coordinación que motivan la reasignación formal..."
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalTransferirOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
                                >
                                    Autorizar Transferencia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: ALTA CLÍNICA DEFINITIVA --- */}
            {modalAltaClinicaOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Emisión de Alta Clínica Definitiva</h3>
                                <p className="text-xs text-slate-500">Módulo 3: Cierre de tratamiento e indicaciones de mantenimiento</p>
                            </div>
                        </div>

                        <form onSubmit={handleEnviarAltaClinica} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Recomendaciones Finales e Higiene *</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={formAltaClinica.recomendaciones_finales}
                                    onChange={e => setFormAltaClinica({ ...formAltaClinica, recomendaciones_finales: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Próxima Cita de Control o Mantenimiento *</label>
                                <select
                                    value={formAltaClinica.proximo_control_meses}
                                    onChange={e => setFormAltaClinica({ ...formAltaClinica, proximo_control_meses: parseInt(e.target.value) })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                >
                                    <option value="3">En 3 Meses (Control Periodontal Estricto)</option>
                                    <option value="6">En 6 Meses (Control y Mantenimiento Semestral)</option>
                                    <option value="12">En 12 Meses (Revisión Anual)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones Finales del Docente</label>
                                <textarea
                                    rows="2"
                                    value={formAltaClinica.observaciones}
                                    onChange={e => setFormAltaClinica({ ...formAltaClinica, observaciones: e.target.value })}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAltaClinicaOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                                >
                                    Confirmar y Emitir Alta Clínica
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: PRESUPUESTO FORMAL ODONTOLÓGICO UNIFRANZ (IMPRIMIBLE) --- */}
            {modalPresupuestoOpen && activePlan && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-6">
                        {/* Cabecera institucional para impresión */}
                        <div className="border-b-2 border-teal-600 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">CLÍNICA ODONTOLÓGICA UNIFRANZ</h2>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Universidad Privada Franz Tamayo — Sede La Paz</p>
                                <p className="text-xs text-slate-400">Presupuesto y Plan de Tratamiento Clínico</p>
                            </div>
                            <div className="text-right text-xs">
                                <div className="font-bold text-slate-800">IUP: {paciente.iup}</div>
                                <div className="text-slate-500">Fecha: {new Date().toLocaleDateString('es-BO')}</div>
                            </div>
                        </div>

                        {/* Datos del Paciente y Operador */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                            <div>
                                <span className="text-slate-400 font-bold block uppercase">Paciente</span>
                                <span className="font-bold text-slate-800 text-sm">{paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}</span>
                                <span className="block text-slate-500">CI: {paciente.ci} {paciente.ci_expedido || ''}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold block uppercase">Estudiante Operador</span>
                                <span className="font-bold text-slate-800">{activePlan.estudiante?.name || 'Estudiante Responsable'}</span>
                                <span className="block text-slate-500">Docente: {activePlan.docente_supervisor?.name || 'Dr. Supervisor'}</span>
                            </div>
                        </div>

                        {/* Tabla de Aranceles */}
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-bold">
                                    <th className="py-2 px-3">Fase / Especialidad</th>
                                    <th className="py-2 px-3">Pieza</th>
                                    <th className="py-2 px-3">Procedimiento Arancelario</th>
                                    <th className="py-2 px-3 text-right">Monto (Bs.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activePlan.fases && activePlan.fases.map((f, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-slate-500">{f.fase_categoria || f.especialidad}</td>
                                        <td className="py-2 px-3 font-bold text-teal-700">{f.pieza_fdi || f.pieza_dental || '—'}</td>
                                        <td className="py-2 px-3 font-medium text-slate-800">{f.procedimiento}</td>
                                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                                            Bs. {parseFloat(f.costo_arancel || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-300 font-black text-sm bg-slate-50">
                                    <td colSpan="3" className="py-3 px-3 text-right text-slate-800 uppercase">Total Presupuestado:</td>
                                    <td className="py-3 px-3 text-right text-teal-800">
                                        Bs. {parseFloat(activePlan.costo_total_estimado || 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Firmas */}
                        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-500">
                            <div className="border-t border-slate-300 pt-2">
                                <span className="font-bold text-slate-700 block">Firma y Aceptación del Paciente</span>
                                <span>CI: {paciente.ci} {paciente.ci_expedido || ''}</span>
                            </div>
                            <div className="border-t border-slate-300 pt-2">
                                <span className="font-bold text-slate-700 block">Firma y Sello Docente Supervisor</span>
                                <span>Clínica Odontológica UNIFRANZ</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 no-print">
                            <button
                                type="button"
                                onClick={() => setModalPresupuestoOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Imprimir Documento</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: REPORTES DE PRODUCCIÓN CLÍNICA --- */}
            {modalReportesOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Reportes de Producción Clínica</h3>
                                    <p className="text-xs text-slate-500">Módulo 3: Estadísticas, tiempos promedio y productividad</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalReportesOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {cargandoReportes ? (
                            <div className="p-8 text-center text-slate-500 text-xs">
                                Cargando indicadores de producción clínica...
                            </div>
                        ) : reportesData ? (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                {/* KPIs Generales */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-teal-600 uppercase block">Total Planes</span>
                                        <span className="text-xl font-black text-teal-900">{reportesData.resumen_general?.total_planes || 0}</span>
                                    </div>
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase block">Planes Aprobados</span>
                                        <span className="text-xl font-black text-emerald-900">{reportesData.resumen_general?.planes_aprobados || 0}</span>
                                    </div>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase block">Procedimientos Totales</span>
                                        <span className="text-xl font-black text-blue-900">{reportesData.resumen_general?.procedimientos_totales || 0}</span>
                                    </div>
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                        <span className="text-[10px] font-bold text-purple-600 uppercase block">Procedimientos Finalizados</span>
                                        <span className="text-xl font-black text-purple-900">{reportesData.resumen_general?.procedimientos_completados || 0}</span>
                                    </div>
                                </div>

                                {/* Top Procedimientos */}
                                <div className="border border-slate-200 rounded-xl p-3">
                                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase">Procedimientos Más Realizados</h4>
                                    <div className="space-y-1.5 text-xs">
                                        {reportesData.top_procedimientos && reportesData.top_procedimientos.map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50">
                                                <span className="font-semibold text-slate-700">{p.procedimiento} ({p.especialidad})</span>
                                                <span className="font-bold text-teal-700">{p.total} ejecutados</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setModalReportesOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
