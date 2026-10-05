import React, { useState, useMemo } from 'react';

export default function TabHistorialTratamientos({
    paciente,
    procedimientos = [],
    onActualizarProcedimientos,
    currentUser,
    roleSlug = 'estudiante',
    isDocenteOrAdmin = false,
    readOnly = false,
}) {
    // Normalizar tratamientos para soportar tanto formato plano previo como formato multisesión continuo
    // Normalizar tratamientos para soportar tanto formato plano previo como formato multisesión continuo
    const tratamientosNormalizados = useMemo(() => {
        return (procedimientos || []).map((item, idx) => {
            if (item.sesiones && Array.isArray(item.sesiones) && item.sesiones.length > 0) {
                return {
                    id: item.id || `trat-${idx}`,
                    titulo: item.titulo || item.procedimiento || 'Tratamiento Odontológico',
                    pieza: item.pieza || '',
                    especialidad: item.especialidad || 'General',
                    estado_general: item.estado_general || 'EN_CURSO',
                    sesiones: item.sesiones.map((s, sIdx) => ({
                        ...s,
                        id: s.id || `ses-${item.id || idx}-${sIdx + 1}`,
                        numero_sesion: s.numero_sesion || sIdx + 1,
                        evidencias: Array.isArray(s.evidencias) ? s.evidencias : [],
                    })),
                };
            }

            // Conversión transparente de registro plano anterior a tratamiento multisesión
            return {
                id: item.id || `trat-${idx}`,
                titulo: item.procedimiento || 'Tratamiento Odontológico',
                pieza: item.pieza || '',
                especialidad: item.especialidad || 'General',
                estado_general: item.estado || (item.estado_academico === 'aprobado' ? 'FINALIZADO' : 'EN_CURSO'),
                sesiones: [
                    {
                        id: item.id ? `${item.id}-s1` : `ses-${idx}-1`,
                        numero_sesion: 1,
                        fecha: item.fecha || new Date().toISOString().split('T')[0],
                        hora: item.hora || '10:00',
                        descripcion: item.descripcion || item.observaciones || '',
                        anestesia: item.anestesia || '',
                        materiales: item.materiales || '',
                        indicaciones_paciente: item.indicaciones_paciente || '',
                        proxima_cita: item.proxima_cita || '',
                        estudiante_nombre: item.estudiante_nombre || item.estudiante || 'Estudiante Operador',
                        estado_academico: item.estado_academico || 'pendiente',
                        calificacion: item.calificacion || null,
                        docente_nombre: item.docente_nombre || '',
                        fecha_firma: item.fecha_firma || null,
                        observaciones_docente: item.observaciones_docente || '',
                        evidencias: Array.isArray(item.evidencias) ? item.evidencias : [],
                    },
                ],
            };
        });
    }, [procedimientos]);

    // Estados de filtrado y búsqueda
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');

    // Estados de modales
    const [modalNuevoTratamientoAbierto, setModalNuevoTratamientoAbierto] = useState(false);
    const [modalNuevaSesionAbierto, setModalNuevaSesionAbierto] = useState(false);
    const [modalEvaluarSesionAbierto, setModalEvaluarSesionAbierto] = useState(false);
    const [modalImprimirAbierto, setModalImprimirAbierto] = useState(false);

    // Estados para Evidencias Clínicas (Fotos intraorales, Radiografías y Documentos PDF)
    const [modalAdjuntarEvidenciaAbierto, setModalAdjuntarEvidenciaAbierto] = useState(false);
    const [sesionParaEvidencia, setSesionParaEvidencia] = useState(null); // { tratamientoId, sesionId, sesionNumero, tratamientoTitulo }
    const [formEvidencia, setFormEvidencia] = useState({
        tipo: 'foto', // 'foto' | 'radiografia' | 'documento'
        titulo: '',
        archivo: null,
        previewUrl: null,
    });
    const [subiendoEvidencia, setSubiendoEvidencia] = useState(false);
    const [modalVisorEvidenciaAbierto, setModalVisorEvidenciaAbierto] = useState(false);
    const [evidenciaActiva, setEvidenciaActiva] = useState(null); // { evidencia, sesionNumero, tratamientoTitulo }

    // Contexto activo para sesión
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
    const [sesionAEvaluar, setSesionAEvaluar] = useState(null);

    // Formulario de Nuevo Tratamiento (con Sesión 1)
    const [formTratamiento, setFormTratamiento] = useState({
        titulo: '',
        pieza: '',
        especialidad: 'Operatoria Dental',
        es_multisesion: true,
        descripcion_sesion1: '',
        materiales: '',
        anestesia: '',
        indicaciones_paciente: '',
        proxima_cita: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidencias: [],
    });

    // Formulario de Nueva Sesión (Evolución de tratamiento existente)
    const [formSesion, setFormSesion] = useState({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        descripcion: '',
        materiales: '',
        anestesia: '',
        indicaciones_paciente: '',
        proxima_cita: '',
        estudiante_nombre: currentUser?.name || 'Estudiante',
        evidencias: [],
    });

    // Formulario de Evaluación / Firma Docente
    const [evalData, setEvalData] = useState({
        estado_academico: 'aprobado',
        calificacion: '100',
        observaciones_docente: '',
    });

    // -------------------------------------------------------------
    // PLANTILLAS CLÍNICAS PREDEFINIDAS PARA ODONTOLOGÍA UNIVERSITARIA
    // -------------------------------------------------------------
    const PLANTILLAS_CLINICAS = [
        {
            titulo: 'Operatoria: Restauración con Resina Compuesta',
            especialidad: 'Operatoria Dental',
            procedimiento: 'Restauración con Resina Compuesta Fotopolimerizable',
            descripcion: 'Se realizó antisepsia con clorhexidina 0.12%, anestesia infiltrativa, aislamiento absoluto con dique de goma y clamp correspondiente. Apertura y eliminación de caries con instrumental rotatorio a baja velocidad y cucharilla dentinaria. Grabado ácido total con ácido fosfórico al 37% durante 15 segundos, lavado profuso por 30 segundos y secado manteniendo humedad dentinaria. Aplicación de adhesivo universal fotopolimerizado por 20 segundos. Reconstrucción anatómica estratificada por técnica incremental oblicua con resina nanohíbrida (incrementos ≤ 2mm). Fotopolimerización final por 40 segundos. Control de oclusión en máxima intercuspidación y movimientos excéntricos con papel articular. Pulido secuencial con discos Sof-Lex y pasta diamantada.',
            materiales: 'Ácido fosfórico 37%, adhesivo universal Single Bond, resina nanohíbrida tono A2/A3, discos de pulido, tiras de lija interproximales.',
            anestesia: 'Lidocaína 2% con epinefrina 1:100.000 (1 carpule de 1.8ml)',
            indicaciones_paciente: 'No masticar alimentos duros o pigmentantes en las siguientes 2 horas. Acudir si nota molestia a la masticación.',
        },
        {
            titulo: 'Periodoncia: Destartraje Supragingival y Profilaxis',
            especialidad: 'Periodoncia',
            procedimiento: 'Destartraje Supragingival y Profilaxis Dental Completa',
            descripcion: 'Sondaje periodontal inicial y detección de biopelícula calcificada. Remoción de cálculos supragingivales en arcada superior e inferior mediante instrumental ultrasónico piezoeléctrico a potencia media-baja con abundante irrigación. Instrumentación manual complementaria con curetas Gracey 1/2 y 7/8 en sectores anteriores y 11/12 y 13/14 en sectores posteriores. Profilaxis coronal con copa de goma, cepillo profiláctico y pasta abrasiva de grano fino. Aplicación tópica de flúor gel neutro al 2% en cubetas durante 4 minutos.',
            materiales: 'Puntas de ultrasonido, curetas Gracey, pasta profiláctica, copas de goma, flúor gel neutro 2%.',
            anestesia: 'No requerida / Gel anestésico tópico en encías inflamadas',
            indicaciones_paciente: 'No ingerir alimentos ni enjuagarse la boca durante los siguientes 30 minutos. Reforzar el uso diario de seda dental.',
        },
        {
            titulo: 'Cirugía: Exodoncia Simple por Vía Alveolar',
            especialidad: 'Cirugía Bucal',
            procedimiento: 'Exodoncia Simple por Vía Alveolar',
            descripcion: 'Asepsia de campo operatorio con povidona yodada y clorhexidina al 0.12%. Anestesia troncular al nervio dentario inferior / infiltrativa vestibular y palatina. Sindesmotomía circunferencial con sindesmótomo curvo liberando inserción epitelial. Luxación mediante elevador recto fino en sentido mesial y distal. Prensión con fórceps adecuado a nivel cervical y tracción progresiva en sentido vestíbulo-lingual hasta avulsión atraumática de la pieza dental, verificando integridad radicular. Curetaje suave del alvéolo, lavado con solución fisiológica estéril y hemostasia compresiva con gasa.',
            materiales: 'Elevadores rectos y curvos, fórceps anatómico, gasa estéril, clorhexidina 0.12%, suero fisiológico.',
            anestesia: 'Mepivacaína al 2% con epinefrina 1:100.000 (2 carpules de 1.8ml)',
            indicaciones_paciente: 'Morder la gasa firmemente por 45 minutos. Dieta blanda y fría las primeras 24 horas. No enjuagarse con fuerza, no escupir ni succionar con pajilla/bombilla. Prescripción de analgésicos según protocolo.',
        },
        {
            titulo: 'Endodoncia: Apertura Cameral y Pulpectomía (Sesión 1)',
            especialidad: 'Endodoncia',
            procedimiento: 'Tratamiento de Conductos: Apertura y Pulpectomía',
            descripcion: 'Diagnóstico de pulpitis irreversible sintomática. Anestesia local infiltrativa y pulpar. Aislamiento absoluto con dique de goma. Apertura cavitaria y remoción del techo de cámara pulpar con fresa Endo-Z. Localización y permeabilización de conductos con limas K-Flex #10 y #15. Extirpación pulpar con tiranervios fino. Irrigación profusa y aspiración con hipoclorito de sodio al 2.5%. Conductometría tentativa y preparación biomecánica cervical con ensanchadores Gates-Glidden. Secado de conductos con conos de papel estéril. Medicación intraconducto con pasta de hidróxido de calcio químicamente puro y sellado cameral con cemento temporal Ionómero de Vidrio (mínimo 3mm de grosor).',
            materiales: 'Dique de goma, limas K #10-#25, conos de papel estériles, hipoclorito de sodio 2.5%, hidróxido de calcio pasta, cemento provisional Cavit/Ionómero.',
            anestesia: 'Articaína 4% con epinefrina 1:100.000 (1.5 carpules)',
            indicaciones_paciente: 'No masticar sobre la pieza tratada. En caso de molestia posoperatoria leve, tomar el analgésico recetado. Acudir puntualmente a la siguiente cita para instrumentación definitiva.',
        },
        {
            titulo: 'Endodoncia: Obturación de Conductos (Sesión 2)',
            especialidad: 'Endodoncia',
            procedimiento: 'Tratamiento de Conductos: Instrumentación y Obturación Final',
            descripcion: 'Paciente asintomático. Remoción de restauración provisional bajo aislamiento absoluto. Irrigación final con EDTA 17% por 1 minuto y NaOCl 2.5% para eliminar barro dentinario. Secado con conos de papel. Selección y calibración de cono maestro de gutapercha (Prueba de cono con sensación de "tug-back" apical). Obturación definitiva por técnica de condensación lateral con conos accesorios y cemento sellador biocerámico/resinoso. Corte de penacho de gutapercha con atacador al rojo cereza a nivel del cuello dentario y condensación vertical. Sellado cameral definitivo con resina fluida.',
            materiales: 'Conos de gutapercha maestro y accesorios, cemento sellador de conductos, atacadores de Schilder, EDTA 17%.',
            anestesia: 'No requerida',
            indicaciones_paciente: 'Control radiográfico a los 6 meses. Proceder con la rehabilitación coronal de la pieza.',
        },
        {
            titulo: 'Odontopediatría: Pulpotomía Temporal y Corona',
            especialidad: 'Odontopediatría',
            procedimiento: 'Pulpotomía en Molar Temporal y Adaptación de Corona de Acero',
            descripcion: 'Manejo conductual adaptativo Decir-Mostrar-Hacer. Anestesia tópica benzocaína 20% y local infiltrativa lenta. Aislamiento absoluto con clamp W8A. Eliminación de tejido cariado y destechado cameral con fresa redonda #4. Amputación de la pulpa cameral con cucharilla afilada hasta la entrada de conductos radiculares. Hemostasia de muñones pulpares mediante compresión con torundas de algodón estéril durante 3 minutos. Fijación con sulfato férrico al 15.5% por 15 segundos y lavado profuso. Colocación de base de Óxido de Zinc Eugenol (IRM). Preparación oclusal y proximal del molar para recepción de corona de acero preformada 3M, recorte y festoneado marginal, y cementación definitiva con ionómero de vidrio tipo I.',
            materiales: 'Sulfato férrico 15.5%, IRM, corona de acero preformada pediátrica, cemento ionómero de vidrio de cementación, dique pediátrico.',
            anestesia: 'Lidocaína 2% con epinefrina 1:100.000 (0.9ml, medio carpule)',
            indicaciones_paciente: 'Supervisar al menor para que no se muerda el labio o la mejilla anestesiada. Evitar alimentos pegajosos las primeras 24 horas.',
        },
        {
            titulo: 'Preventiva: Sellantes de Fosas y Fisuras',
            especialidad: 'Odontología Preventiva',
            procedimiento: 'Sellantes de Fosas y Fisuras Fotopolimerizables',
            descripcion: 'Limpieza mecánica de la superficie oclusal con cepillo profiláctico para contraángulo y agua (sin pasta con flúor). Aislamiento relativo riguroso con rollos de algodón y eyector de alta potencia. Acondicionamiento del esmalte con ácido fosfórico al 37% por 20 segundos abarcando todas las fosas y fisuras anatómicas. Lavado exhaustivo por 30 segundos y secado minucioso hasta obtener aspecto blanco tiza opaco característico. Aplicación cuidadosa del sellante de resina con sonda exploradora evitando burbujas de aire. Fotopolimerización por 20 segundos con lámpara LED (> 1000 mW/cm²). Control de retención y verificación de oclusión.',
            materiales: 'Ácido fosfórico 37%, sellante de fosas y fisuras fotopolimerizable Clinpro/Helioseal, cepillos profilácticos.',
            anestesia: 'No requerida',
            indicaciones_paciente: 'Puede comer y beber normalmente de forma inmediata. Controles semestrales de integridad del sellante.',
        },
    ];

    const aplicarPlantillaNuevo = (plantilla) => {
        setFormTratamiento({
            ...formTratamiento,
            titulo: plantilla.procedimiento,
            especialidad: plantilla.especialidad,
            descripcion_sesion1: plantilla.descripcion,
            materiales: plantilla.materiales,
            anestesia: plantilla.anestesia,
            indicaciones_paciente: plantilla.indicaciones_paciente,
        });
    };

    const aplicarPlantillaSesion = (plantilla) => {
        setFormSesion({
            ...formSesion,
            descripcion: plantilla.descripcion,
            materiales: plantilla.materiales,
            anestesia: plantilla.anestesia,
            indicaciones_paciente: plantilla.indicaciones_paciente,
        });
    };

    // Métricas en tiempo real calculadas de todas las sesiones de todos los tratamientos
    const metricas = useMemo(() => {
        let totalSesiones = 0;
        let pendientes = 0;
        let aprobadas = 0;
        let observadas = 0;

        tratamientosNormalizados.forEach((t) => {
            (t.sesiones || []).forEach((s) => {
                totalSesiones++;
                if (s.estado_academico === 'aprobado') aprobadas++;
                else if (s.estado_academico === 'observado') observadas++;
                else pendientes++;
            });
        });

        return {
            totalTratamientos: tratamientosNormalizados.length,
            totalSesiones,
            pendientes,
            aprobadas,
            observadas,
        };
    }, [tratamientosNormalizados]);

    // Filtrado de tratamientos
    const tratamientosFiltrados = useMemo(() => {
        return tratamientosNormalizados.filter((t) => {
            // Filtro por estado de alguna sesión o estado general
            if (filtroEstado === 'PENDIENTES') {
                const tienePendiente = t.sesiones.some((s) => s.estado_academico === 'pendiente' || !s.estado_academico);
                if (!tienePendiente) return false;
            } else if (filtroEstado === 'APROBADOS') {
                const todasAprobadas = t.sesiones.every((s) => s.estado_academico === 'aprobado');
                if (!todasAprobadas) return false;
            } else if (filtroEstado === 'OBSERVADOS') {
                const tieneObservada = t.sesiones.some((s) => s.estado_academico === 'observado');
                if (!tieneObservada) return false;
            }

            // Filtro por especialidad
            if (filtroEspecialidad !== 'TODAS' && t.especialidad !== filtroEspecialidad) return false;

            // Búsqueda textual
            if (busqueda.trim() !== '') {
                const q = busqueda.toLowerCase();
                const matchTitulo = t.titulo?.toLowerCase().includes(q);
                const matchPieza = t.pieza?.toString().toLowerCase().includes(q);
                const matchEsp = t.especialidad?.toLowerCase().includes(q);
                const matchSesion = t.sesiones.some((s) =>
                    s.descripcion?.toLowerCase().includes(q) ||
                    s.estudiante_nombre?.toLowerCase().includes(q) ||
                    s.docente_nombre?.toLowerCase().includes(q)
                );
                if (!matchTitulo && !matchPieza && !matchEsp && !matchSesion) return false;
            }

            return true;
        });
    }, [tratamientosNormalizados, filtroEstado, filtroEspecialidad, busqueda]);

    // Crear Nuevo Tratamiento (con Sesión 1)
    const handleCrearTratamiento = (e) => {
        e.preventDefault();
        if (!formTratamiento.titulo) {
            alert('Por favor especifica el nombre o diagnóstico del tratamiento.');
            return;
        }

        const idTratamiento = `trat-${Date.now()}`;
        const nuevoTratamiento = {
            id: idTratamiento,
            titulo: formTratamiento.titulo,
            pieza: formTratamiento.pieza || 'General',
            especialidad: formTratamiento.especialidad,
            estado_general: 'EN_CURSO',
            sesiones: [
                {
                    id: `ses-${Date.now()}-1`,
                    numero_sesion: 1,
                    fecha: formTratamiento.fecha,
                    hora: formTratamiento.hora,
                    descripcion: formTratamiento.descripcion_sesion1,
                    anestesia: formTratamiento.anestesia,
                    materiales: formTratamiento.materiales,
                    indicaciones_paciente: formTratamiento.indicaciones_paciente,
                    proxima_cita: formTratamiento.proxima_cita,
                    estudiante_nombre: currentUser?.name || 'Estudiante Operador',
                    estado_academico: 'pendiente',
                    calificacion: null,
                    docente_nombre: '',
                    fecha_firma: null,
                    observaciones_docente: '',
                    evidencias: formTratamiento.evidencias || [],
                },
            ],
        };

        const nuevaLista = [nuevoTratamiento, ...tratamientosNormalizados];
        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }

        setModalNuevoTratamientoAbierto(false);
        setFormTratamiento({
            titulo: '',
            pieza: '',
            especialidad: 'Operatoria Dental',
            es_multisesion: true,
            descripcion_sesion1: '',
            materiales: '',
            anestesia: '',
            indicaciones_paciente: '',
            proxima_cita: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evidencias: [],
        });
    };

    // Agregar Nueva Sesión a un Tratamiento Existente (Continuación clínica / Relevo de estudiante)
    const handleAbrirNuevaSesion = (tratamiento) => {
        setTratamientoSeleccionado(tratamiento);
        setFormSesion({
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            descripcion: '',
            materiales: '',
            anestesia: '',
            indicaciones_paciente: '',
            proxima_cita: '',
            estudiante_nombre: currentUser?.name || 'Estudiante Operador',
            evidencias: [],
        });
        setModalNuevaSesionAbierto(true);
    };

    const handleGuardarNuevaSesion = (e) => {
        e.preventDefault();
        if (!tratamientoSeleccionado || !formSesion.descripcion) {
            alert('Por favor redacta la descripción del procedimiento de esta sesión.');
            return;
        }

        const nuevaSesion = {
            id: `ses-${Date.now()}-${tratamientoSeleccionado.sesiones.length + 1}`,
            numero_sesion: tratamientoSeleccionado.sesiones.length + 1,
            fecha: formSesion.fecha,
            hora: formSesion.hora,
            descripcion: formSesion.descripcion,
            anestesia: formSesion.anestesia,
            materiales: formSesion.materiales,
            indicaciones_paciente: formSesion.indicaciones_paciente,
            proxima_cita: formSesion.proxima_cita,
            estudiante_nombre: formSesion.estudiante_nombre || currentUser?.name || 'Estudiante',
            estado_academico: 'pendiente',
            calificacion: null,
            docente_nombre: '',
            fecha_firma: null,
            observaciones_docente: '',
            evidencias: formSesion.evidencias || [],
        };

        const nuevaLista = tratamientosNormalizados.map((t) => {
            if (t.id === tratamientoSeleccionado.id) {
                return {
                    ...t,
                    sesiones: [...t.sesiones, nuevaSesion],
                };
            }
            return t;
        });

        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }

        setModalNuevaSesionAbierto(false);
        setTratamientoSeleccionado(null);
    };

    // Cambiar estado general del tratamiento (Finalizar, Derivar, Abandonar)
    const handleCambiarEstadoGeneral = (tratamientoId, nuevoEstado) => {
        const nuevaLista = tratamientosNormalizados.map((t) => {
            if (t.id === tratamientoId) {
                return { ...t, estado_general: nuevoEstado };
            }
            return t;
        });
        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }
    };

    // Evaluación / Firma Docente de una Sesión
    const handleAbrirEvaluacionSesion = (tratamiento, sesion) => {
        setTratamientoSeleccionado(tratamiento);
        setSesionAEvaluar(sesion);
        setEvalData({
            estado_academico: sesion.estado_academico === 'observado' ? 'observado' : 'aprobado',
            calificacion: sesion.calificacion || '100',
            observaciones_docente: sesion.observaciones_docente || '',
        });
        setModalEvaluarSesionAbierto(true);
    };

    const handleConfirmarEvaluacionSesion = (e) => {
        e.preventDefault();
        if (!tratamientoSeleccionado || !sesionAEvaluar) return;

        const nuevaLista = tratamientosNormalizados.map((t) => {
            if (t.id === tratamientoSeleccionado.id) {
                const sesionesActualizadas = t.sesiones.map((s) => {
                    if (s.id === sesionAEvaluar.id) {
                        return {
                            ...s,
                            estado_academico: evalData.estado_academico,
                            calificacion: evalData.calificacion ? parseInt(evalData.calificacion) : null,
                            observaciones_docente: evalData.observaciones_docente,
                            docente_nombre: currentUser?.name || 'Docente Supervisor',
                            fecha_firma: new Date().toLocaleString(),
                        };
                    }
                    return s;
                });
                return { ...t, sesiones: sesionesActualizadas };
            }
            return t;
        });

        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }

        setModalEvaluarSesionAbierto(false);
        setTratamientoSeleccionado(null);
        setSesionAEvaluar(null);
    };

    // Eliminar una sesión
    const handleEliminarSesion = (tratamientoId, sesionId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta sesión del tratamiento?')) return;
        const nuevaLista = tratamientosNormalizados.map((t) => {
            if (t.id === tratamientoId) {
                const sesionesRestantes = t.sesiones.filter((s) => s.id !== sesionId);
                return { ...t, sesiones: sesionesRestantes };
            }
            return t;
        }).filter((t) => t.sesiones.length > 0);

        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }
    };

    // -------------------------------------------------------------
    // GESTIÓN DE EVIDENCIAS CLÍNICAS (FOTOS, RADIOGRAFÍAS Y DOCUMENTOS)
    // -------------------------------------------------------------
    const handleSubirEvidenciaDirecta = async (file, tipo = 'foto', titulo = '') => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tipo', tipo);
        if (titulo) formData.append('titulo', titulo);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await window.axios.post(
                route('pacientes.tratamientos.subir-evidencia', paciente.id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                }
            );
            if (res.data && res.data.success && res.data.evidencia) {
                return res.data.evidencia;
            }
        } catch (err) {
            console.warn('Fallo upload servidor, usando fallback local FileReader:', err);
        }

        // Fallback local seguro (FileReader)
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const ext = file.name.split('.').pop().toLowerCase();
                const isPdf = ext === 'pdf';
                const formattedSize = file.size >= 1048576
                    ? `${(file.size / 1048576).toFixed(1)} MB`
                    : `${(file.size / 1024).toFixed(1)} KB`;
                resolve({
                    id: `evi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    tipo: tipo || (isPdf ? 'documento' : 'foto'),
                    titulo: titulo || file.name.replace(/\.[^/.]+$/, ''),
                    url: e.target.result,
                    nombre_archivo: file.name,
                    extension: ext,
                    tamano: formattedSize,
                    fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    subido_por: currentUser?.name || 'Estudiante Operador',
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAbrirAdjuntarEvidencia = (tratamiento, sesion) => {
        setSesionParaEvidencia({
            tratamientoId: tratamiento.id,
            sesionId: sesion.id,
            sesionNumero: sesion.numero_sesion,
            tratamientoTitulo: tratamiento.titulo,
        });
        setFormEvidencia({
            tipo: 'foto',
            titulo: '',
            archivo: null,
            previewUrl: null,
        });
        setModalAdjuntarEvidenciaAbierto(true);
    };

    const handleGuardarEvidenciaEnSesion = async (e) => {
        e.preventDefault();
        if (!sesionParaEvidencia || !formEvidencia.archivo) {
            alert('Por favor selecciona un archivo de imagen o documento PDF.');
            return;
        }

        setSubiendoEvidencia(true);
        try {
            const evidenciaSubida = await handleSubirEvidenciaDirecta(
                formEvidencia.archivo,
                formEvidencia.tipo,
                formEvidencia.titulo
            );

            if (!evidenciaSubida) {
                alert('No se pudo procesar la evidencia seleccionada.');
                return;
            }

            const nuevaLista = tratamientosNormalizados.map((t) => {
                if (t.id === sesionParaEvidencia.tratamientoId) {
                    const sesionesActualizadas = t.sesiones.map((s) => {
                        if (s.id === sesionParaEvidencia.sesionId) {
                            return {
                                ...s,
                                evidencias: [...(s.evidencias || []), evidenciaSubida],
                            };
                        }
                        return s;
                    });
                    return { ...t, sesiones: sesionesActualizadas };
                }
                return t;
            });

            if (onActualizarProcedimientos) {
                onActualizarProcedimientos(nuevaLista);
            }

            setModalAdjuntarEvidenciaAbierto(false);
            setSesionParaEvidencia(null);
            setFormEvidencia({
                tipo: 'foto',
                titulo: '',
                archivo: null,
                previewUrl: null,
            });
        } catch (err) {
            console.error('Error al guardar evidencia:', err);
            alert('Ocurrió un error al subir el archivo.');
        } finally {
            setSubiendoEvidencia(false);
        }
    };

    const handleEliminarEvidencia = (tratamientoId, sesionId, evidenciaId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este archivo de evidencia clínica?')) return;
        const nuevaLista = tratamientosNormalizados.map((t) => {
            if (t.id === tratamientoId) {
                const sesionesActualizadas = t.sesiones.map((s) => {
                    if (s.id === sesionId) {
                        return {
                            ...s,
                            evidencias: (s.evidencias || []).filter((evi) => evi.id !== evidenciaId),
                        };
                    }
                    return s;
                });
                return { ...t, sesiones: sesionesActualizadas };
            }
            return t;
        });

        if (onActualizarProcedimientos) {
            onActualizarProcedimientos(nuevaLista);
        }
    };

    const handleAbrirVisorEvidencia = (evidencia, sesionNumero, tratamientoTitulo) => {
        setEvidenciaActiva({
            evidencia,
            sesionNumero,
            tratamientoTitulo,
        });
        setModalVisorEvidenciaAbierto(true);
    };

    // Subida para Nuevo Tratamiento
    const handleSubirEvidenciaFormTratamiento = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        const tipoDefault = ext === 'pdf' ? 'documento' : 'foto';
        const subida = await handleSubirEvidenciaDirecta(file, tipoDefault, file.name.replace(/\.[^/.]+$/, ''));
        if (subida) {
            setFormTratamiento((prev) => ({
                ...prev,
                evidencias: [...(prev.evidencias || []), subida],
            }));
        }
        e.target.value = '';
    };

    const handleEliminarEvidenciaFormTratamiento = (idx) => {
        setFormTratamiento((prev) => ({
            ...prev,
            evidencias: prev.evidencias.filter((_, i) => i !== idx),
        }));
    };

    // Subida para Nueva Sesión
    const handleSubirEvidenciaFormSesion = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        const tipoDefault = ext === 'pdf' ? 'documento' : 'foto';
        const subida = await handleSubirEvidenciaDirecta(file, tipoDefault, file.name.replace(/\.[^/.]+$/, ''));
        if (subida) {
            setFormSesion((prev) => ({
                ...prev,
                evidencias: [...(prev.evidencias || []), subida],
            }));
        }
        e.target.value = '';
    };

    const handleEliminarEvidenciaFormSesion = (idx) => {
        setFormSesion((prev) => ({
            ...prev,
            evidencias: prev.evidencias.filter((_, i) => i !== idx),
        }));
    };

    return (
        <div className="space-y-6">
            {/* 1. TARJETAS DE MÉTRICAS CLÍNICAS (KPIS) SIN EMOJIS, CON LOGOS SVG */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Total Tratamientos
                        </span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block">
                            {metricas.totalTratamientos}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            {metricas.totalSesiones} {metricas.totalSesiones === 1 ? 'sesión registrada' : 'sesiones registradas'}
                        </span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                            Pendientes de Firma
                        </span>
                        <span className="text-2xl font-black text-amber-900 mt-1 block">
                            {metricas.pendientes}
                        </span>
                        <span className="text-[11px] text-amber-700 font-medium">Sesiones por evaluar</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                            Sesiones Aprobadas
                        </span>
                        <span className="text-2xl font-black text-emerald-900 mt-1 block">
                            {metricas.aprobadas}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">Con visto bueno docente</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                            Observadas
                        </span>
                        <span className="text-2xl font-black text-rose-900 mt-1 block">
                            {metricas.observadas}
                        </span>
                        <span className="text-[11px] text-rose-700 font-medium">Requieren corrección</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. BARRA DE ACCIONES Y CONTROLES SUPERIORES */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                            Hoja de Evolución Clínica y Tratamientos Periódicos
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Cardex de tratamientos continuos multisesión con firma docente individual y trazabilidad de relevo de estudiantes.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setModalImprimirAbierto(true)}
                            className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition shadow-2xs"
                        >
                            <svg className="w-4 h-4 mr-1.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir Hoja Oficial
                        </button>

                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => setModalNuevoTratamientoAbierto(true)}
                                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Tratamiento
                            </button>
                        )}
                    </div>
                </div>

                {/* FILTROS Y BÚSQUEDA */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setFiltroEstado('TODOS')}
                            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                filtroEstado === 'TODOS' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Todos ({metricas.totalTratamientos})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroEstado('PENDIENTES')}
                            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                filtroEstado === 'PENDIENTES' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Con Pendientes ({metricas.pendientes})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroEstado('APROBADOS')}
                            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                filtroEstado === 'APROBADOS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Aprobados ({metricas.aprobadas})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroEstado('OBSERVADOS')}
                            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                filtroEstado === 'OBSERVADOS' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Con Observación ({metricas.observadas})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                        >
                            <option value="TODAS">Todas las Especialidades</option>
                            <option value="Operatoria Dental">Operatoria Dental</option>
                            <option value="Endodoncia">Endodoncia</option>
                            <option value="Periodoncia">Periodoncia</option>
                            <option value="Cirugía Bucal">Cirugía Bucal</option>
                            <option value="Odontopediatría">Odontopediatría</option>
                            <option value="Prótesis Fija / Removible">Prótesis</option>
                            <option value="Ortodoncia">Ortodoncia</option>
                            <option value="Odontología Preventiva">Preventiva</option>
                        </select>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar pieza, tratamiento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 sm:w-56 focus:bg-white"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. LISTADO DE TRATAMIENTOS CON SESIONES ANIDADAS */}
            <div className="space-y-4">
                {tratamientosFiltrados.length === 0 ? (
                    <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-base text-slate-800">Sin tratamientos registrados</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No se encontraron tratamientos ni procedimientos que coincidan con los filtros seleccionados.
                        </p>
                    </div>
                ) : (
                    tratamientosFiltrados.map((trat) => (
                        <div
                            key={trat.id}
                            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
                        >
                            {/* Cabecera del Tratamiento */}
                            <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 text-xs font-black rounded-lg">
                                            {trat.pieza ? `Pieza ${trat.pieza}` : 'General'}
                                        </span>
                                        <h4 className="font-black text-slate-900 text-base">
                                            {trat.titulo}
                                        </h4>
                                        <span className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-md">
                                            {trat.especialidad}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        Evolución: {trat.sesiones.length} {trat.sesiones.length === 1 ? 'sesión' : 'sesiones clínicas'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Selector de estado general del tratamiento */}
                                    <select
                                        value={trat.estado_general || 'EN_CURSO'}
                                        onChange={(e) => handleCambiarEstadoGeneral(trat.id, e.target.value)}
                                        disabled={readOnly}
                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
                                    >
                                        <option value="EN_CURSO">En Progreso</option>
                                        <option value="FINALIZADO">Finalizado con Exito</option>
                                        <option value="DERIVADO">Derivado / Relevo</option>
                                        <option value="ABANDONADO">Abandonado</option>
                                    </select>

                                    {/* Botón para agregar una nueva sesión a este tratamiento */}
                                    {!readOnly && trat.estado_general !== 'FINALIZADO' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAbrirNuevaSesion(trat)}
                                            className="inline-flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                                            title="Registrar una nueva cita o evolución clínica en este tratamiento"
                                        >
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            + Agregar Sesión
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Línea de Sesiones / Evoluciones Clínicas */}
                            <div className="p-5 space-y-4">
                                {trat.sesiones.map((sesion, sIdx) => {
                                    const isAprobado = sesion.estado_academico === 'aprobado';
                                    const isObservado = sesion.estado_academico === 'observado';
                                    const isPendiente = !isAprobado && !isObservado;

                                    return (
                                        <div
                                            key={sesion.id || sIdx}
                                            className="relative pl-6 sm:pl-8 border-l-2 border-teal-500/30 space-y-2.5 pb-4 last:pb-0"
                                        >
                                            {/* Indicador de nodo cronológico */}
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                                            </div>

                                            {/* Cabecera de la sesión */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="text-xs font-black text-slate-800">
                                                        Sesión #{sesion.numero_sesion || sIdx + 1}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Fecha: <strong className="text-slate-700">{sesion.fecha} {sesion.hora || ''}</strong>
                                                    </span>
                                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                                                        Operador: {sesion.estudiante_nombre}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {isAprobado && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold">
                                                            <svg className="w-3.5 h-3.5 mr-1 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Aprobado {sesion.calificacion ? `(${sesion.calificacion} pts)` : ''}
                                                        </span>
                                                    )}

                                                    {isObservado && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[11px] font-bold">
                                                            <svg className="w-3.5 h-3.5 mr-1 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            Observado
                                                        </span>
                                                    )}

                                                    {isPendiente && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold">
                                                            <svg className="w-3.5 h-3.5 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Pendiente Firma
                                                        </span>
                                                    )}

                                                    {/* Botón de evaluación docente al pie del sillón */}
                                                    {isDocenteOrAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbrirEvaluacionSesion(trat, sesion)}
                                                            className="inline-flex items-center px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs transition"
                                                            title="Firmar o evaluar sesión docente"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                            {isAprobado ? 'Modificar V°B°' : 'Evaluar Sesión'}
                                                        </button>
                                                    )}

                                                    {!readOnly && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEliminarSesion(trat.id, sesion.id)}
                                                            className="p-1 text-slate-400 hover:text-rose-600 transition rounded-md"
                                                            title="Eliminar sesión"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Detalle descriptivo de la sesión */}
                                            <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                                                <p className="whitespace-pre-wrap">{sesion.descripcion}</p>
                                            </div>

                                            {/* Insumos, Anestesia e Indicaciones */}
                                            {(sesion.anestesia || sesion.materiales || sesion.indicaciones_paciente) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                                    {sesion.anestesia && (
                                                        <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900">
                                                            <strong className="block text-blue-950 font-bold mb-0.5">Anestesia:</strong>
                                                            <span>{sesion.anestesia}</span>
                                                        </div>
                                                    )}
                                                    {sesion.materiales && (
                                                        <div className="p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900">
                                                            <strong className="block text-indigo-950 font-bold mb-0.5">Materiales:</strong>
                                                            <span>{sesion.materiales}</span>
                                                        </div>
                                                    )}
                                                    {sesion.indicaciones_paciente && (
                                                        <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-lg text-amber-900">
                                                            <strong className="block text-amber-950 font-bold mb-0.5">Indicaciones:</strong>
                                                            <span>{sesion.indicaciones_paciente}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Observaciones del docente */}
                                            {sesion.observaciones_docente && (
                                                <div className={`p-3 rounded-xl border text-xs ${
                                                    isObservado
                                                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                }`}>
                                                    <div className="font-bold flex items-center gap-1.5 mb-1">
                                                        <span>{isObservado ? 'Corrección Docente Requerida:' : 'Visto Bueno Docente:'}</span>
                                                        <span className="text-[10px] opacity-75">
                                                            Por {sesion.docente_nombre} ({sesion.fecha_firma})
                                                        </span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{sesion.observaciones_docente}</p>
                                                </div>
                                            )}

                                            {/* EVIDENCIAS CLÍNICAS (FOTOS, RADIOGRAFÍAS Y DOCUMENTOS) */}
                                            <div className="pt-2 border-t border-slate-200/70 space-y-2.5">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800">
                                                            Evidencias Clínicas Adjuntas {sesion.evidencias && sesion.evidencias.length > 0 ? `(${sesion.evidencias.length})` : ''}
                                                        </span>
                                                    </div>

                                                    {!readOnly && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbrirAdjuntarEvidencia(trat, sesion)}
                                                            className="inline-flex items-center px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition shadow-2xs"
                                                            title="Adjuntar fotografías clínicas, radiografías o documentos PDF"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Adjuntar Evidencia
                                                        </button>
                                                    )}
                                                </div>

                                                {sesion.evidencias && sesion.evidencias.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {sesion.evidencias.map((evi) => {
                                                            const isFoto = evi.tipo === 'foto';
                                                            const isRx = evi.tipo === 'radiografia';
                                                            const isDoc = evi.tipo === 'documento' || evi.extension === 'pdf';

                                                            return (
                                                                <div
                                                                    key={evi.id}
                                                                    className="group relative bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden hover:border-teal-300 transition flex flex-col justify-between"
                                                                >
                                                                    {/* Vista previa / Contenedor interactivo */}
                                                                    <div
                                                                        onClick={() => handleAbrirVisorEvidencia(evi, sesion.numero_sesion || sIdx + 1, trat.titulo)}
                                                                        className="cursor-pointer relative overflow-hidden bg-slate-100 h-28 flex items-center justify-center"
                                                                    >
                                                                        {isFoto && (
                                                                            <img
                                                                                src={evi.url}
                                                                                alt={evi.titulo}
                                                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                                            />
                                                                        )}
                                                                        {isRx && (
                                                                            <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                                                                                <img
                                                                                    src={evi.url}
                                                                                    alt={evi.titulo}
                                                                                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-300"
                                                                                />
                                                                                <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 bg-black/70 text-teal-300 rounded">
                                                                                    RX
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {isDoc && (
                                                                            <div className="flex flex-col items-center justify-center p-3 text-center">
                                                                                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-1">
                                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                                    Documento PDF
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Badge de categoría */}
                                                                        <span className={`absolute top-1.5 left-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs ${
                                                                            isFoto ? 'bg-teal-600 text-white' : (isRx ? 'bg-slate-900 text-teal-300 border border-teal-500/50' : 'bg-rose-600 text-white')
                                                                        }`}>
                                                                            {isFoto ? 'Foto Clínica' : (isRx ? 'Radiografía' : 'Documento')}
                                                                        </span>

                                                                        {/* Overlay hover */}
                                                                        {(isFoto || isRx) && (
                                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Pie informativo */}
                                                                    <div className="p-2.5 space-y-1.5">
                                                                        <h5
                                                                            title={evi.titulo}
                                                                            className="text-xs font-bold text-slate-900 truncate"
                                                                        >
                                                                            {evi.titulo}
                                                                        </h5>
                                                                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                                            <span>{evi.tamano || 'Archivo'}</span>
                                                                            <span>{evi.fecha ? evi.fecha.split(' ')[0] : ''}</span>
                                                                        </div>

                                                                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleAbrirVisorEvidencia(evi, sesion.numero_sesion || sIdx + 1, trat.titulo)}
                                                                                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                </svg>
                                                                                Ver {isDoc ? 'PDF' : 'Completa'}
                                                                            </button>

                                                                            <div className="flex items-center gap-1">
                                                                                <a
                                                                                    href={evi.url}
                                                                                    download={evi.nombre_archivo || 'evidencia'}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="p-1 text-slate-400 hover:text-slate-700 transition rounded"
                                                                                    title="Descargar archivo original"
                                                                                >
                                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                    </svg>
                                                                                </a>

                                                                                {!readOnly && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleEliminarEvidencia(trat.id, sesion.id, evi.id)}
                                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                                                                                        title="Eliminar evidencia"
                                                                                    >
                                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                        </svg>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    !readOnly && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbrirAdjuntarEvidencia(trat, sesion)}
                                                            className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-teal-400 rounded-xl bg-slate-50/50 hover:bg-teal-50/30 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-teal-700 transition"
                                                        >
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <span>Sin evidencias registradas. Clic para adjuntar fotos intraorales, radiografías o consentimiento PDF</span>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. MODAL: NUEVO TRATAMIENTO CON PLANTILLAS RÁPIDAS (SESIÓN 1) */}
            {modalNuevoTratamientoAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Iniciar Nuevo Tratamiento Odontológico
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Define el plan terapéutico y registra la primera sesión de atención.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalNuevoTratamientoAbierto(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCrearTratamiento} className="p-5 sm:p-6 space-y-5">
                            {/* Plantillas clínicas rápidas */}
                            <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-teal-900">
                                        Plantillas Rápidas Universitarias (1 Clic)
                                    </span>
                                    <span className="text-[10px] text-teal-700 font-semibold">
                                        Autocompleta descripción y materiales técnicos
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                                    {PLANTILLAS_CLINICAS.map((pl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => aplicarPlantillaNuevo(pl)}
                                            className="px-3 py-1.5 bg-white hover:bg-teal-600 hover:text-white text-slate-700 font-bold rounded-xl border border-teal-200 transition shadow-2xs whitespace-nowrap"
                                        >
                                            {pl.titulo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Pieza Dental FDI
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 16, 21, General..."
                                        value={formTratamiento.pieza}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, pieza: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Especialidad Odontológica *
                                    </label>
                                    <select
                                        value={formTratamiento.especialidad}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, especialidad: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                                        required
                                    >
                                        <option value="Operatoria Dental">Operatoria Dental</option>
                                        <option value="Endodoncia">Endodoncia</option>
                                        <option value="Periodoncia">Periodoncia</option>
                                        <option value="Cirugía Bucal">Cirugía Bucal</option>
                                        <option value="Odontopediatría">Odontopediatría</option>
                                        <option value="Prótesis Fija / Removible">Prótesis Fija / Removible</option>
                                        <option value="Ortodoncia">Ortodoncia</option>
                                        <option value="Odontología Preventiva">Odontología Preventiva</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        value={formTratamiento.fecha}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, fecha: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    Título / Nombre del Tratamiento *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Endodoncia Molar Pieza 36, Restauración con Resina..."
                                    value={formTratamiento.titulo}
                                    onChange={(e) => setFormTratamiento({ ...formTratamiento, titulo: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    Descripción Técnica de la Sesión #1 *
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Detalla los pasos clínicos, instrumental, respuesta del paciente..."
                                    value={formTratamiento.descripcion_sesion1}
                                    onChange={(e) => setFormTratamiento({ ...formTratamiento, descripcion_sesion1: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Anestesia Empleada
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Lidocaína 2% 1:100.000 (1 carpule)"
                                        value={formTratamiento.anestesia}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, anestesia: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Materiales e Insumos
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Resina Z350, ácido gravador, adhesivo..."
                                        value={formTratamiento.materiales}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, materiales: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Indicaciones al Paciente
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Dieta blanda, no masticar duro las primeras 2 horas..."
                                        value={formTratamiento.indicaciones_paciente}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, indicaciones_paciente: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Próxima Cita (Continuación del Tratamiento)
                                    </label>
                                    <input
                                        type="date"
                                        value={formTratamiento.proxima_cita}
                                        onChange={(e) => setFormTratamiento({ ...formTratamiento, proxima_cita: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Evidencias Clínicas Iniciales (Fotos, Radiografías o Documentos PDF) */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs font-bold text-slate-800">
                                            Evidencias Clínicas Iniciales (Fotos, RX o Consentimiento PDF)
                                        </span>
                                    </div>
                                    <label className="cursor-pointer inline-flex items-center px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-2xs">
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Adjuntar Archivo
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                            onChange={handleSubirEvidenciaFormTratamiento}
                                        />
                                    </label>
                                </div>

                                {formTratamiento.evidencias && formTratamiento.evidencias.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {formTratamiento.evidencias.map((evi, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                                                <div className="flex items-center gap-2 truncate mr-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                                        evi.tipo === 'foto' ? 'bg-teal-100 text-teal-800' : (evi.tipo === 'radiografia' ? 'bg-slate-800 text-teal-300' : 'bg-rose-100 text-rose-800')
                                                    }`}>
                                                        {evi.tipo}
                                                    </span>
                                                    <span className="font-bold text-slate-800 truncate">{evi.titulo}</span>
                                                    <span className="text-[10px] text-slate-400">({evi.tamano})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarEvidenciaFormTratamiento(idx)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                    title="Quitar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-400 italic">
                                        No has adjuntado evidencias aún. Puedes adjuntar fotos intraorales preoperatorias, radiografías o el consentimiento informado firmado.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalNuevoTratamientoAbierto(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    Guardar Tratamiento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. MODAL: AGREGAR NUEVA SESIÓN A TRATAMIENTO EN CURSO */}
            {modalNuevaSesionAbierto && tratamientoSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-slate-200">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Agregar Sesión #{tratamientoSeleccionado.sesiones.length + 1}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Continuación clínica de: <strong className="text-slate-800">{tratamientoSeleccionado.titulo}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalNuevaSesionAbierto(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGuardarNuevaSesion} className="p-5 sm:p-6 space-y-4">
                            {/* Plantillas clínicas para la sesión */}
                            <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-2">
                                <span className="text-xs font-bold text-teal-900 block">
                                    Cargar Plantilla de Sesión Rápida:
                                </span>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                                    {PLANTILLAS_CLINICAS.map((pl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => aplicarPlantillaSesion(pl)}
                                            className="px-3 py-1 bg-white hover:bg-teal-600 hover:text-white text-slate-700 font-bold rounded-xl border border-teal-200 transition shadow-2xs whitespace-nowrap"
                                        >
                                            {pl.titulo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Fecha *</label>
                                    <input
                                        type="date"
                                        value={formSesion.fecha}
                                        onChange={(e) => setFormSesion({ ...formSesion, fecha: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Hora</label>
                                    <input
                                        type="time"
                                        value={formSesion.hora}
                                        onChange={(e) => setFormSesion({ ...formSesion, hora: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Estudiante Operador *</label>
                                    <input
                                        type="text"
                                        value={formSesion.estudiante_nombre}
                                        onChange={(e) => setFormSesion({ ...formSesion, estudiante_nombre: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    Procedimiento Realizado en Esta Sesión *
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe los pasos clínicos ejecutados hoy, evolución del tratamiento..."
                                    value={formSesion.descripcion}
                                    onChange={(e) => setFormSesion({ ...formSesion, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Anestesia</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Sin anestesia / Lidocaína 2%"
                                        value={formSesion.anestesia}
                                        onChange={(e) => setFormSesion({ ...formSesion, anestesia: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Materiales Empleados</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Limas rotatorias, NaOCl 2.5%, etc."
                                        value={formSesion.materiales}
                                        onChange={(e) => setFormSesion({ ...formSesion, materiales: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Indicaciones al Paciente</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: No masticar sobre la pieza, analgésico..."
                                        value={formSesion.indicaciones_paciente}
                                        onChange={(e) => setFormSesion({ ...formSesion, indicaciones_paciente: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Próxima Sesión / Cita</label>
                                    <input
                                        type="date"
                                        value={formSesion.proxima_cita}
                                        onChange={(e) => setFormSesion({ ...formSesion, proxima_cita: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Evidencias Clínicas de la Sesión (Fotos, Radiografías o Documentos PDF) */}
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs font-bold text-slate-800">
                                            Evidencias de la Sesión (Fotos Intraorales, RX o PDF)
                                        </span>
                                    </div>
                                    <label className="cursor-pointer inline-flex items-center px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-2xs">
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Adjuntar Archivo
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                            onChange={handleSubirEvidenciaFormSesion}
                                        />
                                    </label>
                                </div>

                                {formSesion.evidencias && formSesion.evidencias.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {formSesion.evidencias.map((evi, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                                                <div className="flex items-center gap-2 truncate mr-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                                        evi.tipo === 'foto' ? 'bg-teal-100 text-teal-800' : (evi.tipo === 'radiografia' ? 'bg-slate-800 text-teal-300' : 'bg-rose-100 text-rose-800')
                                                    }`}>
                                                        {evi.tipo}
                                                    </span>
                                                    <span className="font-bold text-slate-800 truncate">{evi.titulo}</span>
                                                    <span className="text-[10px] text-slate-400">({evi.tamano})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarEvidenciaFormSesion(idx)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                    title="Quitar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-400 italic">
                                        Opcional: Adjunta fotos del procedimiento de hoy, radiografías de control o consentimientos.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalNuevaSesionAbierto(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    Guardar Sesión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. MODAL: FIRMA Y EVALUACIÓN DOCENTE POR SESIÓN (AL PIE DEL SILLÓN) */}
            {modalEvaluarSesionAbierto && sesionAEvaluar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                        <div className="p-5 bg-teal-600 text-white flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Firma y Supervisión Docente
                                </h3>
                                <p className="text-xs text-teal-100 mt-0.5">
                                    Evaluación clínica de la sesión #{sesionAEvaluar.numero_sesion} al pie del sillón.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalEvaluarSesionAbierto(false)}
                                className="text-teal-200 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleConfirmarEvaluacionSesion} className="p-5 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                <div><strong className="text-slate-800">Tratamiento:</strong> {tratamientoSeleccionado?.titulo}</div>
                                <div><strong className="text-slate-800">Operador:</strong> {sesionAEvaluar.estudiante_nombre} • <strong>Fecha:</strong> {sesionAEvaluar.fecha}</div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                                    Dictamen Clínico *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition ${
                                        evalData.estado_academico === 'aprobado'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="dictamen"
                                            value="aprobado"
                                            checked={evalData.estado_academico === 'aprobado'}
                                            onChange={() => setEvalData({ ...evalData, estado_academico: 'aprobado' })}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-xs">Aprobar y Firmar</span>
                                    </label>

                                    <label className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition ${
                                        evalData.estado_academico === 'observado'
                                            ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="dictamen"
                                            value="observado"
                                            checked={evalData.estado_academico === 'observado'}
                                            onChange={() => setEvalData({ ...evalData, estado_academico: 'observado' })}
                                            className="text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-xs">Observar (Corrección)</span>
                                    </label>
                                </div>
                            </div>

                            {evalData.estado_academico === 'aprobado' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                        Calificación Práctica (0 a 100 Puntos)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="100"
                                        value={evalData.calificacion}
                                        onChange={(e) => setEvalData({ ...evalData, calificacion: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    {evalData.estado_academico === 'observado'
                                        ? 'Instrucción Obligatoria de Corrección Clínica *'
                                        : 'Observaciones Docente (Opcional)'}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={evalData.estado_academico === 'observado'
                                        ? 'Detalla qué debe corregir el alumno antes de aprobar la sesión...'
                                        : 'Técnica correcta, buen aislamiento...'}
                                    value={evalData.observaciones_docente}
                                    onChange={(e) => setEvalData({ ...evalData, observaciones_docente: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                                    required={evalData.estado_academico === 'observado'}
                                />
                            </div>

                            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                                <span>Docente: <strong className="text-slate-900">{currentUser?.name || 'Dr. Carlos Mendoza'}</strong></span>
                                <span>Fecha: <strong>{new Date().toLocaleDateString()}</strong></span>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalEvaluarSesionAbierto(false)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-1.5 text-white rounded-xl text-xs font-bold shadow-xs transition ${
                                        evalData.estado_academico === 'aprobado'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    Confirmar Dictamen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 7. MODAL: VISTA IMPRIMIBLE FORMAL DE HOJA DE EVOLUCIÓN */}
            {modalImprimirAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="font-black text-lg text-slate-900">Vista de Impresión Oficial</h3>
                                <p className="text-xs text-slate-500">Hoja de Evolución y Tratamientos Odontológicos Universitarios</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
                                >
                                    Imprimir Documento
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalImprimirAbierto(false)}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        <div className="p-8 border border-slate-300 rounded-2xl bg-white space-y-6 text-slate-800 font-sans print:border-none print:p-0">
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                                <div>
                                    <h1 className="text-xl font-black uppercase text-teal-800 tracking-wider">
                                        Universidad Franz Tamayo
                                    </h1>
                                    <h2 className="text-sm font-bold text-slate-700">
                                        Facultad de Ciencias de la Salud • Carrera de Odontología
                                    </h2>
                                    <p className="text-xs text-slate-500">Clínica Odontológica Universitaria Unifranz</p>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="font-bold block text-sm text-slate-900">HOJA DE EVOLUCIÓN CLÍNICA</span>
                                    <span>Código Paciente: <strong>#{paciente.id}</strong></span>
                                    <br />
                                    <span>CI: <strong>{paciente.ci} {paciente.ci_expedido || ''}</strong></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div><strong className="block text-slate-500 uppercase text-[10px]">Paciente:</strong> {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno || ''}</div>
                                <div><strong className="block text-slate-500 uppercase text-[10px]">Edad / Sexo:</strong> {paciente.edad} años • {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                                <div><strong className="block text-slate-500 uppercase text-[10px]">Teléfono:</strong> {paciente.telefono || paciente.celular || 'No registrado'}</div>
                                <div><strong className="block text-slate-500 uppercase text-[10px]">Alergias:</strong> {paciente.alertas_medicas && paciente.alertas_medicas.length > 0 ? 'Sí (Ver Alerta)' : 'Ninguna'}</div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold">
                                            <th className="border border-slate-300 p-2">Fecha/Hora</th>
                                            <th className="border border-slate-300 p-2">Tratamiento & Pieza</th>
                                            <th className="border border-slate-300 p-2">Detalle de la Sesión</th>
                                            <th className="border border-slate-300 p-2">Estudiante Operador</th>
                                            <th className="border border-slate-300 p-2">Firma / Sello Docente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tratamientosNormalizados.map((t) =>
                                            t.sesiones.map((s, sIdx) => (
                                                <tr key={`${t.id}-${s.id || sIdx}`} className="border border-slate-300">
                                                    <td className="border border-slate-300 p-2 font-bold whitespace-nowrap">
                                                        {s.fecha} {s.hora || ''}
                                                    </td>
                                                    <td className="border border-slate-300 p-2">
                                                        <strong className="text-slate-900 block">{t.titulo}</strong>
                                                        <span className="text-[11px] text-slate-500">
                                                            {t.pieza ? `Pieza ${t.pieza}` : 'General'} • Sesión #{s.numero_sesion || sIdx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="border border-slate-300 p-2 max-w-xs">
                                                        <div>{s.descripcion}</div>
                                                        {s.evidencias && s.evidencias.length > 0 && (
                                                            <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-teal-850">
                                                                <strong className="text-teal-900">Evidencias ({s.evidencias.length}):</strong>{' '}
                                                                {s.evidencias.map((e) => `[${e.tipo.toUpperCase()}] ${e.titulo}`).join('; ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="border border-slate-300 p-2 font-medium">{s.estudiante_nombre}</td>
                                                    <td className="border border-slate-300 p-2 font-semibold">
                                                        {s.estado_academico === 'aprobado' ? (
                                                            <span className="text-emerald-700 font-bold block">
                                                                Aprobado por: {s.docente_nombre || 'Docente'} ({s.calificacion ? `${s.calificacion} pts` : 'V°B°'})
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Pendiente de firma</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
                                <div>
                                    <div className="border-t border-slate-400 pt-2 font-bold text-slate-800">
                                        Firma del Estudiante Operador
                                    </div>
                                    <span className="text-slate-500 text-[11px]">C.I. / Matrícula Estudiantil</span>
                                </div>
                                <div>
                                    <div className="border-t border-slate-400 pt-2 font-bold text-slate-800">
                                        Firma y Sello del Docente Supervisor
                                    </div>
                                    <span className="text-slate-500 text-[11px]">Clínica Odontológica Universitaria Unifranz</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: ADJUNTAR EVIDENCIA CLÍNICA A SESIÓN ESPECÍFICA */}
            {modalAdjuntarEvidenciaAbierto && sesionParaEvidencia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
                            <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    Adjuntar Evidencia Clínica
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Sesión #{sesionParaEvidencia.sesionNumero} • {sesionParaEvidencia.tratamientoTitulo}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalAdjuntarEvidenciaAbierto(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleGuardarEvidenciaEnSesion} className="p-5 space-y-4">
                            {/* Selector de Tipo de Evidencia */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                                    Tipo de Evidencia Odontológica *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormEvidencia({ ...formEvidencia, tipo: 'foto' })}
                                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                            formEvidencia.tipo === 'foto'
                                                ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-[11px]">Foto Clínica</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormEvidencia({ ...formEvidencia, tipo: 'radiografia' })}
                                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                            formEvidencia.tipo === 'radiografia'
                                                ? 'bg-slate-900 border-slate-900 text-teal-300 font-bold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                        <span className="text-[11px]">Radiografía</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormEvidencia({ ...formEvidencia, tipo: 'documento' })}
                                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                                            formEvidencia.tipo === 'documento'
                                                ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-[11px]">Doc. PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Título o descripción */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    Título / Descripción de la Evidencia *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Foto pre-operatoria pieza 46, RX periapical obturación..."
                                    value={formEvidencia.titulo}
                                    onChange={(e) => setFormEvidencia({ ...formEvidencia, titulo: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                                />
                            </div>

                            {/* File Input con dropzone visual */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                    Archivo (Imagen PNG/JPG/WEBP o Documento PDF) *
                                </label>
                                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-teal-50/30 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        required
                                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                                                setFormEvidencia({
                                                    ...formEvidencia,
                                                    archivo: file,
                                                    previewUrl,
                                                    titulo: formEvidencia.titulo || file.name.replace(/\.[^/.]+$/, ''),
                                                });
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {formEvidencia.archivo ? (
                                        <div className="space-y-2">
                                            {formEvidencia.previewUrl && (
                                                <img
                                                    src={formEvidencia.previewUrl}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover mx-auto rounded-xl border border-slate-200 shadow-xs"
                                                />
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{formEvidencia.archivo.name}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {(formEvidencia.archivo.size / 1024).toFixed(1)} KB • Clic para cambiar archivo
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Arrastra o haz clic para seleccionar</p>
                                            <p className="text-[10px] text-slate-400">Formatos soportados: JPG, PNG, WEBP, PDF (Máx. 15MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAdjuntarEvidenciaAbierto(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={subiendoEvidencia}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                                >
                                    {subiendoEvidencia ? (
                                        <>
                                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Subiendo...</span>
                                        </>
                                    ) : (
                                        <span>Guardar y Adjuntar</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 9. MODAL: MEDICAL LIGHTBOX & VISOR DE EVIDENCIA CLÍNICA / DOCUMENTOS */}
            {modalVisorEvidenciaAbierto && evidenciaActiva && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
                    <div className="bg-slate-900 text-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-800">
                        {/* Cabecera del Visor */}
                        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
                            <div className="space-y-0.5 truncate">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                                        evidenciaActiva.evidencia.tipo === 'foto' ? 'bg-teal-600 text-white' : (evidenciaActiva.evidencia.tipo === 'radiografia' ? 'bg-slate-800 text-teal-300 border border-teal-500/40' : 'bg-rose-600 text-white')
                                    }`}>
                                        {evidenciaActiva.evidencia.tipo === 'foto' ? 'Foto Clínica' : (evidenciaActiva.evidencia.tipo === 'radiografia' ? 'Radiografía' : 'Documento PDF')}
                                    </span>
                                    <h4 className="font-bold text-sm text-slate-100 truncate">
                                        {evidenciaActiva.evidencia.titulo}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Tratamiento: {evidenciaActiva.tratamientoTitulo} • Sesión #{evidenciaActiva.sesionNumero}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={evidenciaActiva.evidencia.url}
                                    download={evidenciaActiva.evidencia.nombre_archivo || 'evidencia'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                                    title="Descargar archivo"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setModalVisorEvidenciaAbierto(false)}
                                    className="p-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-xl transition"
                                    title="Cerrar visor"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido / Visualizador */}
                        <div className="p-4 sm:p-6 flex-1 flex items-center justify-center overflow-auto bg-black/40 min-h-[350px]">
                            {evidenciaActiva.evidencia.tipo === 'documento' || evidenciaActiva.evidencia.extension === 'pdf' ? (
                                <iframe
                                    src={evidenciaActiva.evidencia.url}
                                    title={evidenciaActiva.evidencia.titulo}
                                    className="w-full h-[65vh] rounded-2xl bg-white border border-slate-700"
                                />
                            ) : (
                                <img
                                    src={evidenciaActiva.evidencia.url}
                                    alt={evidenciaActiva.evidencia.titulo}
                                    className="max-h-[72vh] max-w-full object-contain mx-auto rounded-xl shadow-2xl"
                                />
                            )}
                        </div>

                        {/* Pie informativo */}
                        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-2">
                            <div>
                                Archivo: <strong className="text-slate-200">{evidenciaActiva.evidencia.nombre_archivo}</strong> ({evidenciaActiva.evidencia.tamano})
                            </div>
                            <div>
                                Registrado por: <strong className="text-slate-200">{evidenciaActiva.evidencia.subido_por}</strong> • {evidenciaActiva.evidencia.fecha}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
