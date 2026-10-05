import React from 'react';
import BotonSwitch from './BotonSwitch';

export default function TabPeriodoncia({ formData, onChange, readOnly = false }) {
    const antecedentes = formData?.antecedentes_periodontales || {};
    const examen = formData?.examen_periodontal || {};

    const sintomas = [
        { id: 'sangrado_espontaneo', label: 'Sangrado Espontáneo' },
        { id: 'sangrado_provocado', label: 'Sangrado Provocado (al cepillado/hilo)' },
        { id: 'movilidad', label: 'Movilidad Dental' },
        { id: 'se_han_separado', label: '¿Se han separado los dientes?' },
        { id: 'se_han_elongado', label: '¿Se han elongado los dientes?' },
        { id: 'halitosis', label: 'Halitosis (Mal aliento)' },
    ];

    return (
        <div className="w-full space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
            {/* --- 1. ANTECEDENTES PERIODONTALES (SÍNTOMAS) --- */}
            <div>
                <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
                    <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Antecedentes Periodontales (Síntomas y Signos Clínicos)
                    </h3>
                    <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        Tejidos de Soporte
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-rose-200/70 rounded-2xl bg-rose-50/30">
                    {sintomas.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition ${
                                antecedentes[item.id]
                                    ? 'bg-rose-100/70 border border-rose-300'
                                    : 'bg-white border border-rose-100 hover:bg-rose-50/50'
                            }`}
                        >
                            <BotonSwitch
                                checked={antecedentes[item.id] || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange('antecedentes_periodontales', item.id, c)}
                            />
                            <label className="cursor-pointer text-xs font-semibold text-slate-700">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 2. EXAMEN FÍSICO PERIODONTAL --- */}
            <div className="pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                        Examen Físico Periodontal de la Encía
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Color de la Encía</label>
                        <input
                            type="text"
                            disabled={readOnly}
                            value={examen.color || ''}
                            onChange={(e) => onChange('examen_periodontal', 'color', e.target.value)}
                            placeholder="Ej: Rosa coral, enrojecida, eritematosa, cianótica..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Textura</label>
                        <input
                            type="text"
                            disabled={readOnly}
                            value={examen.textura || ''}
                            onChange={(e) => onChange('examen_periodontal', 'textura', e.target.value)}
                            placeholder="Ej: Punteado de cáscara de naranja, lisa, brillante..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Consistencia</label>
                        <input
                            type="text"
                            disabled={readOnly}
                            value={examen.consistencia || ''}
                            onChange={(e) => onChange('examen_periodontal', 'consistencia', e.target.value)}
                            placeholder="Ej: Firme y resiliente, edematosa, blanda, friable..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-3">
                        <label className="text-xs font-bold text-slate-700 uppercase">Otras Características de la Encía</label>
                        <textarea
                            rows={3}
                            disabled={readOnly}
                            value={examen.caracteristica_encia || ''}
                            onChange={(e) => onChange('examen_periodontal', 'caracteristica_encia', e.target.value)}
                            placeholder="Describa contornos marginales, festoneado, pérdida de papilas interdentales, presencia de exudado purulento, agrandamientos gingivales..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
