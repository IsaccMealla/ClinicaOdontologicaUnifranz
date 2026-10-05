import React, { useState } from 'react';
import { usePeriodontograma } from './PeriodontogramaContext';
import SuperiorVestibular from './periodontograma/SuperiorVestibular';
import SuperiorPalatino from './periodontograma/SuperiorPalatino';
import InferiorVestibular from './periodontograma/InferiorVestibular';
import InferiorPalatino from './periodontograma/InferiorPalatino';

export default function TabPeriodontogramaGrafico({ pacienteId, readOnly = false, onSaveSuccess }) {
    const { datos, setDatos, guardando, guardarPeriodontograma, calcularEstadisticas } = usePeriodontograma();
    const [mensaje, setMensaje] = useState(null);

    const stats = calcularEstadisticas();

    const handleGuardar = async () => {
        const ok = await guardarPeriodontograma(pacienteId);
        if (ok) {
            setMensaje({ tipo: 'exito', texto: 'Periodontograma guardado con éxito en el expediente.' });
            if (onSaveSuccess) onSaveSuccess();
        } else {
            setMensaje({ tipo: 'error', texto: 'Error al guardar el periodontograma. Verifique la conexión.' });
        }
        setTimeout(() => setMensaje(null), 4000);
    };

    return (
        <div className="w-full space-y-6">
            {/* BARRA SUPERIOR DE ESTADÍSTICAS PERIODONTALES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                        Sitios Evaluados
                    </span>
                    <span className="text-xl font-black text-slate-800 mt-1 block">
                        {stats.totalSitios}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">32 piezas x 6 sitios</span>
                </div>

                <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-rose-700 block tracking-wider">
                        Índice Sangrado (BOP)
                    </span>
                    <span className="text-xl font-black text-rose-800 mt-1 block">
                        {stats.bopPorcentaje}%
                    </span>
                    <span className="text-[11px] text-rose-600 font-medium">
                        {stats.sangradoSitios} sitios con sangrado
                    </span>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-amber-700 block tracking-wider">
                        Bolsas Patológicas
                    </span>
                    <span className="text-xl font-black text-amber-800 mt-1 block">
                        {stats.bolsasProfundas}
                    </span>
                    <span className="text-[11px] text-amber-600 font-medium">
                        Profundidad sondaje ≥ 4 mm
                    </span>
                </div>

                <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase text-teal-700 block tracking-wider">
                            Supuración
                        </span>
                        <span className="text-xl font-black text-teal-900 mt-1 block">
                            {stats.supPorcentaje}%
                        </span>
                    </div>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleGuardar}
                            disabled={guardando}
                            className="mt-2 w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            <span>{guardando ? 'Guardando...' : 'Guardar Periodonto'}</span>
                        </button>
                    )}
                </div>
            </div>

            {mensaje && (
                <div
                    className={`p-3.5 rounded-xl text-xs font-bold ${
                        mensaje.tipo === 'exito'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    {mensaje.texto}
                </div>
            )}

            {/* ARCADA SUPERIOR - VESTIBULAR */}
            <SuperiorVestibular readOnly={readOnly} />

            {/* ARCADA SUPERIOR - PALATINO */}
            <SuperiorPalatino readOnly={readOnly} />

            {/* ARCADA INFERIOR - VESTIBULAR */}
            <InferiorVestibular readOnly={readOnly} />

            {/* ARCADA INFERIOR - LINGUAL / PALATINO */}
            <InferiorPalatino readOnly={readOnly} />

            {/* DIAGNÓSTICO Y PRONÓSTICO PERIODONTAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                        Diagnóstico Periodontal AAP
                    </label>
                    <textarea
                        rows={3}
                        disabled={readOnly}
                        value={datos.diagnostico || ''}
                        onChange={(e) => setDatos({ ...datos, diagnostico: e.target.value })}
                        placeholder="Ej: Periodontitis Estadio II Grado B generalizada, o Gingivitis inducida por biofilm en periodonto intacto..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                        Pronóstico y Plan Periodontal
                    </label>
                    <textarea
                        rows={3}
                        disabled={readOnly}
                        value={datos.pronostico || ''}
                        onChange={(e) => setDatos({ ...datos, pronostico: e.target.value })}
                        placeholder="Ej: Favorable tras RAR e instrucción de higiene oral, mantenimiento cada 3 meses..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
