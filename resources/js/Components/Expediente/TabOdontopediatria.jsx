import React, { useState } from 'react';
import BotonSwitch from './BotonSwitch';

export default function TabOdontopediatria({ formData, onChange, pacienteEdad, readOnly = false }) {
    const [subTab, setSubTab] = useState('datos');

    const odonto = formData?.historia_odontopediatrica || {};
    const seccion = 'historia_odontopediatrica';

    const EDAD_LIMITE_PEDIATRIA = 14;
    const esMayor = pacienteEdad !== undefined && pacienteEdad !== null && pacienteEdad > EDAD_LIMITE_PEDIATRIA;

    const handleTextChange = (seccionObj, campo, value) => {
        if (/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\.,\-]*$/.test(value)) {
            onChange(seccionObj, campo, value);
        }
    };

    const handlePAChange = (value) => {
        if (/^\d{0,3}(\/\d{0,3})?$/.test(value)) {
            onChange(seccion, 'presion_arterial', value);
        }
    };

    const preventInvalidNumberChars = (e, allowDecimal = true) => {
        const invalidChars = ['e', 'E', '+', '-'];
        if (!allowDecimal) invalidChars.push('.', ',');
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    };

    const habitosInfantiles = [
        { id: 'biberon', label: 'Biberón' },
        { id: 'chupon', label: 'Chupón' },
        { id: 'succion_digital', label: 'Succión Digital' },
        { id: 'enuresis', label: 'Enuresis (Orina cama)' },
        { id: 'onicofagia', label: 'Onicofagia (Uñas)' },
        { id: 'queilofagia', label: 'Queilofagia (Labios)' },
        { id: 'geofagia', label: 'Geofagia (Tierra)' },
        { id: 'golosinas', label: 'Golosinas en exceso' },
        { id: 'otros_habitos_inf', label: 'Otros Hábitos' },
    ];

    const oclusales = [
        { id: 'mordida_abierta', label: 'Mordida Abierta' },
        { id: 'apinamiento', label: 'Apiñamiento' },
        { id: 'mordida_cubierta', label: 'Mordida Cubierta' },
        { id: 'diastemas', label: 'Diastemas' },
        { id: 'mordida_borde_borde', label: 'Mordida Borde a Borde' },
        { id: 'transposicion', label: 'Transposición' },
        { id: 'mordida_cruzada_anterior', label: 'M. Cruzada Anterior' },
        { id: 'version_rotacion', label: 'Versión / Rotación' },
        { id: 'mordida_cruzada_uni_der', label: 'M. Cruzada Uni Der' },
        { id: 'mordida_cruzada_uni_izq', label: 'M. Cruzada Uni Izq' },
        { id: 'mordida_cruzada_bilateral', label: 'M. Cruzada Bilateral' },
    ];

    const rasgosNino = [
        { id: 'rasgo_timido', label: 'Tímido' },
        { id: 'rasgo_agresivo', label: 'Agresivo' },
        { id: 'rasgo_mimado', label: 'Mimado' },
        { id: 'rasgo_miedoso', label: 'Miedoso' },
        { id: 'rasgo_desafiante', label: 'Desafiante' },
        { id: 'rasgo_lloroso', label: 'Lloroso' },
    ];

    const actitudPadres = [
        { id: 'padres_cooperador', label: 'Cooperador' },
        { id: 'padres_despreocupado', label: 'Despreocupado' },
        { id: 'padres_sobreprotector', label: 'Sobreprotector' },
        { id: 'padres_reganon', label: 'Regañón' },
        { id: 'padres_debil', label: 'Débil / Permisivo' },
    ];

    return (
        <div className="w-full space-y-6">
            {esMayor && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-800 text-xs">
                    <svg className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <span className="font-bold block">Aviso Pediatría (Paciente con {pacienteEdad} años):</span>
                        La historia de odontopediatría se aplica principalmente para pacientes hasta los 14 años. Los campos siguen habilitados para consulta o registro académico si procede.
                    </div>
                </div>
            )}

            {/* Sub-tabs header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                    type="button"
                    onClick={() => setSubTab('datos')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'datos'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Datos & Desarrollo</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('habitos')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'habitos'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 18h12l3-18H3zM9 10v6m6-6v6" />
                        </svg>
                        <span>Hábitos & Alimentación</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('examen')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'examen'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Examen & Oclusión</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('conducta')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'conducta'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Análisis Conductual</span>
                    </span>
                </button>
            </div>

            {/* --- 1. DATOS, PERINATALES Y PSICOMOTOR --- */}
            {subTab === 'datos' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    {/* Datos Clínicos y Personales */}
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Datos Clínicos y Personales del Menor
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Apodo (¿Cómo lo llaman?)</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.apodo || ''}
                                onChange={(e) => handleTextChange(seccion, 'apodo', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Hobbie / Intereses</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.hobbie || ''}
                                onChange={(e) => handleTextChange(seccion, 'hobbie', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Nombre Padres / Madre</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.nombre_padres || ''}
                                onChange={(e) => handleTextChange(seccion, 'nombre_padres', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Teléfono Padres</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.telefono_padres || ''}
                                onChange={(e) => onChange(seccion, 'telefono_padres', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Nombre Representante / Tutor</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.nombre_representante || ''}
                                onChange={(e) => handleTextChange(seccion, 'nombre_representante', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Teléfono Representante</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.telefono_representante || ''}
                                onChange={(e) => onChange(seccion, 'telefono_representante', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                    </div>

                    {/* Antecedentes Perinatales */}
                    <div className="border-b border-slate-100 pb-3 pt-4">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Antecedentes Perinatales
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">N° Embarazo</label>
                            <input
                                type="number"
                                min="1"
                                disabled={readOnly}
                                value={odonto.numero_embarazo ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                onChange={(e) => onChange(seccion, 'numero_embarazo', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Edad Madre al Embarazo</label>
                            <input
                                type="number"
                                min="10"
                                disabled={readOnly}
                                value={odonto.edad_madre_embarazo ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                onChange={(e) => onChange(seccion, 'edad_madre_embarazo', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Duración del Parto (Ej: 12 horas)</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.duracion_parto || ''}
                                onChange={(e) => onChange(seccion, 'duracion_parto', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                            <BotonSwitch
                                checked={odonto.embarazo_controlado || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange(seccion, 'embarazo_controlado', c)}
                            />
                            <span className="text-xs font-bold text-slate-700">Embarazo Controlado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BotonSwitch
                                checked={odonto.parto_normal || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange(seccion, 'parto_normal', c)}
                            />
                            <span className="text-xs font-bold text-slate-700">Parto Normal</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BotonSwitch
                                checked={odonto.cesarea || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange(seccion, 'cesarea', c)}
                            />
                            <span className="text-xs font-bold text-slate-700">Cesárea</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Antecedentes del Embarazo</label>
                            <textarea
                                rows={2}
                                disabled={readOnly}
                                value={odonto.antecedentes_embarazo || ''}
                                onChange={(e) => onChange(seccion, 'antecedentes_embarazo', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Observaciones del Nacimiento</label>
                            <textarea
                                rows={2}
                                disabled={readOnly}
                                value={odonto.observaciones_nacimiento || ''}
                                onChange={(e) => onChange(seccion, 'observaciones_nacimiento', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Desarrollo Psicomotor */}
                    <div className="border-b border-slate-100 pb-3 pt-4">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Desarrollo Psicomotor e Hitos
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Edad se sentó</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 6 meses"
                                value={odonto.edad_sento || ''}
                                onChange={(e) => onChange(seccion, 'edad_sento', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Edad gateó</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 8 meses"
                                value={odonto.edad_gateo || ''}
                                onChange={(e) => onChange(seccion, 'edad_gateo', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Edad se paró</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 10 meses"
                                value={odonto.edad_paro || ''}
                                onChange={(e) => onChange(seccion, 'edad_paro', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Edad caminó</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 1 año"
                                value={odonto.edad_camino || ''}
                                onChange={(e) => onChange(seccion, 'edad_camino', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">1er Diente</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 6 meses"
                                value={odonto.edad_primer_diente || ''}
                                onChange={(e) => onChange(seccion, 'edad_primer_diente', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">1era Palabra</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Ej: 1 año"
                                value={odonto.edad_primera_palabra || ''}
                                onChange={(e) => onChange(seccion, 'edad_primera_palabra', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Evolución Escolar</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.evolucion_escolar || ''}
                                onChange={(e) => handleTextChange(seccion, 'evolucion_escolar', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Vacunas Recibidas</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.vacunas || ''}
                                onChange={(e) => onChange(seccion, 'vacunas', e.target.value)}
                                placeholder="Esquema completo, pentavalente..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. HÁBITOS Y ALIMENTACIÓN --- */}
            {subTab === 'habitos' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Alimentación (Primer Año)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'lactancia_materna', label: 'L. Materna', edadId: 'edad_lactancia_materna' },
                            { id: 'lactancia_artificial', label: 'L. Artificial', edadId: 'edad_lactancia_artificial' },
                            { id: 'lactancia_mixta', label: 'L. Mixta', edadId: 'edad_lactancia_mixta' },
                        ].map((item) => (
                            <div key={item.id} className="p-4 border rounded-xl bg-slate-50 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <BotonSwitch
                                        checked={odonto[item.id] || false}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange(seccion, item.id, c)}
                                    />
                                    <label className="font-bold text-slate-700 text-sm">{item.label}</label>
                                </div>
                                {odonto[item.id] && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-medium">¿Hasta qué edad?</label>
                                        <input
                                            type="text"
                                            disabled={readOnly}
                                            value={odonto[item.edadId] || ''}
                                            onChange={(e) => onChange(seccion, item.edadId, e.target.value)}
                                            placeholder="Ej: 1 año y 6 meses..."
                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Observaciones de Alimentación</label>
                        <textarea
                            rows={2}
                            disabled={readOnly}
                            value={odonto.obs_alimentacion || ''}
                            onChange={(e) => onChange(seccion, 'obs_alimentacion', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                        />
                    </div>

                    {/* Hábitos Infantiles */}
                    <div className="border-b border-slate-100 pb-3 pt-4">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Hábitos Infantiles Perjudiciales
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {habitosInfantiles.map((hab) => (
                            <div key={hab.id} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                                <div className="flex items-center space-x-3">
                                    <BotonSwitch
                                        checked={odonto[hab.id] || false}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange(seccion, hab.id, c)}
                                    />
                                    <label className="font-semibold text-xs text-slate-700 cursor-pointer">{hab.label}</label>
                                </div>
                                {odonto[hab.id] && (
                                    <input
                                        type="text"
                                        disabled={readOnly}
                                        placeholder="Detalles / Frecuencia..."
                                        value={odonto[`${hab.id}_obs`] || ''}
                                        onChange={(e) => onChange(seccion, `${hab.id}_obs`, e.target.value)}
                                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Higiene y Experiencia Previa */}
                    <div className="border-b border-slate-100 pb-3 pt-4">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Higiene y Experiencia Previa en Odontología
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Cepillados al día</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                disabled={readOnly}
                                value={odonto.veces_cepilla_dia ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                onChange={(e) => onChange(seccion, 'veces_cepilla_dia', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">¿Cuándo cepilla?</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.cuando_cepilla || ''}
                                onChange={(e) => handleTextChange(seccion, 'cuando_cepilla', e.target.value)}
                                placeholder="Mañana, después de comer, noche..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Tipo Higiene (Asistido, solo)</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.tipo_higiene || ''}
                                onChange={(e) => handleTextChange(seccion, 'tipo_higiene', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Pasta y Cepillo utilizado</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.pasta_y_cepillo || ''}
                                onChange={(e) => onChange(seccion, 'pasta_y_cepillo', e.target.value)}
                                placeholder="Pasta con 1450 ppm de flúor..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <BotonSwitch
                                    checked={odonto.usa_enjuague || false}
                                    disabled={readOnly}
                                    onCheckedChange={(c) => onChange(seccion, 'usa_enjuague', c)}
                                />
                                <span className="text-xs font-bold text-slate-700">Enjuague</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <BotonSwitch
                                    checked={odonto.usa_hilo || false}
                                    disabled={readOnly}
                                    onCheckedChange={(c) => onChange(seccion, 'usa_hilo', c)}
                                />
                                <span className="text-xs font-bold text-slate-700">Hilo Dental</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border border-teal-200 bg-teal-50/40 rounded-xl space-y-3">
                        <div className="flex items-center space-x-3">
                            <BotonSwitch
                                checked={odonto.atencion_previa || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange(seccion, 'atencion_previa', c)}
                            />
                            <label className="font-bold text-sm text-teal-900">¿Atención Odontológica Previa?</label>
                        </div>
                        {odonto.atencion_previa && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">¿Cuándo y Dónde?</label>
                                    <input
                                        type="text"
                                        disabled={readOnly}
                                        value={odonto.cuando_donde_atencion || ''}
                                        onChange={(e) => onChange(seccion, 'cuando_donde_atencion', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                                <div className="flex items-center space-x-3 pt-4">
                                    <BotonSwitch
                                        checked={odonto.experiencia_positiva ?? true}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange(seccion, 'experiencia_positiva', c)}
                                    />
                                    <label className="text-xs font-bold text-slate-700">¿Fue una experiencia positiva?</label>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-700">¿Por qué? (Detalles)</label>
                                    <textarea
                                        rows={2}
                                        disabled={readOnly}
                                        value={odonto.por_que_experiencia || ''}
                                        onChange={(e) => onChange(seccion, 'por_que_experiencia', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- 3. EXAMEN FÍSICO Y OCLUSIÓN --- */}
            {subTab === 'examen' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Examen Físico y Dentición Pediátrica
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                disabled={readOnly}
                                value={odonto.peso ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                onChange={(e) => onChange(seccion, 'peso', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Talla (m)</label>
                            <input
                                type="number"
                                step="0.01"
                                disabled={readOnly}
                                value={odonto.talla ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                onChange={(e) => onChange(seccion, 'talla', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Temperatura (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                disabled={readOnly}
                                value={odonto.temperatura ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                onChange={(e) => onChange(seccion, 'temperatura', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Presión Arterial</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="100/60"
                                value={odonto.presion_arterial || ''}
                                onChange={(e) => handlePAChange(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Frec. Resp. (rpm)</label>
                            <input
                                type="number"
                                disabled={readOnly}
                                value={odonto.frecuencia_respiratoria ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                onChange={(e) => onChange(seccion, 'frecuencia_respiratoria', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Frec. Cardíaca (lpm)</label>
                            <input
                                type="number"
                                disabled={readOnly}
                                value={odonto.frecuencia_cardiaca ?? ''}
                                onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                onChange={(e) => onChange(seccion, 'frecuencia_cardiaca', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Tipo de Dentición</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Temporal, Mixta temprana/tardía, Permanente..."
                                value={odonto.tipo_denticion || ''}
                                onChange={(e) => handleTextChange(seccion, 'tipo_denticion', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="border-b border-slate-100 pb-3 pt-4">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Oclusión y Análisis Facial Pediátrico
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Competencia Labial</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.competencia_labial || ''}
                                onChange={(e) => handleTextChange(seccion, 'competencia_labial', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Tipo de Perfil</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.tipo_perfil || ''}
                                onChange={(e) => handleTextChange(seccion, 'tipo_perfil', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Línea Media</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={odonto.linea_media || ''}
                                onChange={(e) => handleTextChange(seccion, 'linea_media', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Relación Molar Baume</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Plano terminal recto, escalón mesial/distal"
                                value={odonto.relacion_molar_baume || ''}
                                onChange={(e) => onChange(seccion, 'relacion_molar_baume', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Tipo Arco Baume</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Tipo I (espaciado) / Tipo II (cerrado)"
                                value={odonto.tipo_arco_baume || ''}
                                onChange={(e) => onChange(seccion, 'tipo_arco_baume', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Relación Molar Angle</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                placeholder="Clase I, Clase II div 1/2, Clase III"
                                value={odonto.relacion_molar_angle || ''}
                                onChange={(e) => onChange(seccion, 'relacion_molar_angle', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">
                            Anomalías y Problemas Oclusales (Sí / No)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/70">
                            {oclusales.map((ocl) => (
                                <div key={ocl.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white border border-slate-200/80">
                                    <BotonSwitch
                                        checked={odonto[ocl.id] || false}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange(seccion, ocl.id, c)}
                                    />
                                    <span className="text-xs font-semibold text-slate-700">{ocl.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Observaciones de Oclusión</label>
                            <textarea
                                rows={2}
                                disabled={readOnly}
                                value={odonto.obs_oclusion || ''}
                                onChange={(e) => onChange(seccion, 'obs_oclusion', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Anomalías de Formación Dental</label>
                            <textarea
                                rows={2}
                                disabled={readOnly}
                                value={odonto.anomalias_formacion_dental || ''}
                                onChange={(e) => onChange(seccion, 'anomalias_formacion_dental', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- 4. ANÁLISIS CONDUCTUAL --- */}
            {subTab === 'conducta' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Análisis Conductual y Escala de Escobar
                        </h3>
                    </div>

                    <div className="space-y-1.5 max-w-md">
                        <label className="text-xs font-bold text-slate-700 uppercase">Clasificación de Escobar</label>
                        <input
                            type="text"
                            disabled={readOnly}
                            value={odonto.tipo_escobar || ''}
                            onChange={(e) => handleTextChange(seccion, 'tipo_escobar', e.target.value)}
                            placeholder="Ej: Colaborador, No colaborador, Colaborador en potencia..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rasgos del Niño */}
                        <div className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-2xl space-y-3">
                            <h4 className="font-bold text-indigo-900 text-sm border-b border-indigo-100 pb-2">
                                Rasgos del Niño
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {rasgosNino.map((r) => (
                                    <div key={r.id} className="flex items-center space-x-2 p-2 bg-white rounded-xl border border-indigo-100">
                                        <BotonSwitch
                                            checked={odonto[r.id] || false}
                                            disabled={readOnly}
                                            onCheckedChange={(c) => onChange(seccion, r.id, c)}
                                        />
                                        <span className="text-xs font-semibold text-slate-700">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actitud de los Padres */}
                        <div className="p-4 border border-amber-200 bg-amber-50/30 rounded-2xl space-y-3">
                            <h4 className="font-bold text-amber-900 text-sm border-b border-amber-100 pb-2">
                                Actitud de los Padres o Acompañantes
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {actitudPadres.map((p) => (
                                    <div key={p.id} className="flex items-center space-x-2 p-2 bg-white rounded-xl border border-amber-100">
                                        <BotonSwitch
                                            checked={odonto[p.id] || false}
                                            disabled={readOnly}
                                            onCheckedChange={(c) => onChange(seccion, p.id, c)}
                                        />
                                        <span className="text-xs font-semibold text-slate-700">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Observaciones Conductuales</label>
                        <textarea
                            rows={3}
                            disabled={readOnly}
                            value={odonto.obs_conductual || ''}
                            onChange={(e) => onChange(seccion, 'obs_conductual', e.target.value)}
                            placeholder="Anotaciones adicionales sobre el comportamiento y manejo en el sillón dental..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
