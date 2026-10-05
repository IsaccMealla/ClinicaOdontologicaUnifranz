import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AsignacionesIndex({ estudiantes = [], pacientes, pacientesSinAsignar = [], estadisticas, filtros }) {
    const [vista, setVista] = useState(filtros?.vista || 'estudiantes'); // 'estudiantes' | 'pacientes'
    const [buscar, setBuscar] = useState(filtros?.buscar || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros?.estado_asignacion || 'todos');

    // Estudiante seleccionado para asignar paciente desde la vista de estudiante
    const [modalAsignar, setModalAsignar] = useState({
        open: false,
        estudiante: null,
        pacienteId: '',
        motivo: '',
        guardando: false,
    });

    // Modal de confirmación para desasignar
    const [modalDesasignar, setModalDesasignar] = useState({
        open: false,
        paciente: null,
        motivo: '',
        guardando: false,
    });

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('asignaciones.index'), {
            vista,
            buscar: buscar || undefined,
            estado_asignacion: estadoFiltro !== 'todos' ? estadoFiltro : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleCambiarVista = (nuevaVista) => {
        setVista(nuevaVista);
        router.get(route('asignaciones.index'), {
            vista: nuevaVista,
            buscar: buscar || undefined,
            estado_asignacion: estadoFiltro !== 'todos' ? estadoFiltro : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleFiltroEstado = (nuevoEstado) => {
        setEstadoFiltro(nuevoEstado);
        router.get(route('asignaciones.index'), {
            vista,
            buscar: buscar || undefined,
            estado_asignacion: nuevoEstado !== 'todos' ? nuevoEstado : undefined,
        }, { preserveState: true, replace: true });
    };

    const abrirModalAsignarAEstudiante = (estudiante) => {
        setModalAsignar({
            open: true,
            estudiante,
            pacienteId: '',
            motivo: '',
            guardando: false,
        });
    };

    const ejecutarAsignacion = (e) => {
        e.preventDefault();
        if (!modalAsignar.estudiante || !modalAsignar.pacienteId) return;

        setModalAsignar(prev => ({ ...prev, guardando: true }));
        router.post(route('asignaciones.asignar'), {
            estudiante_id: modalAsignar.estudiante.id,
            paciente_id: modalAsignar.pacienteId,
            motivo: modalAsignar.motivo || 'Asignación desde módulo central',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setModalAsignar({
                    open: false,
                    estudiante: null,
                    pacienteId: '',
                    motivo: '',
                    guardando: false,
                });
            },
            onError: () => {
                setModalAsignar(prev => ({ ...prev, guardando: false }));
            }
        });
    };

    const ejecutarDesasignacion = (e) => {
        e.preventDefault();
        if (!modalDesasignar.paciente) return;

        setModalDesasignar(prev => ({ ...prev, guardando: true }));
        router.post(route('asignaciones.desasignar'), {
            paciente_id: modalDesasignar.paciente.id,
            motivo: modalDesasignar.motivo || 'Desasignación clínica',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setModalDesasignar({
                    open: false,
                    paciente: null,
                    motivo: '',
                    guardando: false,
                });
            },
            onError: () => {
                setModalDesasignar(prev => ({ ...prev, guardando: false }));
            }
        });
    };

    // Asignación directa desde la tabla de pacientes
    const handleAsignacionRapidaPaciente = (pacienteId, estudianteId) => {
        if (!estudianteId) {
            // Desasignar
            router.post(route('asignaciones.desasignar'), {
                paciente_id: pacienteId,
                motivo: 'Liberación rápida desde padrón',
            }, { preserveScroll: true });
        } else {
            router.post(route('asignaciones.asignar'), {
                paciente_id: pacienteId,
                estudiante_id: estudianteId,
                motivo: 'Asignación rápida desde padrón',
            }, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Módulo Central de Asignaciones</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Gestión de operadores odontológicos y distribución de cupos clínicos</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Selector de modo de vista */}
                        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                            <button
                                type="button"
                                onClick={() => handleCambiarVista('estudiantes')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                    vista === 'estudiantes'
                                        ? 'bg-white text-teal-700 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Por Estudiante</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCambiarVista('pacientes')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                    vista === 'pacientes'
                                        ? 'bg-white text-teal-700 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Por Paciente</span>
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Módulo de Asignaciones Clínicas" />

            <div className="space-y-6">
                {/* TARJETAS DE MÉTRICAS GLOBALES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pacientes</span>
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-2">{estadisticas.total_pacientes}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Registrados en padrón clínico</div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pacientes Asignados</span>
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-800 mt-2">{estadisticas.total_asignados}</div>
                        <div className="text-[11px] text-emerald-600 mt-1">Con operador activo en seguimiento</div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Sin Asignar (En Espera)</span>
                            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-800 mt-2">{estadisticas.total_sin_asignar}</div>
                        <div className="text-[11px] text-amber-600 mt-1">Requieren operador asignado</div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Estudiantes Operadores</span>
                            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-teal-900 mt-2">{estadisticas.total_estudiantes}</div>
                        <div className="text-[11px] text-teal-600 mt-1">Alumnos activos con cupo clínico</div>
                    </div>
                </div>

                {/* FILTROS Y BUSCADOR */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder={vista === 'estudiantes' ? "Buscar estudiante por nombre, código o email..." : "Buscar paciente por CI o nombre..."}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {vista === 'pacientes' && (
                            <div className="flex items-center space-x-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                                {['todos', 'sin_asignar', 'asignados'].map((est) => (
                                    <button
                                        key={est}
                                        type="button"
                                        onClick={() => handleFiltroEstado(est)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                                            estadoFiltro === est
                                                ? 'bg-white text-teal-700 shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {est === 'sin_asignar' ? 'Sin Asignar' : (est === 'asignados' ? 'Asignados' : 'Todos')}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* VISTA 1: POR ESTUDIANTE */}
                {vista === 'estudiantes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {estudiantes.length > 0 ? (
                            estudiantes.map((est) => (
                                <div
                                    key={est.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-xs transition flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                                                    {est.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{est.name}</h3>
                                                    <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono font-semibold border border-teal-200">
                                                        {est.codigo_institucional || 'Operador'}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {est.pacientes_asignados_count || 0} pacientes
                                            </span>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Pacientes a su cargo:
                                            </span>

                                            {est.pacientes_asignados && est.pacientes_asignados.length > 0 ? (
                                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                    {est.pacientes_asignados.map((pac) => (
                                                        <div
                                                            key={pac.id}
                                                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                                                        >
                                                            <div className="truncate mr-2">
                                                                <Link
                                                                    href={route('pacientes.show', pac.id)}
                                                                    className="font-semibold text-slate-800 hover:text-teal-700 transition"
                                                                >
                                                                    {pac.nombres} {pac.apellido_paterno}
                                                                </Link>
                                                                <div className="text-[10px] text-slate-400">CI: {pac.ci}</div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setModalDesasignar({
                                                                    open: true,
                                                                    paciente: pac,
                                                                    motivo: '',
                                                                    guardando: false,
                                                                })}
                                                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                                                                title="Desasignar paciente"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-50/60 rounded-xl">
                                                    Sin pacientes asignados actualmente
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => abrirModalAsignarAEstudiante(est)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Asignar Paciente</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                <p className="font-semibold text-slate-700">No se encontraron estudiantes operadores</p>
                                <p className="text-xs text-slate-400 mt-1">Verifica en el módulo de Usuarios que existan usuarios con el rol 'Estudiante'.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* VISTA 2: POR PACIENTE (LISTA Y REASIGNACIÓN EN LÍNEA) */}
                {vista === 'pacientes' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                    <tr>
                                        <th className="py-3.5 px-4">Paciente</th>
                                        <th className="py-3.5 px-4">Cédula / Edad</th>
                                        <th className="py-3.5 px-4">Estado Asignación</th>
                                        <th className="py-3.5 px-4">Operador Odontológico Asignado</th>
                                        <th className="py-3.5 px-4 text-right">Expediente</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pacientes.data.length > 0 ? (
                                        pacientes.data.map((paciente) => (
                                            <tr key={paciente.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-900 leading-tight">
                                                        {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                                                    </div>
                                                    <div className="text-xs text-slate-400 capitalize">{paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                                                </td>

                                                <td className="py-3.5 px-4 font-mono text-xs">
                                                    <div className="text-slate-900 font-semibold">{paciente.ci}</div>
                                                    <div className="text-slate-500 font-sans">{paciente.edad ? `${paciente.edad} años` : '-'}</div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {paciente.estudiante_asignado ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                            ● Asignado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                            ● Sin Asignar
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <select
                                                        value={paciente.estudiante_asignado_id || ''}
                                                        onChange={(e) => handleAsignacionRapidaPaciente(paciente.id, e.target.value)}
                                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition max-w-xs"
                                                    >
                                                        <option value="">-- Sin Asignar (Liberado) --</option>
                                                        {estudiantes.map((est) => (
                                                            <option key={est.id} value={est.id}>
                                                                {est.name} ({est.codigo_institucional || 'Alumno'}) - {est.pacientes_asignados_count || 0} pac.
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <Link
                                                        href={route('pacientes.show', paciente.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg border border-teal-200 transition"
                                                    >
                                                        <span>Ver</span>
                                                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate-400">
                                                No se encontraron pacientes para este filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pacientes.links && pacientes.links.length > 3 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <div>Total: {pacientes.total} pacientes</div>
                                <div className="flex space-x-1">
                                    {pacientes.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded-lg border transition ${
                                                link.active
                                                    ? 'bg-teal-600 text-white font-bold border-teal-600'
                                                    : link.url
                                                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL: ASIGNAR PACIENTE A ESTUDIANTE */}
            {modalAsignar.open && modalAsignar.estudiante && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Asignar Paciente</h3>
                                    <p className="text-xs text-slate-500">
                                        Operador: <strong className="text-teal-700">{modalAsignar.estudiante.name}</strong> ({modalAsignar.estudiante.codigo_institucional || 'Alumno'})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalAsignar(prev => ({ ...prev, open: false }))}
                                className="text-slate-400 hover:text-slate-600 p-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={ejecutarAsignacion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Seleccionar Paciente
                                </label>
                                <select
                                    value={modalAsignar.pacienteId}
                                    onChange={(e) => setModalAsignar(prev => ({ ...prev, pacienteId: e.target.value }))}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                >
                                    <option value="">-- Selecciona un paciente --</option>
                                    <optgroup label="Pacientes en espera (Sin Asignar):">
                                        {pacientesSinAsignar.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombres} {p.apellido_paterno} {p.apellido_materno || ''} - CI: {p.ci}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Motivo de la Asignación
                                </label>
                                <input
                                    type="text"
                                    value={modalAsignar.motivo}
                                    onChange={(e) => setModalAsignar(prev => ({ ...prev, motivo: e.target.value }))}
                                    placeholder="Ej: Distribución de sillón clínico, inicio de caso..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAsignar(prev => ({ ...prev, open: false }))}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalAsignar.guardando || !modalAsignar.pacienteId}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {modalAsignar.guardando ? 'Asignando...' : 'Confirmar Asignación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: DESASIGNAR / LIBERAR PACIENTE */}
            {modalDesasignar.open && modalDesasignar.paciente && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Liberar Paciente</h3>
                            <button
                                type="button"
                                onClick={() => setModalDesasignar(prev => ({ ...prev, open: false }))}
                                className="text-slate-400 hover:text-slate-600 p-1.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-xs text-slate-600">
                            ¿Estás seguro de que deseas retirar la asignación del paciente{' '}
                            <strong>{modalDesasignar.paciente.nombres} {modalDesasignar.paciente.apellido_paterno}</strong>? El paciente volverá a la lista de espera general.
                        </p>

                        <form onSubmit={ejecutarDesasignacion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Motivo de la Liberación
                                </label>
                                <input
                                    type="text"
                                    value={modalDesasignar.motivo}
                                    onChange={(e) => setModalDesasignar(prev => ({ ...prev, motivo: e.target.value }))}
                                    placeholder="Ej: Paciente concluyó fase clínica, abandono, rotación..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalDesasignar(prev => ({ ...prev, open: false }))}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalDesasignar.guardando}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {modalDesasignar.guardando ? 'Liberando...' : 'Liberar Paciente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
