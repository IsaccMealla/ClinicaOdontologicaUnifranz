import React, { useState } from 'react';

// Catálogo estándar pre-cargado de códigos diagnósticos CIE-10 y CDT-2
export const CATALOGO_CODIGOS_ESTANDAR = [
    { codigo: 'K02.0', estandar: 'CIE-10', descripcion: 'Caries limitada al esmalte (mancha blanca)' },
    { codigo: 'K02.1', estandar: 'CIE-10', descripcion: 'Caries de la dentina (cavitada)' },
    { codigo: 'K02.2', estandar: 'CIE-10', descripcion: 'Caries del cemento radicular' },
    { codigo: 'K04.0', estandar: 'CIE-10', descripcion: 'Pulpitis reversible / irreversible' },
    { codigo: 'K04.1', estandar: 'CIE-10', descripcion: 'Necrosis de la pulpa dental' },
    { codigo: 'K04.4', estandar: 'CIE-10', descripcion: 'Periodontitis apical aguda de origen pulpar' },
    { codigo: 'K04.5', estandar: 'CIE-10', descripcion: 'Periodontitis apical crónica (granuloma / quiste apical)' },
    { codigo: 'K05.0', estandar: 'CIE-10', descripcion: 'Gingivitis aguda' },
    { codigo: 'K05.1', estandar: 'CIE-10', descripcion: 'Gingivitis crónica localizada / generalizada' },
    { codigo: 'K05.3', estandar: 'CIE-10', descripcion: 'Periodontitis crónica' },
    { codigo: 'K07.2', estandar: 'CIE-10', descripcion: 'Anomalías de la relación entre los arcos dentarios (Maloclusión)' },
    { codigo: 'K08.1', estandar: 'CIE-10', descripcion: 'Pérdida de dientes por extracción o traumatismo' },
    { codigo: 'CDT-D0120', estandar: 'CDT-2', descripcion: 'Evaluación y examen oral periódico' },
    { codigo: 'CDT-D1110', estandar: 'CDT-2', descripcion: 'Profilaxis dental completa - Adulto' },
    { codigo: 'CDT-D2391', estandar: 'CDT-2', descripcion: 'Restauración con resina compuesta - 1 superficie, posterior' },
    { codigo: 'CDT-D2392', estandar: 'CDT-2', descripcion: 'Restauración con resina compuesta - 2 superficies, posterior' },
    { codigo: 'CDT-D2330', estandar: 'CDT-2', descripcion: 'Restauración con resina compuesta - 1 superficie, anterior' },
    { codigo: 'CDT-D3310', estandar: 'CDT-2', descripcion: 'Tratamiento endodóntico (conducto) - Pieza anterior' },
    { codigo: 'CDT-D3320', estandar: 'CDT-2', descripcion: 'Tratamiento endodóntico (conducto) - Pieza bicúspide' },
    { codigo: 'CDT-D3330', estandar: 'CDT-2', descripcion: 'Tratamiento endodóntico (conducto) - Pieza molar' },
    { codigo: 'CDT-D4341', estandar: 'CDT-2', descripcion: 'Raspaje y alisado radicular periodontal - por cuadrante' },
    { codigo: 'CDT-D7140', estandar: 'CDT-2', descripcion: 'Extracción de diente erupcionado o resto radicular' },
];

export default function TabDiagnosticoYPlanTratamiento({
    diagnosticos = [],
    planTratamiento = [],
    odontologiaForense = {},
    onActualizarDiagnosticos,
    onActualizarPlanTratamiento,
    onActualizarForense,
    readOnly = false,
}) {
    const [subSeccion, setSubSeccion] = useState('plan'); // 'diagnosticos' | 'plan' | 'forense'

    // Formulario de nuevo diagnóstico
    const [nuevoDiag, setNuevoDiag] = useState({
        codigo: 'K02.1',
        estandar: 'CIE-10',
        descripcion: 'Caries de la dentina (cavitada)',
        pieza: '',
        tipo: 'Dental / Cavitaria',
        prioridad: 'Urgente',
    });

    // Formulario de nuevo procedimiento del Plan de Tratamiento
    const [nuevoProc, setNuevoProc] = useState({
        procedimiento: '',
        pieza: '',
        diagnostico_codigo: 'K02.1',
        prioridad: 'Prioritario',
        costo_estimado: '',
        estado: 'Propuesto',
    });

    const handleSelectCodigoEstandar = (codigoStr) => {
        const item = CATALOGO_CODIGOS_ESTANDAR.find((c) => c.codigo === codigoStr);
        if (item) {
            setNuevoDiag({
                ...nuevoDiag,
                codigo: item.codigo,
                estandar: item.estandar,
                descripcion: item.descripcion,
            });
        }
    };

    const handleAgregarDiagnostico = (e) => {
        e.preventDefault();
        if (!nuevoDiag.descripcion) return;

        const diagItem = {
            id: 'diag-' + Date.now(),
            ...nuevoDiag,
        };

        const nuevaLista = [...diagnosticos, diagItem];
        onActualizarDiagnosticos(nuevaLista);
        setNuevoDiag({
            codigo: 'K02.1',
            estandar: 'CIE-10',
            descripcion: 'Caries de la dentina (cavitada)',
            pieza: '',
            tipo: 'Dental / Cavitaria',
            prioridad: 'Urgente',
        });
    };

    const handleEliminarDiagnostico = (id) => {
        if (readOnly) return;
        const filtrados = diagnosticos.filter((d) => d.id !== id);
        onActualizarDiagnosticos(filtrados);
    };

    const handleAgregarProcedimiento = (e) => {
        e.preventDefault();
        if (!nuevoProc.procedimiento) return;

        const ordenNuevo = planTratamiento.length + 1;
        const itemPlan = {
            id: 'proc-' + Date.now(),
            orden: ordenNuevo,
            ...nuevoProc,
            costo_estimado: Number(nuevoProc.costo_estimado) || 0,
        };

        const nuevaLista = [...planTratamiento, itemPlan];
        onActualizarPlanTratamiento(nuevaLista);
        setNuevoProc({
            procedimiento: '',
            pieza: '',
            diagnostico_codigo: 'K02.1',
            prioridad: 'Prioritario',
            costo_estimado: '',
            estado: 'Propuesto',
        });
    };

    const handleCambiarEstadoProcedimiento = (id, nuevoEstado) => {
        if (readOnly) return;
        const actualizados = planTratamiento.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p));
        onActualizarPlanTratamiento(actualizados);
    };

    const handleEliminarProcedimiento = (id) => {
        if (readOnly) return;
        const filtrados = planTratamiento
            .filter((p) => p.id !== id)
            .map((p, idx) => ({ ...p, orden: idx + 1 }));
        onActualizarPlanTratamiento(filtrados);
    };

    const totalPresupuesto = planTratamiento.reduce((sum, p) => sum + (Number(p.costo_estimado) || 0), 0);

    return (
        <div className="space-y-6">
            {/* SUB-NAVEGACIÓN INTERNA: DIAGNÓSTICOS, PLAN NUMERADO Y FORENSE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                    type="button"
                    onClick={() => setSubSeccion('diagnosticos')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                        subSeccion === 'diagnosticos'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>1. Diagnósticos (CIE-10 / CDT-2)</span>
                    <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] rounded-full font-extrabold">
                        {diagnosticos.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubSeccion('plan')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                        subSeccion === 'plan'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>2. Plan de Tratamiento (Secuencia)</span>
                    <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] rounded-full font-extrabold">
                        {planTratamiento.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubSeccion('forense')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                        subSeccion === 'forense'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <span>3. Odontología Legal y Forense</span>
                </button>
            </div>

            {/* SECCIÓN 1: REGISTRO DE DIAGNÓSTICOS ESTANDARIZADOS CIE-10 / CDT-2 */}
            {subSeccion === 'diagnosticos' && (
                <div className="space-y-5">
                    {!readOnly && (
                        <form onSubmit={handleAgregarDiagnostico} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                                        +
                                    </span>
                                    <span>Vincular Nuevo Diagnóstico con Código Estándar</span>
                                </h4>
                                <span className="text-[11px] text-slate-500">Norma obligatoria CDT-2 / CIE-10</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 uppercase mb-1">
                                        Seleccionar Código Estándar (CIE-10 / CDT-2) *
                                    </label>
                                    <select
                                        value={nuevoDiag.codigo}
                                        onChange={(e) => handleSelectCodigoEstandar(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    >
                                        <optgroup label="CIE-10 (Enfermedades Bucales & Sistémicas)">
                                            {CATALOGO_CODIGOS_ESTANDAR.filter((c) => c.estandar === 'CIE-10').map((c) => (
                                                <option key={c.codigo} value={c.codigo}>
                                                    {c.codigo} - {c.descripcion}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="CDT-2 (Terminología y Procedimientos Dentales)">
                                            {CATALOGO_CODIGOS_ESTANDAR.filter((c) => c.estandar === 'CDT-2').map((c) => (
                                                <option key={c.codigo} value={c.codigo}>
                                                    {c.codigo} - {c.descripcion}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Pieza Dental FDI</label>
                                    <input
                                        type="text"
                                        value={nuevoDiag.pieza}
                                        onChange={(e) => setNuevoDiag({ ...nuevoDiag, pieza: e.target.value })}
                                        placeholder="Ej: 16, 21 o General"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Prioridad Diagnóstica</label>
                                    <select
                                        value={nuevoDiag.prioridad}
                                        onChange={(e) => setNuevoDiag({ ...nuevoDiag, prioridad: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="Urgente">Urgente (Dolor / Infección)</option>
                                        <option value="Prioritario">Prioritario</option>
                                        <option value="Electivo">Electivo / Estético</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block font-bold text-slate-700 uppercase mb-1">
                                        Descripción Clínica / Hallazgo
                                    </label>
                                    <input
                                        type="text"
                                        value={nuevoDiag.descripcion}
                                        onChange={(e) => setNuevoDiag({ ...nuevoDiag, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                                    >
                                        + Agregar Diagnóstico
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Tabla de Diagnósticos Registrados */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Código & Estándar</th>
                                    <th className="py-3 px-4">Descripción del Diagnóstico</th>
                                    <th className="py-3 px-4">Pieza Dental</th>
                                    <th className="py-3 px-4">Prioridad</th>
                                    {!readOnly && <th className="py-3 px-4 text-right">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {diagnosticos.length > 0 ? (
                                    diagnosticos.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                        {d.codigo}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        ({d.estandar})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">{d.descripcion}</td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                {d.pieza ? `#${d.pieza}` : 'Arcada general'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        d.prioridad === 'Urgente'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : d.prioridad === 'Prioritario'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-teal-50 text-teal-700 border-teal-200'
                                                    }`}
                                                >
                                                    ● {d.prioridad}
                                                </span>
                                            </td>
                                            {!readOnly && (
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarDiagnostico(d.id)}
                                                        className="text-rose-500 hover:text-rose-700 font-bold p-1 rounded hover:bg-rose-50"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            No se han vinculado diagnósticos codificados aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: PLAN DE TRATAMIENTO EN SECUENCIA NUMERADA */}
            {subSeccion === 'plan' && (
                <div className="space-y-5">
                    {/* Resumen del Presupuesto */}
                    <div className="p-4 bg-teal-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                        <div>
                            <span className="text-xs font-bold text-teal-300 uppercase block">Plan de Tratamiento Odontológico (PdT)</span>
                            <p className="text-xs text-slate-200 mt-0.5">
                                Secuencia numerada de procedimientos vinculados a piezas dentales y diagnósticos
                            </p>
                        </div>
                        <div className="text-right bg-white/10 px-4 py-2 rounded-xl border border-white/15">
                            <span className="text-[10px] text-teal-200 font-bold uppercase block">Presupuesto Estimado</span>
                            <span className="text-lg font-mono font-extrabold text-white">
                                Bs {totalPresupuesto.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {!readOnly && (
                        <form onSubmit={handleAgregarProcedimiento} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                                    +
                                </span>
                                <span>Añadir Procedimiento a la Secuencia</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 uppercase mb-1">
                                        Procedimiento Propuesto *
                                    </label>
                                    <input
                                        type="text"
                                        value={nuevoProc.procedimiento}
                                        onChange={(e) => setNuevoProc({ ...nuevoProc, procedimiento: e.target.value })}
                                        placeholder="Ej: Obturación con resina nanohíbrida, destartraje..."
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Pieza Dental</label>
                                    <input
                                        type="text"
                                        value={nuevoProc.pieza}
                                        onChange={(e) => setNuevoProc({ ...nuevoProc, pieza: e.target.value })}
                                        placeholder="Ej: 16 o General"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Priorización</label>
                                    <select
                                        value={nuevoProc.prioridad}
                                        onChange={(e) => setNuevoProc({ ...nuevoProc, prioridad: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="Urgente">Urgente</option>
                                        <option value="Prioritario">Prioritario</option>
                                        <option value="Electivo">Electivo</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 uppercase mb-1">
                                        Diagnóstico Asociado
                                    </label>
                                    <select
                                        value={nuevoProc.diagnostico_codigo}
                                        onChange={(e) => setNuevoProc({ ...nuevoProc, diagnostico_codigo: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    >
                                        {diagnosticos.length > 0 ? (
                                            diagnosticos.map((d) => (
                                                <option key={d.id} value={`${d.codigo} - ${d.descripcion}`}>
                                                    {d.codigo} - {d.descripcion} {d.pieza ? `(Pieza ${d.pieza})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="K02.1 - Caries dentina">K02.1 - Caries dentina</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase mb-1">Arancel Estimado (Bs)</label>
                                    <input
                                        type="number"
                                        value={nuevoProc.costo_estimado}
                                        onChange={(e) => setNuevoProc({ ...nuevoProc, costo_estimado: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                                    >
                                        + Añadir a Secuencia
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Secuencia Numerada del Plan */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                            <span>Secuencia Cronológica Numerada de Procedimientos</span>
                            <span className="text-[11px] text-slate-500">{planTratamiento.length} pasos planificados</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {planTratamiento.length > 0 ? (
                                planTratamiento.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center shrink-0 border border-teal-200">
                                                {item.orden}
                                            </span>
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {item.procedimiento}
                                                </div>
                                                <div className="text-slate-500 flex flex-wrap items-center gap-2">
                                                    <span>Pieza: <strong className="text-slate-800">{item.pieza || 'General'}</strong></span>
                                                    <span>•</span>
                                                    <span>Diagnóstico: <strong className="text-teal-700">{item.diagnostico_codigo}</strong></span>
                                                    <span>•</span>
                                                    <span>Arancel: <strong className="text-slate-900 font-mono">Bs {Number(item.costo_estimado || 0).toFixed(2)}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    item.prioridad === 'Urgente'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : item.prioridad === 'Prioritario'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-200'
                                                }`}
                                            >
                                                {item.prioridad}
                                            </span>

                                            <select
                                                disabled={readOnly}
                                                value={item.estado}
                                                onChange={(e) => handleCambiarEstadoProcedimiento(item.id, e.target.value)}
                                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-teal-500"
                                            >
                                                <option value="Propuesto">Propuesto</option>
                                                <option value="En curso">En curso</option>
                                                <option value="Completado">Completado</option>
                                                <option value="Rechazado">Rechazado</option>
                                            </select>

                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarProcedimiento(item.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                                    title="Eliminar paso"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    No hay procedimientos planificados en la secuencia aún.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 3: ODONTOLOGÍA LEGAL Y FORENSE (Punto 5 del Módulo 2) */}
            {subSeccion === 'forense' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-5 shadow-xs">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">Documento de Odontología Legal y Forense</h4>
                            <p className="text-xs text-slate-500">
                                Registro estructurado de características dentales únicas para la identificación forense oficial
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Tatuajes de Amalgama / Pigmentaciones Metálicas
                            </label>
                            <textarea
                                rows="2"
                                disabled={readOnly}
                                value={odontologiaForense?.tatuajes_amalgama || ''}
                                onChange={(e) => onActualizarForense('tatuajes_amalgama', e.target.value)}
                                placeholder="Ubicación, tamaño en mm y características de manchas por amalgama..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Restauraciones Complejas o Atípicas
                            </label>
                            <textarea
                                rows="2"
                                disabled={readOnly}
                                value={odontologiaForense?.restauraciones_complejas || ''}
                                onChange={(e) => onActualizarForense('restauraciones_complejas', e.target.value)}
                                placeholder="Incrustaciones metálicas, pines de retención, endopostes..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Anomalías Dentarias de Forma, Tamaño o Número
                            </label>
                            <textarea
                                rows="2"
                                disabled={readOnly}
                                value={odontologiaForense?.anomalias_dentarias || ''}
                                onChange={(e) => onActualizarForense('anomalias_dentarias', e.target.value)}
                                placeholder="Microdoncia, dens in dente, cúspides accesorias, agenesias..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Rugoscopía Palatina & Marcas Protésicas
                            </label>
                            <textarea
                                rows="2"
                                disabled={readOnly}
                                value={odontologiaForense?.rugoscopia_marcas || ''}
                                onChange={(e) => onActualizarForense('rugoscopia_marcas', e.target.value)}
                                placeholder="Disposición de rugas palatinas o grabado identificatorio en prótesis..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 uppercase mb-1">
                                Observaciones Forenses Adicionales para Cotejo Identificatorio
                            </label>
                            <textarea
                                rows="2"
                                disabled={readOnly}
                                value={odontologiaForense?.observaciones_forenses || ''}
                                onChange={(e) => onActualizarForense('observaciones_forenses', e.target.value)}
                                placeholder="Notas médico-legales, desgastes ocupacionales o hábitos para identificación..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
