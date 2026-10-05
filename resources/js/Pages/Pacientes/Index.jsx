import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function PacientesIndex({ pacientes, estudiantes = [], filtros = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roleSlug = auth?.role || user?.rol?.slug || 'estudiante';
    const isDocenteOrAdmin = ['docente', 'admin', 'director_clinica', 'admision'].includes(roleSlug);
    const isEstudiante = roleSlug === 'estudiante';

    const [buscar, setBuscar] = useState(filtros?.buscar || '');
    const [alertaFiltro, setAlertaFiltro] = useState(filtros?.alerta || '');
    const [estudianteFiltro, setEstudianteFiltro] = useState(filtros?.estudiante_id || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros?.estado_paciente || '');
    const [clinicoFiltro, setClinicoFiltro] = useState(filtros?.estado_clinico || '');

    // Sugerencias de búsqueda rápida en tiempo real
    const [sugerencias, setSugerencias] = useState([]);
    const [buscandoRapido, setBuscandoRapido] = useState(false);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const busquedaTimeoutRef = useRef(null);

    // Modal / Drawer de Resumen Ejecutivo de Paciente (Punto 4 del Módulo 1)
    const [resumenPaciente, setResumenPaciente] = useState(null);
    const [resumenModalOpen, setResumenModalOpen] = useState(false);

    // Modal de asignación / transferencia rápida
    const [modalAsignacion, setModalAsignacion] = useState({
        open: false,
        paciente: null,
        estudianteId: '',
        motivo: '',
        guardando: false,
    });

    const [copiadoIup, setCopiadoIup] = useState(null);

    const copiarAlPortapapeles = (texto, id) => {
        navigator.clipboard.writeText(texto);
        setCopiadoIup(id);
        setTimeout(() => setCopiadoIup(null), 2000);
    };

    // Live search sugerencias
    useEffect(() => {
        if (!buscar || buscar.trim().length < 2) {
            setSugerencias([]);
            setMostrarSugerencias(false);
            return;
        }

        if (busquedaTimeoutRef.current) {
            clearTimeout(busquedaTimeoutRef.current);
        }

        busquedaTimeoutRef.current = setTimeout(async () => {
            setBuscandoRapido(true);
            try {
                const res = await fetch(`${route('pacientes.buscar-rapido')}?q=${encodeURIComponent(buscar.trim())}`, {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSugerencias(data);
                    setMostrarSugerencias(true);
                }
            } catch (err) {
                console.error('Error en búsqueda rápida:', err);
            } finally {
                setBuscandoRapido(false);
            }
        }, 250);

        return () => {
            if (busquedaTimeoutRef.current) {
                clearTimeout(busquedaTimeoutRef.current);
            }
        };
    }, [buscar]);

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setMostrarSugerencias(false);
        router.get(route('pacientes.index'), {
            buscar: buscar || undefined,
            alerta: alertaFiltro || undefined,
            estudiante_id: estudianteFiltro || undefined,
            estado_paciente: estadoFiltro || undefined,
            estado_clinico: clinicoFiltro || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (key, value) => {
        const nuevos = {
            buscar: buscar || undefined,
            alerta: alertaFiltro || undefined,
            estudiante_id: estudianteFiltro || undefined,
            estado_paciente: estadoFiltro || undefined,
            estado_clinico: clinicoFiltro || undefined,
            [key]: value || undefined,
        };

        if (key === 'alerta') setAlertaFiltro(value);
        if (key === 'estudiante_id') setEstudianteFiltro(value);
        if (key === 'estado_paciente') setEstadoFiltro(value);
        if (key === 'estado_clinico') setClinicoFiltro(value);

        router.get(route('pacientes.index'), nuevos, { preserveState: true, replace: true });
    };

    const abrirResumenEjecutivo = (paciente) => {
        setResumenPaciente(paciente);
        setResumenModalOpen(true);
    };

    const abrirModalAsignacion = (paciente) => {
        setModalAsignacion({
            open: true,
            paciente,
            estudianteId: paciente.estudiante_asignado_id ? String(paciente.estudiante_asignado_id) : '',
            motivo: '',
            guardando: false,
        });
    };

    const ejecutarAsignacion = (e) => {
        e.preventDefault();
        if (!modalAsignacion.paciente) return;

        setModalAsignacion(prev => ({ ...prev, guardando: true }));
        router.post(
            route('pacientes.asignar-estudiante', modalAsignacion.paciente.id),
            {
                estudiante_id: modalAsignacion.estudianteId || null,
                motivo: modalAsignacion.motivo || 'Asignación desde padrón general',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setModalAsignacion({
                        open: false,
                        paciente: null,
                        estudianteId: '',
                        motivo: '',
                        guardando: false,
                    });
                },
                onError: () => {
                    setModalAsignacion(prev => ({ ...prev, guardando: false }));
                }
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase tracking-wider">
                                Módulo 1: Admisión & Padrón
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                                Total: {pacientes.total} pacientes
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mt-1">
                            Padrón General de Pacientes
                        </h2>
                        <p className="text-xs text-slate-500">
                            Identificador Único (IUP), admisión clínica, estados y expedientes odontológicos
                        </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                        <Link
                            href={route('historias-clinicas.index')}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition"
                        >
                            <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Ver Historias HC-001</span>
                        </Link>
                        <Link
                            href={route('pacientes.create')}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>+ Nuevo Paciente (IUP)</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Padrón de Pacientes - UNIFRANZ" />

            <div className="space-y-5">
                {/* BARRA DE FILTROS, BÚSQUEDA RÁPIDA INSTANTÁNEA Y ESTADOS */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                                placeholder="Búsqueda rápida por IUP (UNIFRANZ-2026-...), CI, Nombre o Teléfono..."
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {buscandoRapido && (
                                <div className="absolute right-3 top-3">
                                    <svg className="w-4 h-4 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                </div>
                            )}

                            {/* Dropdown flotante de resultados instantáneos */}
                            {mostrarSugerencias && sugerencias.length > 0 && (
                                <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                                    <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-500 flex justify-between items-center">
                                        <span>Coincidencias instantáneas ({sugerencias.length})</span>
                                        <button
                                            type="button"
                                            onClick={() => setMostrarSugerencias(false)}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                    {sugerencias.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                setMostrarSugerencias(false);
                                                router.visit(route('pacientes.show', item.id));
                                            }}
                                            className="p-3 hover:bg-teal-50/60 cursor-pointer transition flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                                                    {item.nombre_completo?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">
                                                        {item.nombre_completo}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                                        <span className="font-mono text-teal-700 font-semibold">{item.iup || 'Sin IUP'}</span>
                                                        <span>• CI: {item.ci}</span>
                                                        <span>• Edad: {item.edad || '-'} a</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                Abrir Expediente →
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filtro por Alumno Asignado (solo para Docentes y Admin) */}
                        {!isEstudiante ? (
                            <div className="min-w-[200px]">
                                <select
                                    value={estudianteFiltro}
                                    onChange={(e) => handleFilterChange('estudiante_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                >
                                    <option value="">Todos los Alumnos</option>
                                    <option value="sin_asignar">Sin Alumno Asignado</option>
                                    {estudiantes.length > 0 && (
                                        <optgroup label="Filtrar por estudiante:">
                                            {estudiantes.map((est) => (
                                                <option key={est.id} value={est.id}>
                                                    {est.name} ({est.codigo_institucional || 'Alumno'})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-center px-3.5 py-2 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold shrink-0">
                                <svg className="w-4 h-4 mr-1.5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Tus Pacientes Asignados</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shrink-0"
                        >
                            Filtrar
                        </button>
                    </form>

                    {/* FILTROS POR PASTILLAS: ESTADO ADMINISTRATIVO Y CLÍNICO */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase text-[10px] mr-1">Estado Admisión:</span>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('estado_paciente', '')}
                                className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                                    !estadoFiltro ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('estado_paciente', 'activo')}
                                className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                                    estadoFiltro === 'activo' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                                }`}
                            >
                                Activos
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('estado_paciente', 'inactivo')}
                                className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                                    estadoFiltro === 'inactivo' ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                Inactivos
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('estado_paciente', 'referido')}
                                className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                                    estadoFiltro === 'referido' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-800'
                                }`}
                            >
                                Referidos / Transferidos
                            </button>
                        </div>

                        {/* Filtros Rápidos por Alerta Médica (Sin Emojis, con SVGs) */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-400 uppercase text-[10px] mr-1">Alertas Médicas:</span>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('alerta', alertaFiltro === 'alergia' ? '' : 'alergia')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                                    alertaFiltro === 'alergia'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-400/30'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                            >
                                <svg className="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Alergias</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('alerta', alertaFiltro === 'hipertension' ? '' : 'hipertension')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                                    alertaFiltro === 'hipertension'
                                        ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400/30'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                            >
                                <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Hipertensión</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('alerta', alertaFiltro === 'coagulacion' ? '' : 'coagulacion')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                                    alertaFiltro === 'coagulacion'
                                        ? 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-400/30'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700'
                                }`}
                            >
                                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                <span>Coagulación</span>
                            </button>
                            {(alertaFiltro || estudianteFiltro || estadoFiltro || clinicoFiltro) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAlertaFiltro('');
                                        setEstudianteFiltro('');
                                        setEstadoFiltro('');
                                        setClinicoFiltro('');
                                        router.get(route('pacientes.index'), { buscar: buscar || undefined });
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-800 underline ml-2"
                                >
                                    Restablecer
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLA PRINCIPAL DE PACIENTES */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="py-3.5 px-4">IUP / Identificador</th>
                                    <th className="py-3.5 px-4">Paciente & Filiación</th>
                                    <th className="py-3.5 px-4">Estado & Admisión</th>
                                    <th className="py-3.5 px-4">Alertas Médicas</th>
                                    <th className="py-3.5 px-4">Operador Asignado</th>
                                    <th className="py-3.5 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pacientes.data.length > 0 ? (
                                    pacientes.data.map((paciente) => (
                                        <tr key={paciente.id} className="hover:bg-slate-50/70 transition group">
                                            {/* COLUMNA 1: IUP */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 shrink-0">
                                                        {paciente.iup || `UNIFRANZ-2026-${String(paciente.id).padStart(6, '0')}`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copiarAlPortapapeles(paciente.iup || `UNIFRANZ-2026-${String(paciente.id).padStart(6, '0')}`, paciente.id)}
                                                        title="Copiar código IUP"
                                                        className="text-slate-400 hover:text-teal-700 p-1 rounded hover:bg-slate-100 transition"
                                                    >
                                                        {copiadoIup === paciente.id ? (
                                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    Admisión: {paciente.nacionalidad || 'Boliviana'}
                                                </div>
                                            </td>

                                            {/* COLUMNA 2: PACIENTE & FILIACIÓN */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-teal-200/50">
                                                        {paciente.nombres?.charAt(0)}{paciente.apellido_paterno?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirResumenEjecutivo(paciente)}
                                                            className="font-bold text-slate-900 hover:text-teal-700 text-left transition leading-tight block"
                                                        >
                                                            {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                                                        </button>
                                                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                                            <span>CI: {paciente.ci} {paciente.ci_expedido ? `(${paciente.ci_expedido})` : ''}</span>
                                                            <span>•</span>
                                                            <span className="font-sans font-medium text-slate-400">{paciente.edad ? `${paciente.edad} años` : '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* COLUMNA 3: ESTADO Y ADMISIÓN */}
                                            <td className="py-3.5 px-4 text-xs">
                                                <div className="space-y-1">
                                                    <div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                                            paciente.estado_paciente === 'activo'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : (paciente.estado_paciente === 'referido'
                                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                    : 'bg-slate-100 text-slate-600 border-slate-200')
                                                        }`}>
                                                            ● {paciente.estado_paciente || 'Activo'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {paciente.estado_clinico === 'en_tratamiento' ? (
                                                            <span className="text-teal-700 font-medium">En tratamiento</span>
                                                        ) : (paciente.estado_clinico === 'alta_clinica' ? (
                                                            <span className="text-emerald-700 font-medium">Alta clínica</span>
                                                        ) : (
                                                            <span className="text-slate-400">En evaluación</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* COLUMNA 4: ALERTAS MÉDICAS */}
                                            <td className="py-3.5 px-4">
                                                {paciente.alertas_medicas && paciente.alertas_medicas.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {paciente.alertas_medicas.map((alerta, idx) => (
                                                            <span
                                                                key={idx}
                                                                title={alerta.detalle}
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                                                    alerta.nivel === 'peligro'
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}
                                                            >
                                                                {alerta.titulo}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Sin riesgo</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* COLUMNA 5: OPERADOR ASIGNADO */}
                                            <td className="py-3.5 px-4 text-xs">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        {paciente.estudiante_asignado ? (
                                                            <div>
                                                                <span className="font-bold text-slate-800 block">
                                                                    {paciente.estudiante_asignado.name}
                                                                </span>
                                                                <span className="text-[10px] text-teal-700 font-mono">
                                                                    {paciente.estudiante_asignado.codigo_institucional || 'Alumno Clínico'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                                Sin operador
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isDocenteOrAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirModalAsignacion(paciente)}
                                                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                                                            title="Asignar o transferir estudiante"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* COLUMNA 6: ACCIONES */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirResumenEjecutivo(paciente)}
                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                                                        title="Vista Resumen de Paciente"
                                                    >
                                                        Resumen
                                                    </button>
                                                    <Link
                                                        href={route('pacientes.show', paciente.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                                                    >
                                                        <span>Expediente</span>
                                                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <div className="max-w-xs mx-auto">
                                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="font-semibold text-slate-700">No se encontraron pacientes registrados</p>
                                                <p className="text-xs text-slate-400 mt-1">Verifica los filtros o registra un nuevo paciente con IUP automático.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {pacientes.links && pacientes.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Mostrando <span className="font-semibold">{pacientes.from || 0}</span> a <span className="font-semibold">{pacientes.to || 0}</span> de <span className="font-semibold">{pacientes.total}</span> pacientes
                            </div>
                            <div className="flex space-x-1">
                                {pacientes.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : link.url
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL / DRAWER: VISTA RESUMEN DE PACIENTE (Punto 4 del Módulo 1) */}
            {resumenModalOpen && resumenPaciente && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        {/* Cabecera del Resumen */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                                        {resumenPaciente.iup || `UNIFRANZ-2026-${String(resumenPaciente.id).padStart(6, '0')}`}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                        {resumenPaciente.estado_paciente || 'Activo'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mt-2">
                                    {resumenPaciente.nombres} {resumenPaciente.apellido_paterno} {resumenPaciente.apellido_materno || ''}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    CI: {resumenPaciente.ci} {resumenPaciente.ci_expedido ? `(${resumenPaciente.ci_expedido})` : ''} • {resumenPaciente.edad || '-'} años • {resumenPaciente.sexo === 'M' ? 'Masculino' : 'Femenino'} • {resumenPaciente.nacionalidad || 'Boliviana'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setResumenModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Bloques del Resumen Ejecutivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Bloque 1: Alertas Médicas */}
                            <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-1.5">
                                <span className="font-bold text-rose-800 uppercase text-[10px] flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Alertas Médicas y Alergias
                                </span>
                                {resumenPaciente.alertas_medicas && resumenPaciente.alertas_medicas.length > 0 ? (
                                    <div className="space-y-1">
                                        {resumenPaciente.alertas_medicas.map((alerta, i) => (
                                            <div key={i} className="text-rose-900 font-semibold">
                                                • {alerta.titulo}: <span className="font-normal text-rose-700">{alerta.detalle}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-emerald-700 font-medium">Sin antecedentes de riesgo alérgico o sistémico reportados.</p>
                                )}
                            </div>

                            {/* Bloque 2: Operador y Docente */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">
                                    Operador & Supervisión Académica
                                </span>
                                <div>
                                    <span className="text-slate-500 block">Estudiante Operador:</span>
                                    <span className="font-bold text-slate-800 text-sm">
                                        {resumenPaciente.estudiante_asignado?.name || 'Sin operador asignado'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Código: {resumenPaciente.estudiante_asignado?.codigo_institucional || 'N/A'}
                                </div>
                            </div>

                            {/* Bloque 3: Última Consulta y Estado Clínico */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">
                                    Evolución y Última Consulta
                                </span>
                                <div>
                                    <span className="text-slate-500 block">Fecha última visita:</span>
                                    <span className="font-bold text-slate-800">
                                        {resumenPaciente.fecha_ultima_consulta || 'Sin registros de consulta previa'}
                                    </span>
                                </div>
                                {resumenPaciente.motivo_ultima_consulta && (
                                    <p className="text-slate-600 italic">
                                        "{resumenPaciente.motivo_ultima_consulta}"
                                    </p>
                                )}
                            </div>

                            {/* Bloque 4: Estado de la Cuenta & Financiero */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">
                                    Estado de la Cuenta
                                </span>
                                <div>
                                    <span className="text-slate-500 block">Saldo Pendiente:</span>
                                    <span className="font-extrabold text-slate-900 text-sm">
                                        Bs {Number(resumenPaciente.saldo_cuenta || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-emerald-700 font-medium">
                                    {Number(resumenPaciente.saldo_cuenta || 0) <= 0 ? 'Cuenta al día' : 'Pendiente de pago por aranceles'}
                                </div>
                            </div>

                            {/* Bloque 5: Contacto de Emergencia */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2 space-y-1">
                                <span className="font-bold text-slate-600 uppercase text-[10px]">
                                    Contacto de Urgencia & Convenio
                                </span>
                                <div className="text-slate-800 font-medium">
                                    {resumenPaciente.contacto_emergencia ? (
                                        <span>{resumenPaciente.contacto_emergencia} ({resumenPaciente.parentesco_emergencia || 'Referencia'}) - Tel: {resumenPaciente.telefono_emergencia || '-'}</span>
                                    ) : (
                                        <span className="text-slate-400">Sin contacto de urgencia especificado</span>
                                    )}
                                </div>
                                {resumenPaciente.seguro_convenio && (
                                    <div className="text-[11px] text-teal-700 font-semibold pt-1">
                                        Convenio: {resumenPaciente.seguro_convenio} (Póliza N° {resumenPaciente.numero_poliza || 'S/N'})
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setResumenModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                            >
                                Cerrar
                            </button>
                            <Link
                                href={route('pacientes.show', resumenPaciente.id)}
                                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            >
                                Abrir Expediente Completo →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE TRANSFERENCIA / ASIGNACIÓN DE ESTUDIANTE */}
            {modalAsignacion.open && modalAsignacion.paciente && (
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
                                    <h3 className="text-base font-bold text-slate-900">Asignar o Transferir Paciente</h3>
                                    <p className="text-xs text-slate-500">Gestión de operador odontológico responsable</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalAsignacion(prev => ({ ...prev, open: false }))}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="font-bold text-slate-800 text-sm">
                                {modalAsignacion.paciente.nombres} {modalAsignacion.paciente.apellido_paterno} {modalAsignacion.paciente.apellido_materno || ''}
                            </div>
                            <div className="text-slate-500">
                                IUP: {modalAsignacion.paciente.iup || `UNIFRANZ-2026-${modalAsignacion.paciente.id}`} • CI: {modalAsignacion.paciente.ci}
                            </div>
                            <div className="pt-1 text-slate-600">
                                <strong>Operador Actual:</strong>{' '}
                                {modalAsignacion.paciente.estudiante_asignado ? (
                                    <span className="text-teal-700 font-semibold">{modalAsignacion.paciente.estudiante_asignado.name}</span>
                                ) : (
                                    <span className="text-slate-400 italic">Sin operador asignado</span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={ejecutarAsignacion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Seleccionar Nuevo Estudiante / Operador
                                </label>
                                <select
                                    value={modalAsignacion.estudianteId}
                                    onChange={(e) => setModalAsignacion(prev => ({ ...prev, estudianteId: e.target.value }))}
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
                                    value={modalAsignacion.motivo}
                                    onChange={(e) => setModalAsignacion(prev => ({ ...prev, motivo: e.target.value }))}
                                    placeholder="Ej: Inicio de semestre, rotación clínica, continuación de endodoncia..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Quedará registrado en la bitácora institucional de auditoría clínica.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAsignacion(prev => ({ ...prev, open: false }))}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalAsignacion.guardando}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {modalAsignacion.guardando ? 'Guardando...' : 'Confirmar Asignación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
