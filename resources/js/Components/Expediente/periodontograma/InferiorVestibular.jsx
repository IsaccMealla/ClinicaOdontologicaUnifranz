
import React from 'react';
import { usePeriodontograma } from '../PeriodontogramaContext';

const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const coordenadasX = {
    48: [23, 44, 65],
    47: [83, 105.5, 128],
    46: [145, 167.5, 190],
    45: [214, 223, 232],
    44: [253, 262.5, 272],
    43: [290, 299.5, 309],
    42: [327, 336, 345],
    41: [360, 369, 378],
    31: [411, 420, 429],
    32: [444, 453, 462],
    33: [480, 489.5, 499],
    34: [517, 526.5, 536],
    35: [557, 566, 575],
    36: [599, 621.5, 644],
    37: [661, 683.5, 706],
    38: [723, 744.5, 766],
};

const anchosDientes = {
    48: 61.5, 47: 52.5, 46: 61.0, 45: 41.0,
    44: 40.5, 43: 41.5, 42: 38.5, 41: 58.0,
    31: 58.0, 32: 39.0, 33: 41.5, 34: 40.0,
    35: 41.5, 36: 61.5, 37: 51.5, 38: 62.5,
};

const ajustesImplantes = {
    48: { width: 55, offsetX: 3, offsetY: -14, height: 125 },
    47: { width: 55, offsetX: -1.5, offsetY: -14, height: 130 },
    46: { width: 56, offsetX: 3, offsetY: -14, height: 130 },
    45: { width: 27, offsetX: 7, offsetY: -14, height: 125 },
    44: { width: 26, offsetX: 8, offsetY: -14, height: 125 },
    43: { width: 27, offsetX: 8, offsetY: -14, height: 130 },
    42: { width: 36, offsetX: 0.5, offsetY: -25, height: 120 },
    41: { width: 42, offsetX: 12, offsetY: -14, height: 125 },
    31: { width: 57, offsetX: -3, offsetY: -17, height: 125 },
    32: { width: 37, offsetX: 1, offsetY: -29, height: 120 },
    33: { width: 26, offsetX: 8, offsetY: -14, height: 130 },
    34: { width: 24, offsetX: 8, offsetY: -14, height: 125 },
    35: { width: 27, offsetX: 7.5, offsetY: -14, height: 125 },
    36: { width: 60, offsetX: 0, offsetY: -15, height: 130 },
    37: { width: 40, offsetX: 5.5, offsetY: -14, height: 130 },
    38: { width: 60, offsetX: 6, offsetY: -29, height: 120 },
};

const getMovilidadEstilo = (grado) => {
    switch (grado) {
        case 'I': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'II': return 'bg-orange-200 text-orange-900 border-orange-400 font-semibold';
        case 'III': return 'bg-red-200 text-red-900 border-red-500 font-bold';
        default: return 'bg-white text-slate-500 border-slate-200';
    }
};

export default function InferiorVestibular({ readOnly = false }) {
    const { datos, setDatos } = usePeriodontograma();
    const datosVestibularInf = datos.datos_vestibular_inferior;

    const updateDiente = (pieza, campo, valor) => {
        if (readOnly) return;
        setDatos({
            ...datos,
            datos_vestibular_inferior: {
                ...datosVestibularInf,
                [pieza]: { ...datosVestibularInf[pieza], [campo]: valor },
            },
        });
    };

    const updateArray = (pieza, campo, index, valor) => {
        if (readOnly) return;
        const nuevoArray = [...datosVestibularInf[pieza][campo]];
        nuevoArray[index] = campo === 'margen' || campo === 'sondaje' ? Number(valor) : valor;
        setDatos({
            ...datos,
            datos_vestibular_inferior: {
                ...datosVestibularInf,
                [pieza]: { ...datosVestibularInf[pieza], [campo]: nuevoArray },
            },
        });
    };

    const viewBoxAncho = 790;
    const viewBoxAlto = 162;
    const altoCanvas = 210;
    const yLAC = 59;
    const escala = 6.45;

    const ptsMargenArr = [];
    const ptsSondajeArr = [];

    dientesInferiores.forEach((pieza) => {
        const d = datosVestibularInf[pieza] || { margen: [0, 0, 0], sondaje: [0, 0, 0] };
        const xs = coordenadasX[pieza] || [0, 0, 0];

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
                    Arcada Inferior (Vestibular) - Cuadrantes 3 y 4
                </h4>
                <span className="text-[11px] font-semibold text-teal-700 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    Piezas 48 al 38
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
                            {dientesInferiores.map((pieza) => {
                                const d = datosVestibularInf[pieza] || {
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
                            {/* IMAGEN DE FONDO BASE (Inferior Vestibular) */}
                            <img
                                src="/img/dientes/inferior-vestibular.jpg"
                                alt="Dientes Inferiores Vestibulares"
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
                                {dientesInferiores.map((pieza) => {
                                    if (!datosVestibularInf[pieza]?.implante) return null;

                                    const ancho = anchosDientes[pieza];
                                    const centroX = coordenadasX[pieza][1];
                                    const xPos = centroX - (ancho / 2);
                                    const ajuste = ajustesImplantes[pieza] || { width: 41, offsetX: 11, offsetY: -7, height: 125 };
                                    const yImplante = yLAC + ajuste.offsetY;

                                    return (
                                        <image
                                            key={`img-implante-${pieza}`}
                                            href={`/img/implants/3/${pieza}b.png`}
                                            x={xPos + ajuste.offsetX}
                                            y={yImplante}
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
                                {dientesInferiores.map((pieza) => {
                                    const d = datosVestibularInf[pieza] || { margen: [0, 0, 0], sondaje: [0, 0, 0], sangrado: [], supuracion: [] };
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
