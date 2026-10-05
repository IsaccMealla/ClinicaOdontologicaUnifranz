import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function HistoriasClinicasIndex({ historias, filtros }) {
    const [buscar, setBuscar] = useState(filtros?.buscar || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros?.estado || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('historias-clinicas.index'), {
            buscar: buscar || undefined,
            estado: estadoFiltro || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleFilterEstado = (estado) => {
        const nuevo = estadoFiltro === estado ? '' : estado;
        setEstadoFiltro(nuevo);
        router.get(route('historias-clinicas.index'), {
            buscar: buscar || undefined,
            estado: nuevo || undefined,
        }, { preserveState: true, replace: true });
    };

    const estadoBadges = {
        borrador: 'bg-slate-100 text-slate-700 border-slate-200',
        en_revision: 'bg-amber-100 text-amber-800 border-amber-200',
        aprobada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        aprobado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        rechazada: 'bg-rose-100 text-rose-800 border-rose-200',
        rechazado: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Historias Clínicas Odontológicas (HC-001)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Expedientes oficiales, examen estomatológico regional y flujo de aprobación</p>
                    </div>
                    <Link
                        href={route('historias-clinicas.create')}
                        className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Redactar Nueva HC-001</span>
                    </Link>
                </div>
            }
        >
            <Head title="Historias Clínicas HC-001" />

            <div className="space-y-5">
                {/* Filtros y Buscador */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar por N° de Expediente, Paciente o Diagnóstico..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
                        >
                            Buscar
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Filtrar por Estado:</span>
                        {['borrador', 'en_revision', 'aprobada', 'rechazada'].map((est) => (
                            <button
                                key={est}
                                type="button"
                                onClick={() => handleFilterEstado(est)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg border capitalize transition ${
                                    estadoFiltro === est
                                        ? 'bg-teal-100 text-teal-800 border-teal-300 ring-2 ring-teal-400/30'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                ● {est.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Listado de Historias Clínicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historias.data.length > 0 ? (
                        historias.data.map((hc) => (
                            <div
                                key={hc.id}
                                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                                            {hc.numero_expediente}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${estadoBadges[hc.estado] || 'bg-slate-100'}`}>
                                            ● {hc.estado.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase">Paciente:</div>
                                        <Link
                                            href={route('pacientes.show', hc.paciente.id)}
                                            className="text-base font-bold text-slate-900 hover:text-teal-700 transition"
                                        >
                                            {hc.paciente.nombres} {hc.paciente.apellido_paterno}
                                        </Link>
                                        <div className="text-xs text-slate-400">CI: {hc.paciente.ci}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase">Motivo de Consulta:</div>
                                        <p className="text-xs text-slate-700 line-clamp-2 mt-0.5">{hc.motivo_consulta}</p>
                                    </div>

                                    {hc.diagnostico_definitivo && (
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                            <span className="font-bold text-slate-700">Dx Definitivo:</span>{' '}
                                            <span className="text-slate-600 line-clamp-1">{hc.diagnostico_definitivo}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 truncate max-w-[150px]">
                                        Alumno: {hc.estudiante?.name || '-'}
                                    </span>
                                    <Link
                                        href={route('historias-clinicas.show', hc.id)}
                                        className="font-bold text-teal-600 hover:text-teal-800 flex items-center"
                                    >
                                        <span>Ver Detalle</span>
                                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                            <p className="font-semibold text-slate-700">No se encontraron historias clínicas</p>
                            <p className="text-xs text-slate-400 mt-1">Crea una nueva HC-001 vinculada a un paciente.</p>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {historias.links && historias.links.length > 3 && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Total: <span className="font-semibold">{historias.total}</span> historias clínicas
                        </div>
                        <div className="flex space-x-1">
                            {historias.links.map((link, i) => (
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
        </AuthenticatedLayout>
    );
}
