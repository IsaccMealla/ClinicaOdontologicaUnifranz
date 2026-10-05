import React from 'react';
import { usePeriodontograma } from '../PeriodontogramaContext';

const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

const coordenadasX = {
    18: [17, 35.5, 54],
    17: [69, 87.5, 106],
    16: [122, 144.5, 167],
    15: [183, 195.5, 207],
    14: [225, 236, 248],
    13: [265, 277.5, 291],
    12: [305, 317, 328],
    11: [345, 359.5, 373],
    21: [416, 430, 444],
    22: [461, 472.5, 484],
    23: [499, 511.5, 524],
    24: [542, 553.5, 564],
    25: [582, 594.5, 606],
    26: [623, 645.5, 668],
    27: [684, 702, 720],
    28: [735, 753, 771],
};

const anchosDientes = {
    18: 61.5, 17: 52.5, 16: 61.0, 15: 41.0,
    14: 40.5, 13: 41.5, 12: 38.5, 11: 58.0,
    21: 58.0, 22: 39.0, 23: 41.5, 24: 40.0,
    25: 41.5, 26: 61.5, 27: 51.5, 28: 62.5,
};

const ajustesImplantes = {
    18: { width: 41, offsetX: 10, offsetY: -9, height: 120 },
    17: { width: 40, offsetX: 7, offsetY: -9, height: 130 },
    16: { width: 49, offsetX: 6, offsetY: -7, height: 130 },
    15: { width: 25, offsetX: 8, offsetY: -9, height: 125 },
    14: { width: 27, offsetX: 7, offsetY: -9, height: 125 },
    13: { width: 28, offsetX: 7, offsetY: -9, height: 130 },
    12: { width: 28, offsetX: 5, offsetY: -9, height: 120 },
    11: { width: 40.5, offsetX: 13, offsetY: -8, height: 125 },
    21: { width: 40, offsetX: 4.5, offsetY: -9, height: 125 },
    22: { width: 28, offsetX: 5, offsetY: -9, height: 120 },
    23: { width: 29, offsetX: 6, offsetY: -9, height: 130 },
    24: { width: 26, offsetX: 6, offsetY: -9, height: 125 },
    25: { width: 27, offsetX: 6, offsetY: -9, height: 125 },
    26: { width: 49.5, offsetX: 4.5, offsetY: -7.5, height: 130 },
    27: { width: 39.5, offsetX: 4.5, offsetY: -8, height: 130 },
    28: { width: 45.5, offsetX: 10, offsetY: -9, height: 120 },
};

const getMovilidadEstilo = (grado) => {
    switch (grado) {
        case 'I': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'II': return 'bg-orange-200 text-orange-900 border-orange-400 font-semibold';
        case 'III': return 'bg-red-200 text-red-900 border-red-500 font-bold';
        default: return 'bg-white text-slate-500 border-slate-200';
    }
};

export default function SuperiorPalatino({ readOnly = false }) {
    const { datos, setDatos } = usePeriodontograma();
    const datosPalatino = datos.datos_palatino_superior;

    const updateDiente = (pieza, campo, valor) => {
        if (readOnly) return;
        setDatos({
            ...datos,
            datos_palatino_superior: {
                ...datosPalatino,
                [pieza]: { ...datosPalatino[pieza], [campo]: valor },
            },
        });
    };

    const updateArray = (pieza, campo, index, valor) => {
        if (readOnly) return;
        const nuevoArray = [...datosPalatino[pieza][campo]];
        nuevoArray[index] = campo === 'margen' || campo === 'sondaje' ? Number(valor) : valor;
        setDatos({
            ...datos,
            datos_palatino_superior: {
                ...datosPalatino,
                [pieza]: { ...datosPalatino[pieza], [campo]: nuevoArray },
            },
        });
    };

    const viewBoxAncho = 790;
    const viewBoxAlto = 162;
    const altoCanvas = 210;
    const yLAC = 53;
    const escala = 6.45;

    const ptsMargenArr = [];
    const ptsSondajeArr = [];

    dientesSuperiores.forEach((pieza) => {
        const d = datosPalatino[pieza] || { margen: [0,0,0], sondaje: [0,0,0] };
        const xs = coordenadasX[pieza] || [0,0,0];

        xs.forEach((x, index) => {
            const m = Number(d.margen[index]) || 0;
            const s = Number(d.sondaje[index]) || 0;

            const yMargen = yLAC - (m * escala);
            const ySondaje = yLAC - ((m + s) * escala);

            ptsMargenArr.push(`${x},${yMargen}`);
            ptsSondajeArr.push(`${x},${ySondaje}`);
        });
    });

    const ptsMargenStr = ptsMargenArr.join(' ');
    const ptsSondajeStr = ptsSondajeArr.join(' ');
    const poligonBolsaStr = `${ptsMargenStr} ${[...ptsSondajeArr].reverse().join(' ')}`;

    return (
        <div className="w-full space-y-3 font-sans bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center bg-teal-50/80 p-3.5 rounded-xl border border-teal-100">
                <h4 className="font-bold text-sm text-teal-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    Arcada Superior (Palatino) - Cuadrantes 1 y 2
                </h4>
                <span className="text-[11px] font-semibold text-teal-700 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    Piezas 18 al 28
                </span>
            </div>

            <div className="overflow-x-auto pb-4 rounded-xl border border-slate-200">
                <div className="flex min-w-[1000px] bg-white relative">
                    {/* COLUMNA 1: ETIQUETAS FIJAS */}
                    <div className="sticky left-0 z-20 flex flex-col w-[130px] bg-slate-100/95 font-bold text-xs text-slate-700 border-r-2 border-slate-300 shrink-0 shadow-sm">
                        <div className="h-9 border-b border-slate-300 flex items-center px-3 bg-slate-200/80">Pieza</div>
                        <div className="h-9 border-b border-slate-300 flex items-center px-3">Movilidad</div>
                        <div className="h-8 border-b border-slate-300 flex items-center px-3">Implante</div>
                        <div className="h-8 border-b border-slate-300 flex items-center px-3 text-red-600">BOP (Sangra)</div>
                        <div className="h-8 border-b border-slate-300 flex items-center px-3 text-yellow-600">Supuración</div>
                        <div className="h-9 border-b border-slate-300 flex items-center px-3 text-blue-700">Margen (MG)</div>
                        <div className="h-9 border-b border-slate-300 flex items-center px-3 text-red-700">Sondaje (PS)</div>
                        <div className="h-9 border-b-2 border-slate-400 flex items-center px-3 bg-emerald-50 text-emerald-700 font-extrabold">NIC (Inserción)</div>
                        <div className="h-[210px] flex items-center justify-center text-slate-400 bg-white border-r border-slate-300 text-[11px] uppercase tracking-wider font-semibold">
                            Gráfico 2D
                        </div>
                    </div>

                    {/* COLUMNA 2: DATOS Y GRÁFICO */}
                    <div className="flex flex-col shrink-0 w-[1000px]">
                        {/* TABLA DE INPUTS */}
                        <div className="flex w-full">
                            {dientesSuperiores.map((pieza) => {
                                const d = datosPalatino[pieza] || {
                                    movilidad: '', implante: false,
                                    sangrado: [false, false, false], supuracion: [false, false, false],
                                    margen: [0, 0, 0], sondaje: [0, 0, 0]
                                };
                                const nic = [
                                    (Number(d.margen[0]) || 0) + (Number(d.sondaje[0]) || 0),
                                    (Number(d.margen[1]) || 0) + (Number(d.sondaje[1]) || 0),
                                    (Number(d.margen[2]) || 0) + (Number(d.sondaje[2]) || 0),
                                ];

                                const anchoPorcentaje = (anchosDientes[pieza] / viewBoxAncho) * 100;

                                return (
                                    <div
                                        key={pieza}
                                        className="flex flex-col border-r border-slate-200 shrink-0 hover:bg-slate-50/50 transition-colors"
                                        style={{ width: `${anchoPorcentaje}%` }}
                                    >
                                        <div className="h-9 border-b border-slate-300 flex items-center justify-center font-extrabold text-[13px] bg-slate-100/90 text-slate-800">
                                            {pieza}
                                        </div>

                                        <div className="h-9 border-b border-slate-300 flex items-center justify-center p-1">
                                            <select
                                                disabled={readOnly}
                                                className={`w-[85%] max-w-[42px] text-center text-[11px] py-0.5 rounded border outline-hidden cursor-pointer shadow-2xs transition-colors ${getMovilidadEstilo(d.movilidad)}`}
                                                value={d.movilidad || ''}
                                                onChange={(e) => updateDiente(pieza, 'movilidad', e.target.value)}
                                            >
                                                <option value="">-</option>
                                                <option value="I">I</option>
                                                <option value="II">II</option>
                                                <option value="III">III</option>
                                            </select>
                                        </div>

                                        <div className="h-8 border-b border-slate-300 flex items-center justify-center bg-slate-50/30">
                                            <input
                                                type="checkbox"
                                                disabled={readOnly}
                                                checked={d.implante || false}
                                                onChange={(e) => updateDiente(pieza, 'implante', e.target.checked)}
                                                className="cursor-pointer w-3.5 h-3.5 accent-slate-600 rounded"
                                            />
                                        </div>

                                        <div className="h-8 border-b border-slate-300 grid grid-cols-3 items-center justify-items-center bg-red-50/20 px-0.5">
                                            {[0, 1, 2].map((i) => (
                                                <input
                                                    key={`sang-${i}`}
                                                    type="checkbox"
                                                    disabled={readOnly}
                                                    checked={d.sangrado[i] || false}
                                                    onChange={(e) => updateArray(pieza, 'sangrado', i, e.target.checked)}
                                                    className="w-3.5 h-3.5 cursor-pointer accent-red-500 rounded-xs"
                                                />
                                            ))}
                                        </div>

                                        <div className="h-8 border-b border-slate-300 grid grid-cols-3 items-center justify-items-center bg-yellow-50/20 px-0.5">
                                            {[0, 1, 2].map((i) => (
                                                <input
                                                    key={`sup-${i}`}
                                                    type="checkbox"
                                                    disabled={readOnly}
                                                    checked={d.supuracion[i] || false}
                                                    onChange={(e) => updateArray(pieza, 'supuracion', i, e.target.checked)}
                                                    className="w-3.5 h-3.5 cursor-pointer accent-yellow-400 rounded-xs"
                                                />
                                            ))}
                                        </div>

                                        <div className="h-9 border-b border-slate-300 grid grid-cols-3 items-center justify-items-center gap-0.5 px-0.5">
                                            {[0, 1, 2].map((i) => (
                                                <input
                                                    key={`mg-${i}`}
                                                    type="number"
                                                    disabled={readOnly}
                                                    value={d.margen[i] === 0 ? '' : d.margen[i]}
                                                    onChange={(e) => updateArray(pieza, 'margen', i, e.target.value)}
                                                    className="h-6 w-[90%] p-0 text-center text-xs text-blue-700 font-bold border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            ))}
                                        </div>

                                        <div className="h-9 border-b border-slate-300 grid grid-cols-3 items-center justify-items-center gap-0.5 px-0.5">
                                            {[0, 1, 2].map((i) => (
                                                <input
                                                    key={`ps-${i}`}
                                                    type="number"
                                                    disabled={readOnly}
                                                    value={d.sondaje[i] === 0 ? '' : d.sondaje[i]}
                                                    onChange={(e) => updateArray(pieza, 'sondaje', i, e.target.value)}
                                                    className="h-6 w-[90%] p-0 text-center text-xs text-red-700 font-bold border border-red-200 rounded focus:ring-1 focus:ring-red-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            ))}
                                        </div>

                                        <div className="h-9 border-b-2 border-slate-400 grid grid-cols-3 items-center justify-items-center bg-emerald-50/80 text-[11px] font-extrabold text-emerald-800">
                                            <span>{nic[0]}</span>
                                            <span>{nic[1]}</span>
                                            <span>{nic[2]}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ZONA DEL GRÁFICO */}
                        <div className="relative w-full overflow-hidden bg-[#eef2f6]" style={{ height: `${altoCanvas}px` }}>
                            {/* IMAGEN DE FONDO BASE (Palatino) */}
                            <img
                                src="/img/dientes/superior-palatino.jpg"
                                alt="Dientes Superiores Palatinos"
                                className="absolute inset-0 w-full h-full object-fill opacity-75 grayscale"
                            />

                            {/* OVERLAY SVG PARA GRILLA, IMPLANTES Y DIBUJO DE BOLSAS */}
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox={`0 0 ${viewBoxAncho} ${viewBoxAlto}`}
                                preserveAspectRatio="none"
                            >
                                {/* 1. Grilla Milimetrada */}
                                {Array.from({ length: 26 }).map((_, i) => {
                                    const step = i - 10;
                                    const y = yLAC + (step * escala);
                                    if (y < 0 || y > viewBoxAlto) return null;
                                    return (
                                        <line
                                            key={`grid-${y}`}
                                            x1="0"
                                            y1={y}
                                            x2={viewBoxAncho}
                                            y2={y}
                                            stroke="#94a3b8"
                                            strokeWidth={step === 0 ? '1.5' : '0.5'}
                                            opacity={step === 0 ? '1' : '0.4'}
                                            strokeDasharray={step % 5 === 0 || step === 0 ? 'none' : '2 2'}
                                        />
                                    );
                                })}

                                {/* 2. RENDERIZADO DE IMPLANTES */}
                                {dientesSuperiores.map((pieza) => {
                                    if (!datosPalatino[pieza]?.implante) return null;

                                    const ancho = anchosDientes[pieza];
                                    const centroX = coordenadasX[pieza][1];
                                    const xPos = centroX - (ancho / 2);
                                    const ajuste = ajustesImplantes[pieza] || { width: 41, offsetX: 11, offsetY: -7, height: 125 };

                                    return (
                                        <image
                                            key={`img-implante-${pieza}`}
                                            href={`/img/implants/1/${pieza}p.png`}
                                            x={xPos + ajuste.offsetX}
                                            y={yLAC + ajuste.offsetY}
                                            width={ajuste.width}
                                            height={ajuste.height}
                                            preserveAspectRatio="xMidYMin slice"
                                        />
                                    );
                                })}

                                {/* 3. POLÍGONO DE BOLSA PERIODONTAL */}
                                <polygon points={poligonBolsaStr} fill="#000080" fillOpacity="0.25" stroke="none" />

                                {/* 4. LÍNEAS DE MARGEN Y SONDAJE */}
                                <polyline points={ptsMargenStr} stroke="#2563eb" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                                <polyline points={ptsSondajeStr} stroke="#ef4444" strokeWidth="1.2" fill="none" strokeLinejoin="round" />

                                {/* 5. PUNTOS Y MARCADORES (Sangrado, supuración) */}
                                {dientesSuperiores.map((pieza) => {
                                    const d = datosPalatino[pieza] || { margen: [0,0,0], sondaje: [0,0,0], sangrado: [], supuracion: [] };
                                    const xs = coordenadasX[pieza] || [];

                                    return xs.map((x, index) => {
                                        const m = Number(d.margen[index]) || 0;
                                        const s = Number(d.sondaje[index]) || 0;

                                        const cyMargen = yLAC - (m * escala);
                                        const cySondaje = yLAC - ((m + s) * escala);

                                        return (
                                            <g key={`puntos-${pieza}-${index}`}>
                                                <circle cx={x} cy={cyMargen} r="1.5" fill="#1e40af" />
                                                {s > 0 && <circle cx={x} cy={cySondaje} r="1.5" fill="#ef4444" />}
                                                {d.sangrado && d.sangrado[index] && (
                                                    <circle cx={x - 3} cy={cyMargen + 6} r="1.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
                                                )}
                                                {d.supuracion && d.supuracion[index] && (
                                                    <circle cx={x + 3} cy={cyMargen + 6} r="1.8" fill="#eab308" stroke="#ffffff" strokeWidth="0.6" />
                                                )}
                                            </g>
                                        );
                                    });
                                })}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
