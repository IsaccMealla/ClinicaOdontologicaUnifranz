import React, { useState } from 'react';
import BotonSwitch from './BotonSwitch';

export default function TabEvaluacionGeneral({ formData, onChange, readOnly = false }) {
    const [subTab, setSubTab] = useState('motivo');

    const examen = formData?.examen_clinico_fisico || {};
    const habitos = formData?.habitos || {};
    const motivoPaciente = formData?.motivo_consulta_paciente || '';
    const antOdonto = formData?.antecedentes_odontologicos || {};

    // Validar campos de solo texto (letras, acentos, espacios, comas y puntos)
    const handleTextChange = (seccion, campo, value) => {
        if (/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\.,\-]*$/.test(value)) {
            onChange(seccion, campo, value);
        }
    };

    // Validar Presión Arterial (hasta 3 dígitos / hasta 3 dígitos)
    const handlePAChange = (value) => {
        if (/^\d{0,3}(\/\d{0,3})?$/.test(value)) {
            onChange('examen_clinico_fisico', 'presion_arterial', value);
        }
    };

    // Bloquear caracteres inválidos en inputs numéricos
    const preventInvalidNumberChars = (e, allowDecimal = true) => {
        const invalidChars = ['e', 'E', '+', '-'];
        if (!allowDecimal) invalidChars.push('.', ',');
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    };

    const atmItems = [
        { id: 'lateralidad', label: 'Lateralidad' },
        { id: 'apertura', label: 'Apertura' },
        { id: 'chasquidos', label: 'Chasquidos' },
        { id: 'crepitacion', label: 'Crepitación' },
        { id: 'desviacion_apertura_cierre', label: 'Desviación en apertura/cierre' },
        { id: 'dificultad_abrir_boca', label: 'Dificultad para abrir la boca' },
        { id: 'fatiga_dolor_muscular', label: 'Fatiga / Dolor Muscular' },
        { id: 'disminucion_apertura', label: 'Disminución de apertura' },
        { id: 'dolor_apertura', label: 'Dolor a la apertura' },
    ];

    const habitosList = [
        { id: 'onicofagia', label: 'Onicofagia (Muerde uñas)' },
        { id: 'interposicion_lingual', label: 'Interposición lingual' },
        { id: 'bruxismo', label: 'Bruxismo' },
        { id: 'bruxomania', label: 'Bruxomanía' },
        { id: 'succiona_citricos', label: 'Succiona cítricos' },
        { id: 'respirador_bucal', label: 'Respirador bucal' },
        { id: 'fuma', label: 'Fuma tabaquismo' },
        { id: 'bebe', label: 'Bebe alcohol' },
        { id: 'interposicion_objetos', label: 'Interposición de objetos' },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Sub-tabs header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                    type="button"
                    onClick={() => setSubTab('motivo')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'motivo'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Motivo Consulta (M.C.)</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('signos')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'signos'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Signos Vitales</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('fisico')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'fisico'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Examen Físico</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('atm')}
                    className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                        subTab === 'atm'
                            ? 'bg-white text-teal-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Examen ATM</span>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Hábitos Nocivos</span>
                    </span>
                </button>
            </div>

            {/* --- 0. MOTIVO DE CONSULTA Y ANTECEDENTES ODONTOLÓGICOS ESPECÍFICOS --- */}
            {subTab === 'motivo' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                                Motivo de Consulta Principal & Historial Dental Específico
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Registro en terminología propia del paciente y antecedentes de tratamientos previos
                            </p>
                        </div>
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                            Requisito Módulo 2 HCD
                        </span>
                    </div>

                    {/* Motivo de Consulta en palabras del paciente */}
                    <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-2">
                        <label className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>Motivo de Consulta Principal (M.C.) * (Terminología del Paciente)</span>
                        </label>
                        <p className="text-[11px] text-teal-800/80">
                            Transcribir fielmente las palabras utilizadas por el paciente al expresar su queja o necesidad (ej: <em>"Siento dolor punzante en la muela de abajo al tomar sopa caliente"</em>).
                        </p>
                        <textarea
                            disabled={readOnly}
                            rows={3}
                            value={motivoPaciente}
                            onChange={(e) => onChange('motivo_consulta_paciente', null, e.target.value)}
                            placeholder="Escriba aquí la queja o necesidad con las palabras exactas del paciente..."
                            className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 transition resize-none"
                        />
                    </div>

                    {/* Antecedentes Odontológicos Específicos */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase">
                            Antecedentes Odontológicos Previos
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">
                                    Frecuencia de Visitas al Dentista
                                </label>
                                <select
                                    disabled={readOnly}
                                    value={antOdonto.frecuencia_visitas || ''}
                                    onChange={(e) => onChange('antecedentes_odontologicos', 'frecuencia_visitas', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                >
                                    <option value="">-- Seleccionar frecuencia --</option>
                                    <option value="Cada 6 meses">Cada 6 meses (Control periódico)</option>
                                    <option value="Una vez al año">Una vez al año</option>
                                    <option value="Cada 2 o 3 años">Cada 2 o 3 años</option>
                                    <option value="Solo cuando siente dolor / urgencia">Solo cuando siente dolor / urgencia</option>
                                    <option value="Primera vez en su vida">Primera vez en su vida</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">
                                    Fecha o Año del Último Tratamiento
                                </label>
                                <input
                                    type="text"
                                    disabled={readOnly}
                                    value={antOdonto.fecha_ultimo_tratamiento || ''}
                                    onChange={(e) => onChange('antecedentes_odontologicos', 'fecha_ultimo_tratamiento', e.target.value)}
                                    placeholder="Ej: Noviembre 2024, hace 1 año..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">
                                    Experiencias Traumáticas / Fobias
                                </label>
                                <input
                                    type="text"
                                    disabled={readOnly}
                                    value={antOdonto.experiencias_traumaticas || ''}
                                    onChange={(e) => onChange('antecedentes_odontologicos', 'experiencias_traumaticas', e.target.value)}
                                    placeholder="Ej: Dolor severo previo, síncope, ansiedad dental..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block font-bold text-slate-700 uppercase mb-1">
                                    Tratamientos Odontológicos Anteriores Realizados
                                </label>
                                <textarea
                                    disabled={readOnly}
                                    rows={2}
                                    value={antOdonto.tratamientos_anteriores || ''}
                                    onChange={(e) => onChange('antecedentes_odontologicos', 'tratamientos_anteriores', e.target.value)}
                                    placeholder="Detalle de obturaciones previas, endodoncias, extracciones, aparatología de ortodoncia, prótesis dentales..."
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 1. SIGNOS VITALES --- */}
            {subTab === 'signos' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Signos Vitales y Estado General del Paciente
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">Valores basales obligatorios</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Temperatura */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Temperatura</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="30"
                                    max="45"
                                    disabled={readOnly}
                                    value={examen.temperatura_c ?? ''}
                                    onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                    onChange={(e) => onChange('examen_clinico_fisico', 'temperatura_c', e.target.value)}
                                    className="w-full pr-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="36.5"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">°C</span>
                            </div>
                        </div>

                        {/* Presión Arterial */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Presión Arterial</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.presion_arterial || ''}
                                onChange={(e) => handlePAChange(e.target.value)}
                                placeholder="120/80"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        {/* Pulso */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Pulso</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    disabled={readOnly}
                                    value={examen.pulso ?? ''}
                                    onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                    onChange={(e) => onChange('examen_clinico_fisico', 'pulso', e.target.value)}
                                    className="w-full pr-12 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="80"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">lpm</span>
                            </div>
                        </div>

                        {/* Frecuencia Respiratoria */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Frec. Respiratoria</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={readOnly}
                                    value={examen.frecuencia_respiratoria ?? ''}
                                    onKeyDown={(e) => preventInvalidNumberChars(e, false)}
                                    onChange={(e) => onChange('examen_clinico_fisico', 'frecuencia_respiratoria', e.target.value)}
                                    className="w-full pr-12 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="16"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">rpm</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        {/* Peso */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Peso</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    disabled={readOnly}
                                    value={examen.peso_kg ?? ''}
                                    onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                    onChange={(e) => onChange('examen_clinico_fisico', 'peso_kg', e.target.value)}
                                    className="w-full pr-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="70.5"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">kg</span>
                            </div>
                        </div>

                        {/* Talla */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Talla</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    disabled={readOnly}
                                    value={examen.talla_m ?? ''}
                                    onKeyDown={(e) => preventInvalidNumberChars(e, true)}
                                    onChange={(e) => onChange('examen_clinico_fisico', 'talla_m', e.target.value)}
                                    className="w-full pr-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="1.75"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">m</span>
                            </div>
                        </div>

                        {/* Constitución */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Constitución</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.tipo_constitucion || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'tipo_constitucion', e.target.value)}
                                placeholder="Normolíneo, brevilíneo..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Estado General</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.estado_general || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'estado_general', e.target.value)}
                                placeholder="Bueno, regular, malo..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Estado Nutricional</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.estado_nutricional || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'estado_nutricional', e.target.value)}
                                placeholder="Eutrófico, sobrepeso..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Estado de Hidratación</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.estado_hidratacion || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'estado_hidratacion', e.target.value)}
                                placeholder="Hidratado, deshidratado..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Actitud / Posición</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.actitud_posicion || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'actitud_posicion', e.target.value)}
                                placeholder="Activa indiferente, compuesta..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Consciencia</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.consciencia || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'consciencia', e.target.value)}
                                placeholder="Lúcido, somnoliento..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        {/* Switch Orientado ETP */}
                        <div className="flex items-center space-x-3 p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-xl mt-1">
                            <BotonSwitch
                                checked={examen.orientacion_etp || false}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange('examen_clinico_fisico', 'orientacion_etp', c)}
                            />
                            <div>
                                <label className="cursor-pointer font-bold text-slate-800 text-sm block">
                                    Paciente Orientado (ETP)
                                </label>
                                <p className="text-[11px] text-teal-700 font-medium">Espacio, Tiempo y Persona</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. EXAMEN FÍSICO EXTRAORAL --- */}
            {subTab === 'fisico' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Examen Físico Extraoral (Cabeza y Cuello)
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">Evaluación regional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Cráneo</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.craneo || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'craneo', e.target.value)}
                                placeholder="Mesocéfalo, dolicocéfalo, braquicéfalo..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Perfil</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.perfil || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'perfil', e.target.value)}
                                placeholder="Recto, cóncavo, convexo..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Ojos</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.ojos || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'ojos', e.target.value)}
                                placeholder="Pupilas isocóricas, escleras..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Nariz</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.nariz || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'nariz', e.target.value)}
                                placeholder="Permeable, tabique alineado..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Oídos</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.oidos || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'oidos', e.target.value)}
                                placeholder="Pabellón auricular normoimplantado..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Cuello</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.cuello || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'cuello', e.target.value)}
                                placeholder="Móvil, sin masas ni adenopatías..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Ganglios Linfáticos</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={examen.ganglios_linfaticos || ''}
                                onChange={(e) => handleTextChange('examen_clinico_fisico', 'ganglios_linfaticos', e.target.value)}
                                placeholder="Submandibulares, cervicales, no dolorosos ni palpables..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-xl md:col-span-2 hover:bg-slate-100/60 transition">
                            <BotonSwitch
                                checked={examen.cara_simetria ?? true}
                                disabled={readOnly}
                                onCheckedChange={(c) => onChange('examen_clinico_fisico', 'cara_simetria', c)}
                            />
                            <div>
                                <label className="cursor-pointer font-bold text-slate-800 text-sm">
                                    Simetría Facial
                                </label>
                                <p className="text-xs text-slate-500">Rostro simétrico sin asimetrías evidentes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. EXAMEN ATM --- */}
            {subTab === 'atm' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Articulación Temporomandibular (ATM)
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">Palpación y auscultación funcional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {atmItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-xl transition ${
                                    examen[item.id]
                                        ? 'bg-amber-50/60 border-amber-200'
                                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <BotonSwitch
                                        checked={examen[item.id] || false}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange('examen_clinico_fisico', item.id, c)}
                                    />
                                    <label className="font-semibold text-sm cursor-pointer text-slate-700">
                                        {item.label}
                                    </label>
                                </div>
                                {examen[item.id] && (
                                    <input
                                        type="text"
                                        disabled={readOnly}
                                        placeholder={`Observaciones de ${item.label.toLowerCase()}...`}
                                        value={examen[`${item.id}_obs`] || ''}
                                        onChange={(e) => handleTextChange('examen_clinico_fisico', `${item.id}_obs`, e.target.value)}
                                        className="mt-3 w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 transition"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 4. HÁBITOS --- */}
            {subTab === 'habitos' && (
                <div className="space-y-6 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            Hábitos e Higiene Bucal del Paciente
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">Factores etiológicos y de riesgo</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Técnica de Cepillado</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={habitos.tecnica_cepillado || ''}
                                onChange={(e) => onChange('habitos', 'tecnica_cepillado', e.target.value)}
                                placeholder="Ej: Stillman modificado, Bass, Fones, horizontal..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">Elementos de Higiene</label>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={habitos.elementos_higiene || ''}
                                onChange={(e) => onChange('habitos', 'elementos_higiene', e.target.value)}
                                placeholder="Ej: Cepillo suave, enjuague clorexidina 0.12%, seda dental..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">
                            Hábitos Perjudiciales (Sí / No)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-2xl bg-slate-50/70">
                            {habitosList.map((habito) => (
                                <div
                                    key={habito.id}
                                    className={`flex items-center space-x-3 p-2.5 rounded-xl transition ${
                                        habitos[habito.id]
                                            ? 'bg-rose-50 border border-rose-200'
                                            : 'bg-white border border-slate-200/80 hover:bg-slate-50'
                                    }`}
                                >
                                    <BotonSwitch
                                        id={habito.id}
                                        checked={habitos[habito.id] || false}
                                        disabled={readOnly}
                                        onCheckedChange={(c) => onChange('habitos', habito.id, c)}
                                    />
                                    <label htmlFor={habito.id} className="cursor-pointer text-xs font-semibold text-slate-700">
                                        {habito.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Otros Hábitos Relevantes</label>
                        <textarea
                            disabled={readOnly}
                            rows={3}
                            value={habitos.otros_habitos || ''}
                            onChange={(e) => onChange('habitos', 'otros_habitos', e.target.value)}
                            placeholder="Describa cualquier otro hábito (ej: masticación unilateral, consumo de infusiones ácidas, etc.)..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition resize-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
