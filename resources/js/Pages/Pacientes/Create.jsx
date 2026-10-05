import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PacienteCreate({ estudiantes = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        ci: '',
        ci_expedido: 'LP',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        sexo: 'M',
        estado_civil: 'Soltero',
        nacionalidad: 'Boliviana',
        ocupacion: '',
        nivel_instruccion: 'Secundaria',
        lugar_nacimiento: '',
        direccion: '',
        telefono: '',
        celular: '',
        email: '',
        fuente_referencia: 'Recomendación familiar',
        seguro_convenio: '',
        numero_poliza: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        parentesco_emergencia: '',
        estado_paciente: 'activo',
        estado_clinico: 'en_evaluacion',
        estudiante_asignado_id: '',
        consentimiento_firmado: true,
        reglamento_aceptado: true,
        privacidad_aceptada: true,
        observaciones_consentimiento: 'Consentimiento informado y reglamento aceptado formalmente en el acto de admisión.',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pacientes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-extrabold uppercase tracking-wider">
                                Módulo 1: Admisión
                            </span>
                            <span className="text-xs text-slate-400">• Asignación automática de IUP</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mt-1">
                            Registro de Paciente & Admisión Clínica
                        </h2>
                        <p className="text-xs text-slate-500">
                            Captación inicial de datos demográficos, seguro/convenio y consentimiento informado institucional
                        </p>
                    </div>
                    <Link
                        href={route('pacientes.index')}
                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Volver al Padrón</span>
                    </Link>
                </div>
            }
        >
            <Head title="Nuevo Paciente - Admisión UNIFRANZ" />

            <div className="max-w-5xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* ENCABEZADO INFORMATIVO INSTITUCIONAL */}
                    <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-bold text-sm tracking-wide text-teal-300 uppercase">Clínica Odontológica UNIFRANZ</span>
                            </div>
                            <h3 className="text-lg font-extrabold text-white">Apertura de Expediente Clínico Digital</h3>
                            <p className="text-xs text-slate-300 max-w-2xl">
                                El sistema generará automáticamente un código alfanumérico único e irrepetible (IUP) con formato <span className="font-mono text-teal-300 font-bold">UNIFRANZ-2026-XXXXXX</span> para toda la trazabilidad odontológica.
                            </p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-center shrink-0">
                            <span className="text-[10px] font-bold text-teal-300 uppercase block">Generación IUP</span>
                            <span className="text-xs font-mono font-bold text-white">Automático al Guardar</span>
                        </div>
                    </div>

                    {/* SECCIÓN 1: IDENTIFICACIÓN OFICIAL Y FILIACIÓN */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                            <h3 className="text-base font-bold text-slate-900">Identificación Oficial y Datos Demográficos</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 ml-8.5">
                            Documentación legal y estado civil del paciente para la historia clínica
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cédula de Identidad o Pasaporte *</label>
                                <input
                                    type="text"
                                    value={data.ci}
                                    onChange={(e) => setData('ci', e.target.value)}
                                    placeholder="Ej: 8492014"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                                {errors.ci && <p className="text-rose-600 text-xs mt-1">{errors.ci}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lugar de Expedición</label>
                                <select
                                    value={data.ci_expedido}
                                    onChange={(e) => setData('ci_expedido', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                >
                                    <option value="LP">La Paz (LP)</option>
                                    <option value="SC">Santa Cruz (SC)</option>
                                    <option value="CB">Cochabamba (CB)</option>
                                    <option value="OR">Oruro (OR)</option>
                                    <option value="PT">Potosí (PT)</option>
                                    <option value="TJ">Tarija (TJ)</option>
                                    <option value="CH">Chuquisaca (CH)</option>
                                    <option value="BN">Beni (BN)</option>
                                    <option value="PA">Pando (PA)</option>
                                    <option value="EXT">Extranjero / Pasaporte</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha de Nacimiento *</label>
                                <input
                                    type="date"
                                    value={data.fecha_nacimiento}
                                    onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                                {errors.fecha_nacimiento && <p className="text-rose-600 text-xs mt-1">{errors.fecha_nacimiento}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombres *</label>
                                <input
                                    type="text"
                                    value={data.nombres}
                                    onChange={(e) => setData('nombres', e.target.value)}
                                    placeholder="Nombres completos"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                                {errors.nombres && <p className="text-rose-600 text-xs mt-1">{errors.nombres}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Apellido Paterno *</label>
                                <input
                                    type="text"
                                    value={data.apellido_paterno}
                                    onChange={(e) => setData('apellido_paterno', e.target.value)}
                                    placeholder="Primer apellido"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                                {errors.apellido_paterno && <p className="text-rose-600 text-xs mt-1">{errors.apellido_paterno}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Apellido Materno</label>
                                <input
                                    type="text"
                                    value={data.apellido_materno}
                                    onChange={(e) => setData('apellido_materno', e.target.value)}
                                    placeholder="Segundo apellido"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sexo *</label>
                                <select
                                    value={data.sexo}
                                    onChange={(e) => setData('sexo', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado Civil</label>
                                <select
                                    value={data.estado_civil}
                                    onChange={(e) => setData('estado_civil', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                >
                                    <option value="Soltero">Soltero(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viudo">Viudo(a)</option>
                                    <option value="Union Libre">Unión Libre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nacionalidad</label>
                                <input
                                    type="text"
                                    value={data.nacionalidad}
                                    onChange={(e) => setData('nacionalidad', e.target.value)}
                                    placeholder="Ej: Boliviana, Peruana, etc."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ocupación</label>
                                <input
                                    type="text"
                                    value={data.ocupacion}
                                    onChange={(e) => setData('ocupacion', e.target.value)}
                                    placeholder="Ej: Estudiante, Docente, Comerciante..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nivel de Instrucción</label>
                                <select
                                    value={data.nivel_instruccion}
                                    onChange={(e) => setData('nivel_instruccion', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                >
                                    <option value="Sin Instrucción">Sin Instrucción</option>
                                    <option value="Primaria">Primaria</option>
                                    <option value="Secundaria">Secundaria</option>
                                    <option value="Técnico Medio">Técnico Medio</option>
                                    <option value="Técnico Superior">Técnico Superior</option>
                                    <option value="Licenciatura">Licenciatura / Universitario</option>
                                    <option value="Postgrado">Postgrado / Especialidad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lugar de Nacimiento</label>
                                <input
                                    type="text"
                                    value={data.lugar_nacimiento}
                                    onChange={(e) => setData('lugar_nacimiento', e.target.value)}
                                    placeholder="Ciudad / Localidad de origen"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: CONTACTO Y RECORDATORIOS */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                            <h3 className="text-base font-bold text-slate-900">Datos de Contacto y Residencia</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 ml-8.5">
                            Teléfonos y correo electrónico indispensables para recordatorios automáticos de citas
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección Domiciliaria Completa *</label>
                                <input
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    placeholder="Zona, Avenida/Calle y N° de inmueble"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Teléfono Móvil (Celular) *
                                </label>
                                <input
                                    type="text"
                                    value={data.celular}
                                    onChange={(e) => setData('celular', e.target.value)}
                                    placeholder="Ej: 71234567"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono Fijo</label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    placeholder="Ej: 2491122"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Correo Electrónico (Esencial para Recordatorios)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="paciente@correo.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                    </svg>
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Se enviarán recordatorios de sesiones clínicas y confirmaciones de citas.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: ADMISIÓN CLÍNICA, CONVENIOS Y OPERADOR */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                            <h3 className="text-base font-bold text-slate-900">Admisión Clínica, Convenios y Asignación</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 ml-8.5">
                            Datos de referencia, seguro de salud/convenio y estado administrativo del paciente
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">¿Cómo conoció la clínica?</label>
                                <select
                                    value={data.fuente_referencia}
                                    onChange={(e) => setData('fuente_referencia', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="Referencia interna UNIFRANZ">Referencia interna UNIFRANZ</option>
                                    <option value="Recomendación familiar">Recomendación familiar / Amigos</option>
                                    <option value="Redes Sociales / Publicidad">Redes Sociales / Publicidad</option>
                                    <option value="Campaña Odontológica Comunitaria">Campaña Odontológica Comunitaria</option>
                                    <option value="Convenio Institucional">Convenio Institucional</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seguro / Convenio (Si aplica)</label>
                                <input
                                    type="text"
                                    value={data.seguro_convenio}
                                    onChange={(e) => setData('seguro_convenio', e.target.value)}
                                    placeholder="Ej: Seguro Estudiantil UNIFRANZ, etc."
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Número de Póliza / Carnet Convenio</label>
                                <input
                                    type="text"
                                    value={data.numero_poliza}
                                    onChange={(e) => setData('numero_poliza', e.target.value)}
                                    placeholder="Ej: POL-884920"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado Administrativo del Paciente</label>
                                <select
                                    value={data.estado_paciente}
                                    onChange={(e) => setData('estado_paciente', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="activo">Activo (Habilitado para atención)</option>
                                    <option value="inactivo">Inactivo</option>
                                    <option value="referido">Referido / Transferido</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado Clínico de Tratamiento</label>
                                <select
                                    value={data.estado_clinico}
                                    onChange={(e) => setData('estado_clinico', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="en_evaluacion">En Evaluación Inicial / Diagnóstico</option>
                                    <option value="en_tratamiento">En Tratamiento Activo</option>
                                    <option value="alta_clinica">Alta Clínica Definitiva</option>
                                    <option value="abandono">Abandono de Tratamiento</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estudiante Operador Asignado</label>
                                <select
                                    value={data.estudiante_asignado_id}
                                    onChange={(e) => setData('estudiante_asignado_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">-- Sin asignar (Asignar en Clínica) --</option>
                                    {estudiantes?.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.name} ({est.codigo_institucional || 'Alumno'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: CONTACTO DE EMERGENCIA */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                            <h3 className="text-base font-bold text-slate-900">Contacto en Caso de Emergencia</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 ml-8.5">
                            Persona de contacto inmediato ante cualquier urgencia médica o reacción adversa
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo del Contacto</label>
                                <input
                                    type="text"
                                    value={data.contacto_emergencia}
                                    onChange={(e) => setData('contacto_emergencia', e.target.value)}
                                    placeholder="Familiar o persona de confianza"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parentesco / Relación</label>
                                <input
                                    type="text"
                                    value={data.parentesco_emergencia}
                                    onChange={(e) => setData('parentesco_emergencia', e.target.value)}
                                    placeholder="Ej: Madre, Cónyuge, Hermano..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono de Emergencia</label>
                                <input
                                    type="text"
                                    value={data.telefono_emergencia}
                                    onChange={(e) => setData('telefono_emergencia', e.target.value)}
                                    placeholder="Ej: 72001122"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 5: DOCUMENTACIÓN DIGITAL Y CONSENTIMIENTO INFORMADO INICIAL */}
                    <div className="p-6 border-b border-slate-100 bg-teal-50/30">
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">5</span>
                            <h3 className="text-base font-bold text-slate-900">Documentación Digital y Consentimientos</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-5 ml-8.5">
                            Gestión del consentimiento informado inicial según normativa universitaria UNIFRANZ
                        </p>

                        <div className="space-y-3.5 bg-white p-5 rounded-xl border border-teal-200/80 shadow-2xs">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.reglamento_aceptado}
                                    onChange={(e) => setData('reglamento_aceptado', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">
                                        Aceptación del Reglamento General de la Clínica Odontológica UNIFRANZ *
                                    </span>
                                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                        El paciente declara comprender y aceptar que la atención clínica es realizada por estudiantes de la Carrera de Odontología bajo estricta y permanente supervisión de docentes especialistas acreditados.
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.privacidad_aceptada}
                                    onChange={(e) => setData('privacidad_aceptada', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">
                                        Aceptación de Políticas de Privacidad y Manejo de Datos Sensibles *
                                    </span>
                                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                        Autorización para el tratamiento confidencial de su expediente clínico con fines asistenciales, académicos y de investigación clínica institucional bajo estricto secreto médico.
                                    </span>
                                </div>
                            </label>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mt-2 mb-1">
                                    Observaciones o Cláusulas Especiales de Consentimiento
                                </label>
                                <textarea
                                    rows="2"
                                    value={data.observaciones_consentimiento}
                                    onChange={(e) => setData('observaciones_consentimiento', e.target.value)}
                                    placeholder="Anotaciones relevantes de la admisión..."
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ACCIONES Y BOTONES DE GUARDADO */}
                    <div className="p-6 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center text-xs text-slate-500">
                            <svg className="w-4 h-4 text-emerald-600 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Se generará el IUP único y se creará el expediente clínico vacío con sus 4 módulos iniciales.</span>
                        </div>
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                            <Link
                                href={route('pacientes.index')}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition text-center"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{processing ? 'Registrando...' : 'Registrar Paciente & Abrir Expediente'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
