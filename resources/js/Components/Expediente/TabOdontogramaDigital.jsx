import React, { useState, useMemo } from 'react';

// Piezas dentales según norma FDI
const DIENTES_ADULTO = {
    superiorDerecho: [18, 17, 16, 15, 14, 13, 12, 11],
    superiorIzquierdo: [21, 22, 23, 24, 25, 26, 27, 28],
    inferiorIzquierdo: [38, 37, 36, 35, 34, 33, 32, 31],
    inferiorDerecho: [41, 42, 43, 44, 45, 46, 47, 48],
};

const DIENTES_TEMPORAL = {
    superiorDerecho: [55, 54, 53, 52, 51],
    superiorIzquierdo: [61, 62, 63, 64, 65],
    inferiorIzquierdo: [75, 74, 73, 72, 71],
    inferiorDerecho: [81, 82, 83, 84, 85],
};

// Estados y patologías clínicas con su codificación visual
export const ESTADOS_ODONTOGRAMA = [
    { id: 'sano', label: 'Sano / Normal', color: '#F8FAFC', border: '#CBD5E1', text: '#334155' },
    { id: 'caries', label: 'Caries Activa', color: '#EF4444', border: '#DC2626', text: '#FFFFFF', tipo: 'patologia' },
    { id: 'obturacion_resina', label: 'Obturación Resina', color: '#2563EB', border: '#1D4ED8', text: '#FFFFFF', tipo: 'tratamiento_realizado' },
    { id: 'obturacion_amalgama', label: 'Obturación Amalgama', color: '#64748B', border: '#475569', text: '#FFFFFF', tipo: 'tratamiento_realizado' },
    { id: 'corona', label: 'Corona Protésica', color: '#F59E0B', border: '#D97706', text: '#FFFFFF', tipo: 'tratamiento_realizado' },
    { id: 'ausente', label: 'Pieza Ausente', color: '#0F172A', border: '#0F172A', text: '#FFFFFF', tipo: 'ausencia' },
    { id: 'implante', label: 'Implante Dental', color: '#10B981', border: '#059669', text: '#FFFFFF', tipo: 'implante' },
    { id: 'fractura', label: 'Fractura Dental', color: '#8B5CF6', border: '#7C3AED', text: '#FFFFFF', tipo: 'patologia' },
    { id: 'propuesto_resina', label: 'Tratamiento Propuesto (Resina)', color: '#93C5FD', border: '#3B82F6', text: '#1E3A8A', tipo: 'tratamiento_propuesto' },
    { id: 'propuesto_exodoncia', label: 'Propuesto Exodoncia', color: '#FECACA', border: '#EF4444', text: '#991B1B', tipo: 'tratamiento_propuesto' },
];

export default function TabOdontogramaDigital({
    odontogramaData = {},
    onChange,
    readOnly = false,
    pacienteEdad = 25,
}) {
    // Tipo de dentición seleccionada (Adulto o Temporal)
    const [tipoDenticion, setTipoDenticion] = useState(pacienteEdad <= 12 ? 'temporal' : 'adulto');
    // Herramienta activa para pintar caras o piezas
    const [herramientaActiva, setHerramientaActiva] = useState('caries');
    // Diente seleccionado para ver detalle/historial de modificaciones
    const [dienteSeleccionado, setDienteSeleccionado] = useState(null);

    // Estado interno del odontograma: { [fdi]: { caras: { oclusal, vestibular, lingual, mesial, distal }, general: 'ausente'|'implante', ultima_fecha: '...' } }
    const datosDientes = odontogramaData?.dientes || {};

    const handleCarasClick = (fdi, cara) => {
        if (readOnly) return;

        const dienteActual = datosDientes[fdi] || {
            caras: { oclusal: 'sano', vestibular: 'sano', lingual: 'sano', mesial: 'sano', distal: 'sano' },
            general: null,
            ultima_fecha: null,
        };

        const nuevoEstadoCara = dienteActual.caras?.[cara] === herramientaActiva ? 'sano' : herramientaActiva;

        const nuevoDiente = {
            ...dienteActual,
            caras: {
                ...(dienteActual.caras || {}),
                [cara]: nuevoEstadoCara,
            },
            general: ['ausente', 'implante', 'corona'].includes(herramientaActiva) ? herramientaActiva : dienteActual.general,
            ultima_fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        if (herramientaActiva === 'sano') {
            nuevoDiente.caras[cara] = 'sano';
            nuevoDiente.general = null;
        }

        const nuevosDientes = {
            ...datosDientes,
            [fdi]: nuevoDiente,
        };

        onChange('odontograma', {
            tipo_denticion: tipoDenticion,
            dientes: nuevosDientes,
            ultima_modificacion: new Date().toISOString(),
        });

        setDienteSeleccionado(fdi);
    };

    const handleDienteGeneralClick = (fdi, estado) => {
        if (readOnly) return;

        const dienteActual = datosDientes[fdi] || {};
        const nuevoGeneral = dienteActual.general === estado ? null : estado;

        const nuevoDiente = {
            ...dienteActual,
            general: nuevoGeneral,
            ultima_fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        const nuevosDientes = {
            ...datosDientes,
            [fdi]: nuevoDiente,
        };

        onChange('odontograma', {
            tipo_denticion: tipoDenticion,
            dientes: nuevosDientes,
            ultima_modificacion: new Date().toISOString(),
        });

        setDienteSeleccionado(fdi);
    };

    // Cálculo de índices diagnósticos automáticos (CPO-D)
    const metricasCpo = useMemo(() => {
        let cariados = 0;
        let perdidos = 0;
        let obturados = 0;

        Object.entries(datosDientes).forEach(([_, d]) => {
            if (d.general === 'ausente') {
                perdidos++;
                return;
            }
            const caras = Object.values(d.caras || {});
            if (caras.some((c) => c === 'caries')) {
                cariados++;
            } else if (caras.some((c) => c === 'obturacion_resina' || c === 'obturacion_amalgama')) {
                obturados++;
            }
        });

        return {
            cariados,
            perdidos,
            obturados,
            totalCpo: cariados + perdidos + obturados,
        };
    }, [datosDientes]);

    const cuadrantes = tipoDenticion === 'adulto' ? DIENTES_ADULTO : DIENTES_TEMPORAL;

    const renderDienteSvg = (fdi, esSuperior = true) => {
        const info = datosDientes[fdi] || {};
        const caras = info.caras || {};
        const general = info.general;

        const getColorCara = (caraKey) => {
            const estadoId = caras[caraKey] || 'sano';
            const est = ESTADOS_ODONTOGRAMA.find((e) => e.id === estadoId);
            return est ? est.color : '#F8FAFC';
        };

        const esAusente = general === 'ausente';
        const esImplante = general === 'implante';
        const esCorona = general === 'corona';

        return (
            <div
                key={fdi}
                className={`flex flex-col items-center p-1.5 rounded-xl border transition-all select-none ${
                    dienteSeleccionado === fdi
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
                onClick={() => setDienteSeleccionado(fdi)}
            >
                {/* Número FDI de la pieza dental */}
                <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-slate-700 px-0.5 mb-1">
                    <span>#{fdi}</span>
                    {info.ultima_fecha && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title={`Modificado: ${info.ultima_fecha}`} />
                    )}
                </div>

                {/* Gráfico SVG interactivo con las 5 caras anatómicas */}
                <div className="relative w-11 h-11">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xs">
                        {/* Cara Superior (Vestibular en Sup / Lingual en Inf) */}
                        <polygon
                            points="0,0 100,0 75,25 25,25"
                            fill={getColorCara(esSuperior ? 'vestibular' : 'lingual')}
                            stroke="#94A3B8"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCarasClick(fdi, esSuperior ? 'vestibular' : 'lingual');
                            }}
                        />

                        {/* Cara Derecha (Distal o Mesial según cuadrante) */}
                        <polygon
                            points="100,0 100,100 75,75 75,25"
                            fill={getColorCara('distal')}
                            stroke="#94A3B8"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCarasClick(fdi, 'distal');
                            }}
                        />

                        {/* Cara Inferior (Palatino en Sup / Vestibular en Inf) */}
                        <polygon
                            points="0,100 100,100 75,75 25,75"
                            fill={getColorCara(esSuperior ? 'lingual' : 'vestibular')}
                            stroke="#94A3B8"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCarasClick(fdi, esSuperior ? 'lingual' : 'vestibular');
                            }}
                        />

                        {/* Cara Izquierda (Mesial) */}
                        <polygon
                            points="0,0 0,100 25,75 25,25"
                            fill={getColorCara('mesial')}
                            stroke="#94A3B8"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCarasClick(fdi, 'mesial');
                            }}
                        />

                        {/* Cara Centro (Oclusal / Incisal) */}
                        <polygon
                            points="25,25 75,25 75,75 25,75"
                            fill={getColorCara('oclusal')}
                            stroke="#94A3B8"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCarasClick(fdi, 'oclusal');
                            }}
                        />

                        {/* Superposición gráfica de Pieza Ausente (Cruz) */}
                        {esAusente && (
                            <g stroke="#0F172A" strokeWidth="6" strokeLinecap="round">
                                <line x1="10" y1="10" x2="90" y2="90" />
                                <line x1="90" y1="10" x2="10" y2="90" />
                            </g>
                        )}

                        {/* Superposición gráfica de Implante */}
                        {esImplante && (
                            <circle cx="50" cy="50" r="18" fill="#10B981" stroke="#065F46" strokeWidth="3" />
                        )}

                        {/* Superposición de Corona Protésica */}
                        {esCorona && (
                            <rect x="15" y="15" width="70" height="70" fill="none" stroke="#D97706" strokeWidth="4" rx="8" />
                        )}
                    </svg>
                </div>

                {/* Acciones directas por pieza */}
                <div className="flex items-center gap-1 mt-1 text-[9px]">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDienteGeneralClick(fdi, 'ausente');
                        }}
                        title="Marcar como Ausente"
                        className={`px-1 py-0.2 rounded font-bold border ${
                            esAusente ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                        X
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDienteGeneralClick(fdi, 'corona');
                        }}
                        title="Marcar Corona"
                        className={`px-1 py-0.2 rounded font-bold border ${
                            esCorona ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                        C
                    </button>
                </div>
            </div>
        );
    };

    const dienteDetalle = dienteSeleccionado ? datosDientes[dienteSeleccionado] : null;

    return (
        <div className="space-y-6">
            {/* BARRA SUPERIOR: SELECTOR DE DENTICIÓN & RESUMEN CPO-D */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">Tipo de Dentición:</span>
                    <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setTipoDenticion('adulto')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                tipoDenticion === 'adulto'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Dentición Adulta (Permanente - 32)
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoDenticion('temporal')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                tipoDenticion === 'temporal'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Dentición Temporal (Decidua - 20)
                        </button>
                    </div>
                </div>

                {/* Índice CPO-D Automatizado */}
                <div className="flex items-center gap-3 text-xs bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Índice CPO-D:</span>
                    <span className="font-mono font-bold text-slate-800">
                        Total: <span className="text-teal-700">{metricasCpo.totalCpo}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-600 font-semibold">C: {metricasCpo.cariados}</span>
                    <span className="text-slate-600 font-semibold">P: {metricasCpo.perdidos}</span>
                    <span className="text-blue-600 font-semibold">O: {metricasCpo.obturados}</span>
                </div>
            </div>

            {/* PALETA DE HERRAMIENTAS CLICK-AND-SELECT */}
            {!readOnly && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                        <span>Herramienta Clínica Activa (Haz clic y luego selecciona la cara dental):</span>
                        <span className="text-teal-600 text-[11px] font-semibold">
                            Activo: {ESTADOS_ODONTOGRAMA.find((e) => e.id === herramientaActiva)?.label}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ESTADOS_ODONTOGRAMA.map((est) => (
                            <button
                                key={est.id}
                                type="button"
                                onClick={() => setHerramientaActiva(est.id)}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                    herramientaActiva === est.id
                                        ? 'ring-2 ring-teal-500 shadow-xs scale-102'
                                        : 'hover:bg-slate-50'
                                }`}
                                style={{
                                    backgroundColor: herramientaActiva === est.id ? '#F0FDFA' : '#FFFFFF',
                                    borderColor: est.border,
                                    color: est.id === 'ausente' ? '#0F172A' : (est.id === 'caries' ? '#DC2626' : '#334155'),
                                }}
                            >
                                <span
                                    className="w-3.5 h-3.5 rounded-md border"
                                    style={{ backgroundColor: est.color, borderColor: est.border }}
                                />
                                <span>{est.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ESQUEMA GRÁFICO DEL ODONTOGRAMA (ARCADA SUPERIOR E INFERIOR) */}
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-6 overflow-x-auto">
                {/* Arcada Superior */}
                <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-200 mb-3">
                        <span>Maxilar Superior Derecho (Cuadrante {tipoDenticion === 'adulto' ? '1' : '5'})</span>
                        <span className="text-teal-800 font-extrabold text-[11px] bg-teal-100/70 px-2 py-0.5 rounded-md">
                            Línea Media Superior
                        </span>
                        <span>Maxilar Superior Izquierdo (Cuadrante {tipoDenticion === 'adulto' ? '2' : '6'})</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {/* Cuadrante 1 o 5 */}
                        <div className="flex gap-1.5">
                            {cuadrantes.superiorDerecho.map((fdi) => renderDienteSvg(fdi, true))}
                        </div>
                        {/* Divisor de línea media */}
                        <div className="w-1 self-stretch bg-teal-400 rounded-full mx-1 opacity-60" />
                        {/* Cuadrante 2 o 6 */}
                        <div className="flex gap-1.5">
                            {cuadrantes.superiorIzquierdo.map((fdi) => renderDienteSvg(fdi, true))}
                        </div>
                    </div>
                </div>

                {/* Arcada Inferior */}
                <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-200 mb-3">
                        <span>Mandíbula Derecha (Cuadrante {tipoDenticion === 'adulto' ? '4' : '8'})</span>
                        <span className="text-teal-800 font-extrabold text-[11px] bg-teal-100/70 px-2 py-0.5 rounded-md">
                            Línea Media Inferior
                        </span>
                        <span>Mandíbula Izquierda (Cuadrante {tipoDenticion === 'adulto' ? '3' : '7'})</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {/* Cuadrante 4 u 8 */}
                        <div className="flex gap-1.5">
                            {cuadrantes.inferiorDerecho.map((fdi) => renderDienteSvg(fdi, false))}
                        </div>
                        {/* Divisor de línea media */}
                        <div className="w-1 self-stretch bg-teal-400 rounded-full mx-1 opacity-60" />
                        {/* Cuadrante 3 o 7 */}
                        <div className="flex gap-1.5">
                            {cuadrantes.inferiorIzquierdo.map((fdi) => renderDienteSvg(fdi, false))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETALLE Y FECHA AUTOMÁTICA DEL DIENTE SELECCIONADO */}
            {dienteSeleccionado && (
                <div className="p-4 bg-white rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-mono font-extrabold text-base flex items-center justify-center border border-teal-200">
                            #{dienteSeleccionado}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase">
                                Pieza Dental #{dienteSeleccionado} - Registro FDI
                            </h4>
                            <p className="text-[11px] text-slate-500">
                                {dienteDetalle?.ultima_fecha
                                    ? `Último estado registrado: ${dienteDetalle.ultima_fecha}`
                                    : 'Sin registros previos en esta sesión'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Estado general:</span>
                        <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 capitalize">
                            {dienteDetalle?.general || 'En arcada'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
