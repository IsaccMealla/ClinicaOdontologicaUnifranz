import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

// Generador de alertas sonoras suaves y profesionales con Web Audio API
const playChimeSound = (type = 'checkin') => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'alerta_roja') {
            // Tono de advertencia suave pero notorio (doble beep)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(440.00, audioCtx.currentTime + 0.15); // A4
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } else {
            // Tono de llegada / campana positiva
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
            gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) {
        console.warn('AudioContext not allowed or supported', e);
    }
};

export default function CitasIndex({
    citas = [],
    citasHoy = [],
    pacientesAbandono = [],
    actasAbandono = [],
    sillones = [],
    estudiantes = [],
    docentes = [],
    pacientes = [],
    filtros = {},
    metricas = {},
    cargaGabinetes = [],
    productividadEstudiantes = [],
    configuraciones = {},
    userRole = 'estudiante',
}) {
    const [activeTab, setActiveTab] = useState('agenda'); // 'agenda', 'espera', 'abandono', 'reportes'
    const [viewMode, setViewMode] = useState('semana'); // 'dia', 'semana', 'lista'
    const [selectedSillon, setSelectedSillon] = useState(filtros.sillon_id || '');
    const [selectedEstudiante, setSelectedEstudiante] = useState(filtros.estudiante_id || '');
    const [selectedDocente, setSelectedDocente] = useState(filtros.docente_id || '');
    const [selectedEstado, setSelectedEstado] = useState(filtros.estado || '');

    // Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAbandonoModalOpen, setIsAbandonoModalOpen] = useState(false);
    const [pacienteParaAbandono, setPacienteParaAbandono] = useState(null);
    const [selectedCitaParaDetalle, setSelectedCitaParaDetalle] = useState(null);

    // Formulario de Creación de Citas Multi-Recurso
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate, errors: createErrors } = useForm({
        paciente_id: '',
        estudiante_id: '',
        docente_id: '',
        sillon_id: '',
        fecha_hora_inicio: '',
        duracion_estimada_minutos: 60,
        motivo: '',
        observaciones: '',
        es_recurrente: false,
        frecuencia_recurrencia: 'semanal',
        repeticiones: 3,
    });

    // Formulario de Acta de Abandono
    const { data: abandonoData, setData: setAbandonoData, post: postAbandono, processing: abandonoProcessing, reset: resetAbandono, errors: abandonoErrors } = useForm({
        paciente_id: '',
        motivo_abandono: '',
        acciones_previas: 'Se realizaron 2 llamadas telefónicas y se envió recordatorio vía mensajería sin respuesta del paciente.',
        observaciones: 'El caso se declara cerrado en clínica por protocolo de ausentismo docente.',
    });

    // Formulario de Configuración
    const { data: configData, setData: setConfigData, post: postConfig, processing: configProcessing } = useForm({
        tiempo_max_espera_minutos: configuraciones.tiempo_max_espera_minutos || 15,
        max_inasistencias_abandono: configuraciones.max_inasistencias_abandono || 3,
    });

    // Auto-completar estudiante si el paciente ya tiene uno asignado
    const handlePacienteChange = (pacienteId) => {
        setCreateData('paciente_id', pacienteId);
        const pac = pacientes.find((p) => p.id == pacienteId);
        if (pac && pac.estudiante_asignado_id) {
            setCreateData('estudiante_id', pac.estudiante_asignado_id);
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('citas.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    const handleCheckIn = (citaId) => {
        playChimeSound('checkin');
        router.post(route('citas.check-in', citaId));
    };

    const handleIniciarAtencion = (citaId) => {
        router.post(route('citas.iniciar-atencion', citaId));
    };

    const handleCompletar = (citaId) => {
        router.post(route('citas.completar', citaId));
    };

    const handleNoAsistio = (citaId) => {
        if (confirm('¿Confirmas registrar que el paciente NO ASISTIÓ a esta cita? Esto sumará al contador de ausentismo.')) {
            router.post(route('citas.no-asistio', citaId));
        }
    };

    const handleCancelar = (citaId) => {
        const motivo = prompt('Ingresa el motivo de cancelación de la cita:');
        if (motivo) {
            router.post(route('citas.cancelar', citaId), { motivo_cancelacion: motivo });
        }
    };

    const handleEnviarRecordatorio = (citaId, canal = 'whatsapp') => {
        router.post(route('citas.recordatorio', citaId), { canal }, {
            onSuccess: () => alert('Recordatorio preparado y registrado con éxito.'),
        });
    };

    const openAbandonoModal = (paciente) => {
        setPacienteParaAbandono(paciente);
        setAbandonoData('paciente_id', paciente.id);
        setAbandonoData('motivo_abandono', `Acumulación de ${paciente.inasistencias_acumuladas} inasistencias no justificadas a citas programadas.`);
        setIsAbandonoModalOpen(true);
    };

    const handleAbandonoSubmit = (e) => {
        e.preventDefault();
        postAbandono(route('citas.alta-abandono'), {
            onSuccess: () => {
                setIsAbandonoModalOpen(false);
                resetAbandono();
                setPacienteParaAbandono(null);
            },
        });
    };

    const handleConfigSubmit = (e) => {
        e.preventDefault();
        postConfig(route('citas.configuracion'));
    };

    // Filtros de citas en cliente
    const filteredCitas = useMemo(() => {
        return citas.filter((c) => {
            if (selectedSillon && c.sillon_id != selectedSillon) return false;
            if (selectedEstudiante && c.estudiante_id != selectedEstudiante) return false;
            if (selectedDocente && c.docente_id != selectedDocente) return false;
            if (selectedEstado && c.estado !== selectedEstado) return false;
            return true;
        });
    }, [citas, selectedSillon, selectedEstudiante, selectedDocente, selectedEstado]);

    // Estados badge colors
    const estadoBadge = (estado) => {
        switch (estado) {
            case 'en_espera':
                return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
            case 'en_atencion':
                return 'bg-sky-100 text-sky-800 border-sky-300 font-semibold';
            case 'asistio':
            case 'completada':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'no_asistio':
                return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
            case 'cancelada':
                return 'bg-slate-100 text-slate-500 border-slate-300 line-through';
            case 'confirmada':
                return 'bg-teal-100 text-teal-800 border-teal-300';
            case 'programada':
            default:
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        }
    };

    const estadoNombre = (estado) => {
        const labels = {
            programada: 'Programada',
            confirmada: 'Confirmada',
            en_espera: 'En Sala de Espera',
            en_atencion: 'En Gabinete / Atención',
            asistio: 'Completada / Asistió',
            no_asistio: 'No Asistió (Falta)',
            cancelada: 'Cancelada',
        };
        return labels[estado] || estado;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Módulo 4: Agendamiento de Citas & Flujo Clínico" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* 1. Header institucional y estadísticas rápidas */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider rounded-full">
                                    Módulo 4 Operativo
                                </span>
                                <span className="text-xs text-slate-300">
                                    Agenda Multi-Recurso &middot; Protocolo de Flujo &middot; Sala de Espera
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
                                Agendamiento de Citas & Logística Clínica
                            </h1>
                            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                                Coordinación en tiempo real entre Gabinetes (Sillones), Estudiantes y Docentes Supervisores.
                                Control de puntualidad y protocolo de abandono.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => playChimeSound('alerta_roja')}
                                title="Probar sonido de alertas"
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition"
                            >
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                Probar Alarma
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition transform active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Programar Cita
                            </button>
                        </div>
                    </div>

                    {/* Fila de Tarjetas de Métricas de Hoy */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
                        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-3 border border-slate-700/60">
                            <span className="text-xs text-slate-400 font-medium block">Citas de Hoy</span>
                            <span className="text-2xl font-bold text-white">{metricas.total_citas_hoy || 0}</span>
                        </div>
                        <div className="bg-amber-950/40 backdrop-blur rounded-xl p-3 border border-amber-800/50">
                            <span className="text-xs text-amber-300 font-medium block">En Sala de Espera</span>
                            <span className="text-2xl font-bold text-amber-400">{metricas.en_espera_hoy || 0}</span>
                        </div>
                        <div className="bg-sky-950/40 backdrop-blur rounded-xl p-3 border border-sky-800/50">
                            <span className="text-xs text-sky-300 font-medium block">En Atención (Box)</span>
                            <span className="text-2xl font-bold text-sky-400">{metricas.en_atencion_hoy || 0}</span>
                        </div>
                        <div className="bg-rose-950/40 backdrop-blur rounded-xl p-3 border border-rose-800/50">
                            <span className="text-xs text-rose-300 font-medium block">Alertas Rojas (&gt;{configuraciones.tiempo_max_espera_minutos}m)</span>
                            <span className="text-2xl font-bold text-rose-400">{metricas.alertas_rojas_espera || 0}</span>
                        </div>
                        <div className="bg-purple-950/40 backdrop-blur rounded-xl p-3 border border-purple-800/50 col-span-2 sm:col-span-1">
                            <span className="text-xs text-purple-300 font-medium block">Riesgo de Abandono</span>
                            <span className="text-2xl font-bold text-purple-400">{metricas.pacientes_alerta_abandono || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Barra de Navegación por Pestañas */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('agenda')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                            activeTab === 'agenda'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        1. Agenda Multi-Recurso
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('espera')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 relative ${
                            activeTab === 'espera'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        2. Sala de Espera ({citasHoy.filter(c => c.estado === 'en_espera').length})
                        {metricas.alertas_rojas_espera > 0 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-200 animate-ping absolute -top-1 -right-1" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('abandono')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                            activeTab === 'abandono'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        3. Control de Ausentismo & Abandono ({pacientesAbandono.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reportes')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                            activeTab === 'reportes'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        4. Carga de Gabinetes & Reportes
                    </button>
                </div>

                {/* =========================================================================
                    PESTAÑA 1: AGENDA MULTI-RECURSO
                   ========================================================================= */}
                {activeTab === 'agenda' && (
                    <div className="space-y-4">
                        {/* Barra de Filtros Dinámicos */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Gabinete / Sillón
                                </label>
                                <select
                                    value={selectedSillon}
                                    onChange={(e) => setSelectedSillon(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los Gabinetes ({sillones.length})</option>
                                    {sillones.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.codigo} - {s.nombre} ({s.sala_clinica})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Estudiante
                                </label>
                                <select
                                    value={selectedEstudiante}
                                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los Estudiantes</option>
                                    {estudiantes.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Docente Supervisor
                                </label>
                                <select
                                    value={selectedDocente}
                                    onChange={(e) => setSelectedDocente(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los Docentes</option>
                                    {docentes.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Estado de Cita
                                </label>
                                <select
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los Estados</option>
                                    <option value="programada">Programada</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="en_espera">En Sala de Espera</option>
                                    <option value="en_atencion">En Atención</option>
                                    <option value="asistio">Completada / Asistió</option>
                                    <option value="no_asistio">No Asistió</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSillon('');
                                        setSelectedEstudiante('');
                                        setSelectedDocente('');
                                        setSelectedEstado('');
                                    }}
                                    className="w-full py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>

                        {/* Listado de Citas en Tarjetas / Grilla */}
                        {filteredCitas.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-base font-semibold text-slate-700">No se encontraron citas en este periodo</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Ajusta los filtros o haz clic en "Programar Cita" para agendar una nueva sesión clínica.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCitas.map((cita) => {
                                    const fechaInicio = new Date(cita.fecha_hora_inicio);
                                    const fechaFin = new Date(cita.fecha_hora_fin);

                                    return (
                                        <div
                                            key={cita.id}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
                                        >
                                            <div>
                                                {/* Header de la tarjeta */}
                                                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-800 block">
                                                            {fechaInicio.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="text-xs text-indigo-600 font-semibold">
                                                            {fechaInicio.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} - {fechaFin.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} ({cita.duracion_estimada_minutos} min)
                                                        </span>
                                                    </div>
                                                    <span className={`px-2.5 py-1 text-[11px] rounded-full border ${estadoBadge(cita.estado)}`}>
                                                        {estadoNombre(cita.estado)}
                                                    </span>
                                                </div>

                                                {/* Paciente */}
                                                <div className="mt-3">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paciente</span>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                                        {cita.paciente?.nombres} {cita.paciente?.apellido_paterno} {cita.paciente?.apellido_materno}
                                                    </h4>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span>CI: {cita.paciente?.ci}</span>
                                                        {cita.paciente?.iup && <span className="text-indigo-600 font-mono">[{cita.paciente.iup}]</span>}
                                                    </div>
                                                </div>

                                                {/* Vinculaciones Multi-Recurso */}
                                                <div className="mt-3 space-y-1 text-xs">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <span className="font-semibold text-slate-500">Box/Sillón:</span>
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-medium">
                                                            {cita.sillon?.codigo} - {cita.sillon?.nombre}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <span className="font-semibold text-slate-500">Estudiante:</span>
                                                        <span className="text-slate-800">{cita.estudiante?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <span className="font-semibold text-slate-500">Supervisor:</span>
                                                        <span className="text-slate-800">{cita.docente?.name}</span>
                                                    </div>
                                                    <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                        <span className="text-[11px] font-semibold text-indigo-700 block">Motivo:</span>
                                                        <p className="text-xs text-slate-700">{cita.motivo}</p>
                                                        {cita.plan_tratamiento && (
                                                            <span className="inline-block mt-1 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                                                Plan: {cita.plan_tratamiento.descripcion || cita.plan_tratamiento.codigo_plan}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Acciones de Flujo de la Cita */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                                                {cita.estado === 'programada' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCheckIn(cita.id)}
                                                        className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded transition"
                                                    >
                                                        Check-in (Llegó)
                                                    </button>
                                                )}

                                                {cita.estado === 'en_espera' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleIniciarAtencion(cita.id)}
                                                        className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded transition"
                                                    >
                                                        Pasar a Box
                                                    </button>
                                                )}

                                                {cita.estado === 'en_atencion' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCompletar(cita.id)}
                                                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition"
                                                    >
                                                        Concluir
                                                    </button>
                                                )}

                                                {['programada', 'confirmada', 'en_espera'].includes(cita.estado) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNoAsistio(cita.id)}
                                                        className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs rounded transition"
                                                        title="Marcar No Show"
                                                    >
                                                        Falta
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleEnviarRecordatorio(cita.id, 'whatsapp')}
                                                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs rounded transition flex items-center gap-1"
                                                    title="Enviar recordatorio automático"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                                    </svg>
                                                    Recordar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 2: PROTOCOLO DE FLUJO & SALA DE ESPERA (RECEPCIÓN A ALUMNO)
                   ========================================================================= */}
                {activeTab === 'espera' && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-amber-500 text-white rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-amber-900">
                                        Panel de Sala de Espera en Tiempo Real
                                    </h3>
                                    <p className="text-xs text-amber-700">
                                        Tiempo límite de espera antes de <strong>ALERTA ROJA</strong>:{' '}
                                        <span className="font-bold underline">{configuraciones.tiempo_max_espera_minutos} minutos</span>.
                                        Notificación simultánea a Docente y Estudiante.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {citasHoy.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                                <p className="text-sm text-slate-500">No hay citas registradas para la fecha de hoy.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        Pacientes Citados para Hoy ({citasHoy.length})
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        Fecha: {new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-4">Hora</th>
                                                <th className="py-3 px-4">Paciente</th>
                                                <th className="py-3 px-4">Estudiante Responsable</th>
                                                <th className="py-3 px-4">Docente Supervisor</th>
                                                <th className="py-3 px-4">Gabinete</th>
                                                <th className="py-3 px-4 text-center">Estado / Check-in</th>
                                                <th className="py-3 px-4 text-center">Espera</th>
                                                <th className="py-3 px-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {citasHoy.map((c) => {
                                                const horaInicio = new Date(c.fecha_hora_inicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
                                                const esAlertaRoja = c.alerta_roja;

                                                return (
                                                    <tr
                                                        key={c.id}
                                                        className={`transition ${
                                                            esAlertaRoja
                                                                ? 'bg-rose-50/80 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
                                                                : 'hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <td className="py-3 px-4 font-bold text-slate-900">
                                                            {horaInicio}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-slate-900">
                                                                {c.paciente?.nombres} {c.paciente?.apellido_paterno}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500">
                                                                CI: {c.paciente?.ci} &middot; Cel: {c.paciente?.celular || 'S/N'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-slate-800">
                                                            {c.estudiante?.name}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600">
                                                            {c.docente?.name}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                                                {c.sillon?.codigo}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full border text-[11px] inline-block ${estadoBadge(c.estado)}`}>
                                                                {estadoNombre(c.estado)}
                                                            </span>
                                                            {c.check_in_at && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                                                    Check-in: {new Date(c.check_in_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {c.estado === 'en_espera' ? (
                                                                <div>
                                                                    <span
                                                                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                                            esAlertaRoja
                                                                                ? 'bg-rose-600 text-white animate-bounce'
                                                                                : 'bg-amber-100 text-amber-800'
                                                                        }`}
                                                                    >
                                                                        {c.minutos_espera_actual} min
                                                                    </span>
                                                                    {esAlertaRoja && (
                                                                        <span className="block text-[10px] text-rose-700 font-extrabold uppercase tracking-tight mt-0.5">
                                                                            ⚠️ ALERTA ROJA DOCENTE
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : c.minutos_espera_reales ? (
                                                                <span className="text-xs text-slate-500">
                                                                    {c.minutos_espera_reales} min
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                {c.estado === 'programada' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCheckIn(c.id)}
                                                                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded text-xs transition"
                                                                    >
                                                                        Llegó
                                                                    </button>
                                                                )}
                                                                {c.estado === 'en_espera' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleIniciarAtencion(c.id)}
                                                                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded text-xs transition"
                                                                    >
                                                                        Atender
                                                                    </button>
                                                                )}
                                                                {c.estado === 'en_atencion' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCompletar(c.id)}
                                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition"
                                                                    >
                                                                        Concluir
                                                                    </button>
                                                                )}
                                                                {['programada', 'en_espera'].includes(c.estado) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleNoAsistio(c.id)}
                                                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs transition"
                                                                    >
                                                                        Falta
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 3: CONTROL DE AUSENTISMO & PROTOCOLO DE ABANDONO
                   ========================================================================= */}
                {activeTab === 'abandono' && (
                    <div className="space-y-6">
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                            <span className="p-2 bg-rose-600 text-white rounded-lg mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-rose-900">
                                    Protocolo Institucional de Ausentismo y Alta por Abandono
                                </h3>
                                <p className="text-xs text-rose-700 mt-0.5">
                                    Los pacientes con 2 o más inasistencias no justificadas entran en protocolo de seguimiento obligatorio.
                                    Al formalizar el <strong>Alta por Abandono</strong>, se genera un Acta formal correlativa en la Historia Clínica (M2) y el paciente pasa a estado inactivo (M1).
                                </p>
                            </div>
                        </div>

                        {/* Pacientes en Riesgo / Alerta Activa */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Pacientes con Inasistencias Reiteradas ({pacientesAbandono.length})
                                </h3>
                                <span className="text-xs text-slate-500">
                                    Umbral de abandono: {configuraciones.max_inasistencias_abandono} faltas
                                </span>
                            </div>

                            {pacientesAbandono.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Excelente: No hay pacientes en riesgo de abandono en este momento.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                            <tr>
                                                <th className="py-3 px-4">Paciente</th>
                                                <th className="py-3 px-4">CI / IUP</th>
                                                <th className="py-3 px-4">Estudiante a Cargo</th>
                                                <th className="py-3 px-4 text-center">Inasistencias Acumuladas</th>
                                                <th className="py-3 px-4 text-center">Estado del Caso</th>
                                                <th className="py-3 px-4 text-right">Protocolo de Cierre</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pacientesAbandono.map((pac) => (
                                                <tr key={pac.id} className="hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-bold text-slate-900">
                                                        {pac.nombres} {pac.apellido_paterno} {pac.apellido_materno}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600">
                                                        {pac.ci} {pac.iup && <span className="text-indigo-600 font-mono">[{pac.iup}]</span>}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-800">
                                                        {pac.estudiante_asignado ? pac.estudiante_asignado.name : 'Sin asignar'}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold rounded-full text-xs">
                                                            {pac.inasistencias_acumuladas} Faltas
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {pac.alerta_abandono ? (
                                                            <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-full animate-pulse">
                                                                Alerta Abandono Activa
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] rounded-full">
                                                                En Seguimiento
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {['docente', 'admin', 'director_clinica'].includes(userRole) ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAbandonoModal(pac)}
                                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs shadow-sm transition"
                                                            >
                                                                Formalizar Acta de Abandono
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">
                                                                Requiere Docente
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Historial de Actas de Abandono */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Historial de Actas Oficiales de Abandono ({actasAbandono.length})
                                </h3>
                            </div>
                            {actasAbandono.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No se han emitido actas de abandono en este periodo.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                            <tr>
                                                <th className="py-3 px-4">Código Acta</th>
                                                <th className="py-3 px-4">Fecha</th>
                                                <th className="py-3 px-4">Paciente</th>
                                                <th className="py-3 px-4">Docente Emisor</th>
                                                <th className="py-3 px-4">Inasistencias</th>
                                                <th className="py-3 px-4">Motivo Declarado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {actasAbandono.map((acta) => (
                                                <tr key={acta.id} className="hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                                                        {acta.codigo_acta}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600">
                                                        {new Date(acta.fecha_declaracion).toLocaleDateString('es-BO')}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-slate-900">
                                                        {acta.paciente?.nombres} {acta.paciente?.apellido_paterno}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-800">
                                                        {acta.docente?.name}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 bg-slate-100 font-bold rounded">
                                                            {acta.numero_inasistencias}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={acta.motivo_abandono}>
                                                        {acta.motivo_abandono}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 4: REPORTES OPERATIVOS & CARGA DE GABINETES
                   ========================================================================= */}
                {activeTab === 'reportes' && (
                    <div className="space-y-6">
                        {/* 1. Carga de Gabinetes / Ocupación de Sillones */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        Vista de Carga de Gabinetes Clínicos (Sillones)
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Horas de atención agendadas y distribución física por unidad.
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                                    Total: {cargaGabinetes.length} Unidades
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cargaGabinetes.map((sillon) => {
                                    // Estimación simple de capacidad de 50 horas por semana
                                    const porcentajeUso = Math.min(100, Math.round((sillon.horas_ocupadas / 50) * 100));

                                    return (
                                        <div key={sillon.sillon_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                                                    {sillon.codigo}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                                    sillon.estado_actual === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {sillon.estado_actual}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-900 text-sm mt-2">{sillon.nombre}</h4>
                                            <span className="text-xs text-slate-500">{sillon.sala}</span>

                                            <div className="mt-3 space-y-1">
                                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                                    <span>Carga Semanal:</span>
                                                    <span className="font-bold text-indigo-600">{sillon.horas_ocupadas} hrs ({sillon.total_citas} citas)</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            porcentajeUso > 80 ? 'bg-rose-500' : porcentajeUso > 50 ? 'bg-amber-500' : 'bg-indigo-600'
                                                        }`}
                                                        style={{ width: `${porcentajeUso}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Productividad por Estudiante */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Reporte de Productividad y Cumplimiento por Estudiante
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Citas programadas, asistidas e inasistencias en el periodo seleccionado.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                        <tr>
                                            <th className="py-3 px-4">Estudiante</th>
                                            <th className="py-3 px-4">Correo</th>
                                            <th className="py-3 px-4 text-center">Citas Programadas</th>
                                            <th className="py-3 px-4 text-center">Citas Asistidas</th>
                                            <th className="py-3 px-4 text-center">Faltas (No Show)</th>
                                            <th className="py-3 px-4 text-center">Tasa Asistencia</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {productividadEstudiantes.map((est) => {
                                            const total = est.citas_programadas || 0;
                                            const asistidas = est.citas_asistidas || 0;
                                            const tasa = total > 0 ? Math.round((asistidas / total) * 100) : 0;

                                            return (
                                                <tr key={est.id} className="hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-bold text-slate-900">{est.name}</td>
                                                    <td className="py-3 px-4 text-slate-500">{est.email}</td>
                                                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{total}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{asistidas}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-rose-600">{est.citas_inasistencias || 0}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            tasa >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {tasa}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 3. Panel de Configuración Operativa (Admin / Director) */}
                        {['admin', 'director_clinica'].includes(userRole) && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">
                                    Configuraciones Operativas de Tiempos y Alertas
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Ajuste de umbrales para Alertas Rojas en Sala de Espera y Protocolo de Abandono.
                                </p>

                                <form onSubmit={handleConfigSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Tiempo Máximo de Espera (Minutos)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="120"
                                            value={configData.tiempo_max_espera_minutos}
                                            onChange={(e) => setConfigData('tiempo_max_espera_minutos', e.target.value)}
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                                            Superado este tiempo, se dispara la Alerta Roja.
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Inasistencias para Protocolo de Abandono
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={configData.max_inasistencias_abandono}
                                            onChange={(e) => setConfigData('max_inasistencias_abandono', e.target.value)}
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                                            Faltas acumuladas para activar alerta de cierre de caso.
                                        </span>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={configProcessing}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                                        >
                                            Guardar Configuración
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    MODAL: PROGRAMAR NUEVA CITA MULTI-RECURSO
                   ========================================================================= */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Programar Cita Odontológica</h3>
                                    <p className="text-xs text-slate-500">
                                        Vinculación obligatoria: Paciente, Estudiante, Docente y Gabinete.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            {createErrors.colision && (
                                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                                    ⚠️ {createErrors.colision}
                                </div>
                            )}

                            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Paciente */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Paciente *
                                        </label>
                                        <select
                                            value={createData.paciente_id}
                                            onChange={(e) => handlePacienteChange(e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="">Selecciona un paciente...</option>
                                            {pacientes.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.apellido_paterno} {p.apellido_materno} {p.nombres} - CI: {p.ci} {p.iup ? `[${p.iup}]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Estudiante Responsable */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Estudiante Responsable *
                                        </label>
                                        <select
                                            value={createData.estudiante_id}
                                            onChange={(e) => setCreateData('estudiante_id', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="">Selecciona estudiante...</option>
                                            {estudiantes.map((est) => (
                                                <option key={est.id} value={est.id}>
                                                    {est.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Docente Supervisor */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Docente Supervisor *
                                        </label>
                                        <select
                                            value={createData.docente_id}
                                            onChange={(e) => setCreateData('docente_id', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="">Selecciona docente supervisor...</option>
                                            {docentes.map((doc) => (
                                                <option key={doc.id} value={doc.id}>
                                                    {doc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gabinete / Sillón Asignado */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Gabinete Clínico (Sillón) *
                                        </label>
                                        <select
                                            value={createData.sillon_id}
                                            onChange={(e) => setCreateData('sillon_id', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="">Selecciona gabinete...</option>
                                            {sillones.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.codigo} - {s.nombre} ({s.sala_clinica})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Duración Estimada */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Duración Estimada *
                                        </label>
                                        <select
                                            value={createData.duracion_estimada_minutos}
                                            onChange={(e) => setCreateData('duracion_estimada_minutos', parseInt(e.target.value))}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value={30}>30 minutos (Control breve)</option>
                                            <option value={45}>45 minutos</option>
                                            <option value={60}>60 minutos (1 hora estándar)</option>
                                            <option value={90}>90 minutos (Procedimiento complejo)</option>
                                            <option value={120}>120 minutos (Cirugía / Endodoncia)</option>
                                        </select>
                                    </div>

                                    {/* Fecha y Hora de Inicio */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Fecha y Hora de Inicio *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={createData.fecha_hora_inicio}
                                            onChange={(e) => setCreateData('fecha_hora_inicio', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Motivo de la Cita */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Motivo de la Cita (Vínculo a Plan de Tratamiento) *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Fase 2 Restauradora - Resina compuesta pieza 16"
                                            value={createData.motivo}
                                            onChange={(e) => setCreateData('motivo', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Observaciones */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Observaciones Técnicas o Indicaciones
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Indicaciones previas, paciente alérgico a látex, etc."
                                            value={createData.observaciones}
                                            onChange={(e) => setCreateData('observaciones', e.target.value)}
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Opciones de Cita Recurrente */}
                                    <div className="sm:col-span-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={createData.es_recurrente}
                                                onChange={(e) => setCreateData('es_recurrente', e.target.checked)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-indigo-950">
                                                Programar como Cita Recurrente (Tratamiento Largo)
                                            </span>
                                        </label>

                                        {createData.es_recurrente && (
                                            <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-indigo-100">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                        Periodicidad
                                                    </label>
                                                    <select
                                                        value={createData.frecuencia_recurrencia}
                                                        onChange={(e) => setCreateData('frecuencia_recurrencia', e.target.value)}
                                                        className="w-full text-xs rounded-lg border-slate-300"
                                                    >
                                                        <option value="semanal">Semanal (cada 7 días)</option>
                                                        <option value="quincenal">Quincenal (cada 14 días)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                        Total de Sesiones
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={2}
                                                        max={8}
                                                        value={createData.repeticiones}
                                                        onChange={(e) => setCreateData('repeticiones', parseInt(e.target.value))}
                                                        className="w-full text-xs rounded-lg border-slate-300"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createProcessing}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow transition"
                                    >
                                        {createProcessing ? 'Validando colisiones...' : 'Confirmar y Guardar Cita'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    MODAL: FORMALIZAR ACTA DE ABANDONO DE TRATAMIENTO
                   ========================================================================= */}
                {isAbandonoModalOpen && pacienteParaAbandono && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                                        Acta Oficial HC-001
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 mt-1">
                                        Formalizar Alta por Abandono
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAbandonoModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleAbandonoSubmit} className="mt-4 space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                    <p><strong>Paciente:</strong> {pacienteParaAbandono.nombres} {pacienteParaAbandono.apellido_paterno}</p>
                                    <p><strong>CI / IUP:</strong> {pacienteParaAbandono.ci} {pacienteParaAbandono.iup ? `[${pacienteParaAbandono.iup}]` : ''}</p>
                                    <p className="text-rose-600"><strong>Inasistencias registradas:</strong> {pacienteParaAbandono.inasistencias_acumuladas} faltas</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Motivo Formal del Abandono *
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={abandonoData.motivo_abandono}
                                        onChange={(e) => setAbandonoData('motivo_abandono', e.target.value)}
                                        required
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Acciones Previas de Contacto
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={abandonoData.acciones_previas}
                                        onChange={(e) => setAbandonoData('acciones_previas', e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Observaciones de Cierre Docente
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={abandonoData.observaciones}
                                        onChange={(e) => setAbandonoData('observaciones', e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-rose-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAbandonoModalOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={abandonoProcessing}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow transition"
                                    >
                                        {abandonoProcessing ? 'Emitiendo acta...' : 'Firmar y Emitir Acta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
