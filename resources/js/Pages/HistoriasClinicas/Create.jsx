import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function HistoriaClinicaCreate({ pacienteSeleccionado, pacientes, docentes }) {
    const [paso, setPaso] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        paciente_id: pacienteSeleccionado?.id || '',
        docente_supervisor_id: '',
        motivo_consulta: '',
        enfermedad_actual: '',
        signos_vitales: {
            temperatura_c: '36.5',
            presion_arterial: '120/80',
            pulso: '72',
            frecuencia_respiratoria: '16',
            peso_kg: '',
            talla_m: '',
            estado_general: 'Aparente buen estado general',
            estado_nutricional: 'Normopeso',
            estado_hidratacion: 'Hidratado',
            consciencia: 'Lúcido, orientado en tiempo, espacio y persona (TEP)',
        },
        examen_estomatologico: {
            craneo: 'Mesocéfalo',
            cara_simetria: 'Simétrica',
            perfil: 'Recto',
            cuello: 'Sin adenopatías palpables ni masas',
            ganglios: 'Ganglios submandibulares no dolorosos a la palpación',
            labios: 'Competentes, hidratados, sin lesiones',
            carrillos: 'Rosados, línea alba normal bilateral',
            paladar: 'Paladar duro profundo, rugas palatinas normales',
            lengua: 'Saburral leve, móvil, papilada',
            piso_boca: 'Permeable, carúnculas salivales sin obstrucción',
            encias: 'Encía marginal rosada coral con punteado en cáscara de naranja',
            atm: {
                apertura: 'Normal (>40mm)',
                chasquidos: false,
                crepitacion: false,
                dolor: false,
                desviacion: false,
            },
            oclusion: 'Clase I de Angle',
        },
        diagnostico_presuntivo: '',
        diagnostico_definitivo: '',
        pronostico: 'Favorable',
        plan_tratamiento: '',
        enviar_a_revision: false,
    });

    const handleSignoChange = (campo, valor) => {
        setData('signos_vitales', {
            ...data.signos_vitales,
            [campo]: valor,
        });
    };

    const handleExamenChange = (campo, valor) => {
        setData('examen_estomatologico', {
            ...data.examen_estomatologico,
            [campo]: valor,
        });
    };

    const handleAtmChange = (campo, valor) => {
        setData('examen_estomatologico', {
            ...data.examen_estomatologico,
            atm: {
                ...data.examen_estomatologico.atm,
                [campo]: valor,
            },
        });
    };

    const handleSubmit = (enviarRevision = false) => {
        data.enviar_a_revision = enviarRevision;
        post(route('historias-clinicas.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Nueva Historia Clínica Odontológica (HC-001)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Asistente clínico por pasos para registro estomatológico oficial</p>
                    </div>
                    <Link
                        href={route('historias-clinicas.index')}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                    >
                        ← Volver a Historias
                    </Link>
                </div>
            }
        >
            <Head title="Redactar HC-001" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* WIZARD STEPPER */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { num: 1, title: 'Motivo y Anamnesis' },
                            { num: 2, title: 'Signos Vitales & Físico' },
                            { num: 3, title: 'Examen Estomatológico' },
                            { num: 4, title: 'Diagnóstico & Plan' },
                        ].map((s) => (
                            <button
                                key={s.num}
                                type="button"
                                onClick={() => setPaso(s.num)}
                                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition ${
                                    paso === s.num
                                        ? 'bg-teal-50 border-teal-300 text-teal-800 ring-2 ring-teal-500/20'
                                        : paso > s.num
                                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                                            : 'bg-white border-transparent text-slate-400'
                                }`}
                            >
                                <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                    paso === s.num
                                        ? 'bg-teal-600 text-white'
                                        : paso > s.num
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {paso > s.num ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        s.num
                                    )}
                                </span>
                                <span className="text-xs font-bold truncate hidden sm:inline">{s.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENIDO DEL FORMULARIO POR PASOS */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* PASO 1: MOTIVO Y ENFERMEDAD ACTUAL */}
                    {paso === 1 && (
                        <div className="p-6 space-y-5">
                            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                                Paso 1: Selección de Paciente y Anamnesis de la Enfermedad
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente *</label>
                                    <select
                                        value={data.paciente_id}
                                        onChange={(e) => setData('paciente_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                        required
                                    >
                                        <option value="">-- Seleccionar Paciente --</option>
                                        {pacientes?.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombres} {p.apellido_paterno} {p.apellido_materno || ''} (CI: {p.ci})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.paciente_id && <p className="text-rose-600 text-xs mt-1">{errors.paciente_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Docente Supervisor</label>
                                    <select
                                        value={data.docente_supervisor_id}
                                        onChange={(e) => setData('docente_supervisor_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    >
                                        <option value="">-- Asignar Docente para Revisión --</option>
                                        {docentes?.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Motivo de Consulta (Palabras textuales del paciente) *
                                </label>
                                <textarea
                                    rows="2"
                                    value={data.motivo_consulta}
                                    onChange={(e) => setData('motivo_consulta', e.target.value)}
                                    placeholder="Ej: 'Siento dolor punzante en la muela de abajo al tomar agua fría desde hace una semana...'"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                                {errors.motivo_consulta && <p className="text-rose-600 text-xs mt-1">{errors.motivo_consulta}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Historia de la Enfermedad Actual (Semiología del Dolor / Cuadro Clínico)
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.enfermedad_actual}
                                    onChange={(e) => setData('enfermedad_actual', e.target.value)}
                                    placeholder="Inicio, evolución, intensidad (escala EVA 1-10), localización, irradiación, factores agravantes o atenuantes, medicación previa..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* PASO 2: SIGNOS VITALES Y EXAMEN FÍSICO */}
                    {paso === 2 && (
                        <div className="p-6 space-y-5">
                            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                                Paso 2: Signos Vitales y Examen Físico General
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Presión Arterial</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.presion_arterial}
                                        onChange={(e) => handleSignoChange('presion_arterial', e.target.value)}
                                        placeholder="120/80 mmHg"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pulso / Frec. Cardíaca</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.pulso}
                                        onChange={(e) => handleSignoChange('pulso', e.target.value)}
                                        placeholder="72 lpm"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Temperatura (°C)</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.temperatura_c}
                                        onChange={(e) => handleSignoChange('temperatura_c', e.target.value)}
                                        placeholder="36.5 °C"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frec. Respiratoria</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.frecuencia_respiratoria}
                                        onChange={(e) => handleSignoChange('frecuencia_respiratoria', e.target.value)}
                                        placeholder="16 rpm"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Peso (kg)</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.peso_kg}
                                        onChange={(e) => handleSignoChange('peso_kg', e.target.value)}
                                        placeholder="70 kg"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Talla (m)</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.talla_m}
                                        onChange={(e) => handleSignoChange('talla_m', e.target.value)}
                                        placeholder="1.70 m"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado General</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.estado_general}
                                        onChange={(e) => handleSignoChange('estado_general', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-4">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sensorio y Orientación</label>
                                    <input
                                        type="text"
                                        value={data.signos_vitales.consciencia}
                                        onChange={(e) => handleSignoChange('consciencia', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: EXAMEN ESTOMATOLÓGICO REGIONAL */}
                    {paso === 3 && (
                        <div className="p-6 space-y-5">
                            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                                Paso 3: Examen Físico Regional Estomatognático
                            </h3>

                            {/* Extraoral */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Examen Extraoral (Cráneo, Cara y Cuello)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cráneo</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.craneo}
                                            onChange={(e) => handleExamenChange('craneo', e.target.value)}
                                            placeholder="Mesocéfalo, dolicocéfalo..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Simetría Facial</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.cara_simetria}
                                            onChange={(e) => handleExamenChange('cara_simetria', e.target.value)}
                                            placeholder="Simétrica, asimetría..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.perfil}
                                            onChange={(e) => handleExamenChange('perfil', e.target.value)}
                                            placeholder="Recto, cóncavo, convexo..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cuello y Cadena Ganglionar</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.ganglios}
                                            onChange={(e) => handleExamenChange('ganglios', e.target.value)}
                                            placeholder="Adenopatías, tiroides, movilidad..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Intraoral */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Examen Intraoral (Mucosas y Tejidos Blandos)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Labios y Comisuras</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.labios}
                                            onChange={(e) => handleExamenChange('labios', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Carrillos y Conducto Stenon</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.carrillos}
                                            onChange={(e) => handleExamenChange('carrillos', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Paladar Duro y Blando</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.paladar}
                                            onChange={(e) => handleExamenChange('paladar', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Lengua (Dorso, bordes y vientre)</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.lengua}
                                            onChange={(e) => handleExamenChange('lengua', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Piso de Boca y Carúnculas</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.piso_boca}
                                            onChange={(e) => handleExamenChange('piso_boca', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Encías y Mucosa Alveolar</label>
                                        <input
                                            type="text"
                                            value={data.examen_estomatologico.encias}
                                            onChange={(e) => handleExamenChange('encias', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ATM y Oclusión */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Articulación Temporomandibular (ATM) y Oclusión
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={!!data.examen_estomatologico.atm?.chasquidos}
                                            onChange={(e) => handleAtmChange('chasquidos', e.target.checked)}
                                            className="w-4 h-4 text-teal-600 rounded"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Chasquidos / Clic</span>
                                    </label>
                                    <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={!!data.examen_estomatologico.atm?.crepitacion}
                                            onChange={(e) => handleAtmChange('crepitacion', e.target.checked)}
                                            className="w-4 h-4 text-teal-600 rounded"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Crepitación</span>
                                    </label>
                                    <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={!!data.examen_estomatologico.atm?.dolor}
                                            onChange={(e) => handleAtmChange('dolor', e.target.checked)}
                                            className="w-4 h-4 text-teal-600 rounded"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Dolor Articular</span>
                                    </label>
                                    <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={!!data.examen_estomatologico.atm?.desviacion}
                                            onChange={(e) => handleAtmChange('desviacion', e.target.checked)}
                                            className="w-4 h-4 text-teal-600 rounded"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Desviación Apertura</span>
                                    </label>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relación Oclusal</label>
                                    <input
                                        type="text"
                                        value={data.examen_estomatologico.oclusion}
                                        onChange={(e) => handleExamenChange('oclusion', e.target.value)}
                                        placeholder="Clase I, II o III de Angle, sobremordida..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 4: DIAGNÓSTICO, PRONÓSTICO Y PLAN */}
                    {paso === 4 && (
                        <div className="p-6 space-y-5">
                            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                                Paso 4: Juicio Diagnóstico, Pronóstico y Plan de Tratamiento
                            </h3>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico Presuntivo</label>
                                <textarea
                                    rows="2"
                                    value={data.diagnostico_presuntivo}
                                    onChange={(e) => setData('diagnostico_presuntivo', e.target.value)}
                                    placeholder="Hipótesis diagnóstica inicial..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico Definitivo</label>
                                <textarea
                                    rows="2"
                                    value={data.diagnostico_definitivo}
                                    onChange={(e) => setData('diagnostico_definitivo', e.target.value)}
                                    placeholder="Diagnóstico fundamentado clínico / radiográfico..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pronóstico</label>
                                    <select
                                        value={data.pronostico}
                                        onChange={(e) => setData('pronostico', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    >
                                        <option value="Favorable">Favorable</option>
                                        <option value="Reservado">Reservado</option>
                                        <option value="Desfavorable">Desfavorable</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plan de Tratamiento General</label>
                                <textarea
                                    rows="4"
                                    value={data.plan_tratamiento}
                                    onChange={(e) => setData('plan_tratamiento', e.target.value)}
                                    placeholder="Secuencia ordenada de fases (Fase sistémica, preventiva, restauradora, quirúrgica, rehabilitación, mantenimiento)..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* BARRA DE NAVEGACIÓN DEL WIZARD */}
                    <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        {paso > 1 ? (
                            <button
                                type="button"
                                onClick={() => setPaso(paso - 1)}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold"
                            >
                                ← Paso Anterior
                            </button>
                        ) : <div></div>}

                        <div className="flex items-center space-x-2">
                            {paso < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setPaso(paso + 1)}
                                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                                >
                                    Siguiente Paso →
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleSubmit(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold"
                                    >
                                        Guardar Borrador
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleSubmit(true)}
                                        className="inline-flex items-center px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span>Enviar a Revisión Docente</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
