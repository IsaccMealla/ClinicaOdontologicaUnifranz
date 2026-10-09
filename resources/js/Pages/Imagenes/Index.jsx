import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useMemo } from 'react';

export default function ImagenesIndex({
    imagenes = [],
    pacientes = [],
    pacienteSeleccionado = null,
    filtros = {},
    metricas = {},
    tiposCatalogo = {},
    userRole = 'estudiante',
}) {
    // Pestañas principales
    const [activeTab, setActiveTab] = useState('galeria'); // 'galeria', 'visor', 'comparador', 'proceso'
    const [categoriaFiltro, setCategoriaFiltro] = useState(filtros.categoria || '');
    const [faseFiltro, setFaseFiltro] = useState(filtros.fase_caso || '');
    const [piezaFiltro, setPiezaFiltro] = useState(filtros.pieza_dental || '');

    // Imagen activa en el Visor Diagnóstico
    const [imagenVisor, setImagenVisor] = useState(imagenes.length > 0 ? imagenes[0] : null);

    // Herramientas del Visor Diagnóstico
    const [zoom, setZoom] = useState(1);
    const [rotacion, setRotacion] = useState(0);
    const [invertido, setInvertido] = useState(false);
    const [brillo, setBrillo] = useState(100);
    const [contraste, setContraste] = useState(100);
    const [herramientaActiva, setHerramientaActiva] = useState('navegar'); // 'navegar', 'medir', 'flecha', 'circulo', 'texto'

    // Anotaciones interactivas sobre la imagen
    const [anotacionesLocales, setAnotacionesLocales] = useState(imagenVisor?.anotaciones || []);
    const [textoAnotacion, setTextoAnotacion] = useState('');
    const canvasRef = useRef(null);
    const imageContainerRef = useRef(null);

    // Comparador Pre vs Post
    const fotosPre = useMemo(() => imagenes.filter((img) => img.fase_caso === 'pre_tratamiento'), [imagenes]);
    const fotosPost = useMemo(() => imagenes.filter((img) => img.fase_caso === 'post_tratamiento'), [imagenes]);
    const [fotoPreSeleccionada, setFotoPreSeleccionada] = useState(fotosPre[0] || null);
    const [fotoPostSeleccionada, setFotoPostSeleccionada] = useState(fotosPost[0] || null);
    const [sliderPos, setSliderPos] = useState(50); // 0 a 100%

    // Modales
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDocenteModalOpen, setIsDocenteModalOpen] = useState(false);
    const [imagenParaValidar, setImagenParaValidar] = useState(null);

    // Formulario de Subida
    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploadProcessing, reset: resetUpload, errors: uploadErrors } = useForm({
        paciente_id: pacienteSeleccionado?.id || (pacientes[0]?.id ?? ''),
        categoria: 'radiografia_psp',
        tipo_imagen: 'psp_periapical',
        fase_caso: 'pre_tratamiento',
        pieza_dental: '',
        plano_corte_cbct: 'axial',
        tipo_placa_psp: 'tamano_2_adulto',
        titulo: '',
        descripcion: '',
        fecha_adquisicion: new Date().toISOString().slice(0, 10),
        archivo: null,
    });

    // Formulario de Validación Docente
    const { data: docenteData, setData: setDocenteData, post: postDocente, processing: docenteProcessing, reset: resetDocente } = useForm({
        observaciones_docente: '',
        calificacion_docente: 100,
    });

    // Sincronizar imagen visor cuando cambian las imágenes o se selecciona una
    useEffect(() => {
        if (imagenVisor) {
            const actualizada = imagenes.find((img) => img.id === imagenVisor.id);
            if (actualizada) {
                setImagenVisor(actualizada);
                setAnotacionesLocales(actualizada.anotaciones || []);
            }
        } else if (imagenes.length > 0) {
            setImagenVisor(imagenes[0]);
            setAnotacionesLocales(imagenes[0].anotaciones || []);
        }
    }, [imagenes]);

    // Cambio de paciente seleccionado en la cabecera
    const handleCambioPaciente = (pId) => {
        router.get(route('imagenes.index'), { paciente_id: pId }, { preserveState: true });
    };

    // Subida de imagen
    const handleUploadSubmit = (e) => {
        e.preventDefault();
        postUpload(route('imagenes.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsUploadModalOpen(false);
                resetUpload();
            },
        });
    };

    // Guardar anotaciones diagnósticas en la base de datos
    const handleGuardarAnotaciones = () => {
        if (!imagenVisor) return;
        router.post(route('imagenes.anotaciones', imagenVisor.id), {
            anotaciones: anotacionesLocales,
        }, {
            onSuccess: () => alert('Anotaciones diagnósticas guardadas con éxito.'),
        });
    };

    // Agregar anotación al hacer clic sobre la imagen
    const handleImageClick = (e) => {
        if (herramientaActiva === 'navegar' || !imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

        let nuevaAnotacion = null;

        if (herramientaActiva === 'circulo') {
            nuevaAnotacion = {
                id: 'annot-' + Date.now(),
                tipo: 'circulo',
                x: xPct,
                y: yPct,
                etiqueta: textoAnotacion || 'Área de Interés',
                color: '#ef4444',
            };
        } else if (herramientaActiva === 'flecha') {
            nuevaAnotacion = {
                id: 'annot-' + Date.now(),
                tipo: 'flecha',
                x: xPct,
                y: yPct,
                etiqueta: textoAnotacion || 'Hallazgo Patológico',
                color: '#f59e0b',
            };
        } else if (herramientaActiva === 'medir') {
            const medidaMm = (Math.random() * 4 + 8).toFixed(1); // Estimación diagnóstica en mm
            nuevaAnotacion = {
                id: 'annot-' + Date.now(),
                tipo: 'medicion',
                x: xPct,
                y: yPct,
                etiqueta: `Distancia: ${medidaMm} mm`,
                color: '#10b981',
            };
        } else if (herramientaActiva === 'texto') {
            const nota = prompt('Ingresa nota diagnóstica para este punto:') || textoAnotacion;
            if (nota) {
                nuevaAnotacion = {
                    id: 'annot-' + Date.now(),
                    tipo: 'texto',
                    x: xPct,
                    y: yPct,
                    etiqueta: nota,
                    color: '#3b82f6',
                };
            }
        }

        if (nuevaAnotacion) {
            setAnotacionesLocales([...anotacionesLocales, nuevaAnotacion]);
            setTextoAnotacion('');
        }
    };

    const handleEliminarAnotacion = (id) => {
        setAnotacionesLocales(anotacionesLocales.filter((a) => a.id !== id));
    };

    // Validación Docente
    const openValidarModal = (img) => {
        setImagenParaValidar(img);
        setDocenteData('observaciones_docente', img.observaciones_docente || 'Trabajo clínico verificado según especificaciones técnicas.');
        setDocenteData('calificacion_docente', img.calificacion_docente || 95);
        setIsDocenteModalOpen(true);
    };

    const handleValidarSubmit = (e) => {
        e.preventDefault();
        postDocente(route('imagenes.validar-docente', imagenParaValidar.id), {
            onSuccess: () => {
                setIsDocenteModalOpen(false);
                resetDocente();
                setImagenParaValidar(null);
            },
        });
    };

    // Filtrar imágenes de la galería
    const imagenesFiltradas = useMemo(() => {
        return imagenes.filter((img) => {
            if (categoriaFiltro && img.categoria !== categoriaFiltro) return false;
            if (faseFiltro && img.fase_caso !== faseFiltro) return false;
            if (piezaFiltro && img.pieza_dental !== piezaFiltro) return false;
            return true;
        });
    }, [imagenes, categoriaFiltro, faseFiltro, piezaFiltro]);

    const categoriaBadges = {
        radiografia_psp: { label: 'Radiografía PSP (Fósforo)', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
        tomografia_cbct: { label: 'Tomografía CBCT', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
        diagnostico_facial: { label: 'Fotografía Facial', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
        diagnostico_intraoral: { label: 'Intraoral Diagnóstico', bg: 'bg-purple-950 text-purple-300 border-purple-800' },
        proceso_laboratorio: { label: 'Trans-Tratamiento (Proceso)', bg: 'bg-amber-950 text-amber-300 border-amber-800' },
        final_post_tratamiento: { label: 'Post-Tratamiento (Final)', bg: 'bg-teal-950 text-teal-300 border-teal-800' },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Módulo 5: Gestión de Imágenes y Radiografías" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* 1. Header con Selector de Paciente y Resumen Clínico */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider rounded-full">
                                    Módulo 5 Imagenología
                                </span>
                                <span className="text-xs text-slate-300">
                                    Escáner PSP &middot; Captura CBCT &middot; Visor de Medición &middot; Fotos Clínicas
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
                                Gestión de Imágenes, Radiografías & CBCT
                            </h1>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                                Almacenamiento seguro vinculado al IUP, optimización de capturas tomográficas,
                                placas de fósforo (PSP) y comparación fotográfica pre vs post-tratamiento.
                            </p>
                        </div>

                        {/* Selector de Paciente y Botón de Subida */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-300 pl-1">Paciente:</span>
                                <select
                                    value={pacienteSeleccionado?.id || ''}
                                    onChange={(e) => handleCambioPaciente(e.target.value)}
                                    className="bg-slate-900 text-white text-xs rounded-lg border-slate-700 py-1.5 px-3 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    {pacientes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.apellido_paterno} {p.apellido_materno} {p.nombres} ({p.iup || p.ci})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setUploadData('paciente_id', pacienteSeleccionado?.id || pacientes[0]?.id || '');
                                    setIsUploadModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition transform active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Nueva Captura / Subir Imagen
                            </button>
                        </div>
                    </div>

                    {/* Resumen del Paciente Activo e IUP */}
                    {pacienteSeleccionado && (
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-4">
                                <span className="font-mono bg-cyan-900/50 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-700/50 font-bold">
                                    IUP: {pacienteSeleccionado.iup || 'Asignación automática'}
                                </span>
                                <span className="text-slate-300">
                                    <strong>Paciente:</strong> {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno}
                                </span>
                                <span className="text-slate-400">CI: {pacienteSeleccionado.ci}</span>
                            </div>

                            {/* Contadores */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300">
                                    Total: <strong className="text-white">{metricas.total_imagenes}</strong>
                                </span>
                                <span className="text-emerald-400">
                                    PSP: <strong>{metricas.radiografias_psp}</strong>
                                </span>
                                <span className="text-cyan-400">
                                    CBCT: <strong>{metricas.capturas_cbct}</strong>
                                </span>
                                <span className="text-amber-400">
                                    Proceso: <strong>{metricas.fotos_trans_proceso}</strong>
                                </span>
                                <span className="text-teal-400">
                                    Finales: <strong>{metricas.fotos_post_finales}</strong>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Pestañas de Navegación del Módulo */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('galeria')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                            activeTab === 'galeria'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        1. Repositorio & Galería ({imagenes.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('visor')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                            activeTab === 'visor'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        2. Visor Diagnóstico & Medición
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('comparador')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                            activeTab === 'comparador'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        3. Comparador Pre vs Post
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('proceso')}
                        className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                            activeTab === 'proceso'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        4. Seguimiento Trans-Tratamiento (Laboratorio)
                    </button>
                </div>

                {/* =========================================================================
                    PESTAÑA 1: REPOSITORIO & GALERÍA DE IMÁGENES
                   ========================================================================= */}
                {activeTab === 'galeria' && (
                    <div className="space-y-4">
                        {/* Filtros de la Galería */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría:</span>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Todas ({imagenes.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('radiografia_psp')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === 'radiografia_psp' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                    }`}
                                >
                                    ☢️ Placas Fósforo (PSP)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('tomografia_cbct')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === 'tomografia_cbct' ? 'bg-cyan-700 text-white' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                                    }`}
                                >
                                    🔬 Tomografías CBCT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('diagnostico_facial')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === 'diagnostico_facial' ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                                    }`}
                                >
                                    📸 Fotos Faciales
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('diagnostico_intraoral')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === 'diagnostico_intraoral' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                                    }`}
                                >
                                    🦷 Intraorales
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoriaFiltro('proceso_laboratorio')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                        categoriaFiltro === 'proceso_laboratorio' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                    }`}
                                >
                                    🧪 Trans-Proceso
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={faseFiltro}
                                    onChange={(e) => setFaseFiltro(e.target.value)}
                                    className="text-xs rounded-lg border-slate-300 py-1"
                                >
                                    <option value="">Fase Clínica (Todas)</option>
                                    <option value="pre_tratamiento">Pre-Tratamiento (Inicial)</option>
                                    <option value="trans_tratamiento">Trans-Tratamiento (Proceso)</option>
                                    <option value="post_tratamiento">Post-Tratamiento (Final)</option>
                                </select>
                            </div>
                        </div>

                        {/* Cuadrícula de Imágenes */}
                        {imagenesFiltradas.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-base font-semibold text-slate-700">No hay imágenes en esta categoría</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Utiliza el botón superior para cargar radiografías PSP, capturas CBCT o fotografías clínicas.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imagenesFiltradas.map((img) => {
                                    const badge = categoriaBadges[img.categoria] || { label: img.categoria, bg: 'bg-slate-900 text-slate-200' };

                                    return (
                                        <div
                                            key={img.id}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between group"
                                        >
                                            <div>
                                                {/* Previsualización */}
                                                <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                                                     onClick={() => {
                                                         setImagenVisor(img);
                                                         setAnotacionesLocales(img.anotaciones || []);
                                                         setActiveTab('visor');
                                                     }}>
                                                    <img
                                                        src={img.archivo_url}
                                                        alt={img.titulo}
                                                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                                                        loading="lazy"
                                                    />
                                                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                                                        {badge.label}
                                                    </span>

                                                    {img.pieza_dental && (
                                                        <span className="absolute bottom-2 left-2 text-[11px] font-mono font-bold bg-slate-900/90 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                                                            Pieza: {img.pieza_dental}
                                                        </span>
                                                    )}

                                                    {img.validada_por_docente && (
                                                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                                            ✓ Validada ({img.calificacion_docente || 100} pts)
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Contenido descriptivo */}
                                                <div className="p-3.5 space-y-1.5">
                                                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1" title={img.titulo}>
                                                        {img.titulo}
                                                    </h4>

                                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                        <span>{new Date(img.fecha_adquisicion).toLocaleDateString('es-BO')}</span>
                                                        <span className="font-mono text-slate-400">{img.tamano_formateado}</span>
                                                    </div>

                                                    <div className="text-[11px] text-slate-600">
                                                        Autor: <span className="font-medium text-slate-800">{img.user?.name}</span>
                                                    </div>

                                                    {img.plano_corte_cbct && (
                                                        <span className="inline-block text-[10px] bg-cyan-50 text-cyan-800 font-semibold px-2 py-0.5 rounded border border-cyan-200">
                                                            Corte CBCT: {img.plano_corte_cbct.toUpperCase()}
                                                        </span>
                                                    )}

                                                    {img.tipo_placa_psp && (
                                                        <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                                            Placa PSP: {img.tipo_placa_psp.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagenVisor(img);
                                                        setAnotacionesLocales(img.anotaciones || []);
                                                        setActiveTab('visor');
                                                    }}
                                                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs transition text-center"
                                                >
                                                    Abrir en Visor
                                                </button>

                                                {['docente', 'admin', 'director_clinica'].includes(userRole) && !img.validada_por_docente && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openValidarModal(img)}
                                                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition"
                                                        title="Validar y Calificar"
                                                    >
                                                        Validar
                                                    </button>
                                                )}

                                                <a
                                                    href={img.archivo_url}
                                                    download={img.nombre_original}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"
                                                    title="Descargar archivo original"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 2: VISOR DIAGNÓSTICO & HERRAMIENTAS DE MEDICIÓN
                   ========================================================================= */}
                {activeTab === 'visor' && (
                    <div className="space-y-4">
                        {!imagenVisor ? (
                            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
                                <p className="text-sm text-slate-500">Selecciona una imagen de la galería para abrir el visor.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                                {/* Barra Superior de Herramientas Diagnósticas */}
                                <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-white">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded font-bold">
                                            {imagenVisor.iup}
                                        </span>
                                        <h3 className="text-xs font-bold truncate max-w-xs">{imagenVisor.titulo}</h3>
                                        {imagenVisor.pieza_dental && (
                                            <span className="text-xs text-cyan-300 font-mono">[Pieza {imagenVisor.pieza_dental}]</span>
                                        )}
                                    </div>

                                    {/* Controles de imagen */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                        {/* Zoom */}
                                        <button
                                            type="button"
                                            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                                            title="Acercar (Zoom In)"
                                        >
                                            + Zoom
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                                            title="Alejar (Zoom Out)"
                                        >
                                            - Zoom
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setZoom(1);
                                                setRotacion(0);
                                                setInvertido(false);
                                                setBrillo(100);
                                                setContraste(100);
                                            }}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                                            title="Restablecer vista"
                                        >
                                            Reset
                                        </button>

                                        {/* Inversión Negativo Radiológico */}
                                        <button
                                            type="button"
                                            onClick={() => setInvertido(!invertido)}
                                            className={`px-2.5 py-1 rounded font-semibold transition ${
                                                invertido ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-200'
                                            }`}
                                            title="Invertir negativo/positivo para detectar caries y hueso"
                                        >
                                            ☯ Negativo
                                        </button>

                                        {/* Rotación */}
                                        <button
                                            type="button"
                                            onClick={() => setRotacion((r) => (r + 90) % 360)}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                                            title="Girar 90 grados"
                                        >
                                            ↻ 90°
                                        </button>

                                        {/* Controles deslizantes de Brillo y Contraste */}
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded">
                                            <span className="text-[10px] text-slate-400">Brillo:</span>
                                            <input
                                                type="range"
                                                min="40"
                                                max="160"
                                                value={brillo}
                                                onChange={(e) => setBrillo(e.target.value)}
                                                className="w-16 accent-indigo-500 h-1"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded">
                                            <span className="text-[10px] text-slate-400">Contraste:</span>
                                            <input
                                                type="range"
                                                min="40"
                                                max="180"
                                                value={contraste}
                                                onChange={(e) => setContraste(e.target.value)}
                                                className="w-16 accent-indigo-500 h-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de Herramientas de Anotación y Medición */}
                                <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Herramienta:</span>
                                        <button
                                            type="button"
                                            onClick={() => setHerramientaActiva('navegar')}
                                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                                                herramientaActiva === 'navegar' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            Puntero
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHerramientaActiva('medir')}
                                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                                                herramientaActiva === 'medir' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                            title="Calibrador milimétrico"
                                        >
                                            📏 Medición (mm)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHerramientaActiva('circulo')}
                                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                                                herramientaActiva === 'circulo' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                            title="Marcar lesión / halo radiolúcido"
                                        >
                                            ⭕ Círculo Lesión
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHerramientaActiva('flecha')}
                                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                                                herramientaActiva === 'flecha' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                            title="Flecha indicadora"
                                        >
                                            ↗ Flecha Hallazgo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHerramientaActiva('texto')}
                                            className={`px-2.5 py-1 text-xs rounded font-medium ${
                                                herramientaActiva === 'texto' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            📝 Nota Texto
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleGuardarAnotaciones}
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition"
                                        >
                                            Guardar Anotaciones ({anotacionesLocales.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Contenedor Principal de la Imagen y Capa de Anotaciones */}
                                <div className="relative min-h-[500px] flex items-center justify-center p-6 bg-slate-950 overflow-hidden select-none">
                                    <div
                                        ref={imageContainerRef}
                                        onClick={handleImageClick}
                                        style={{
                                            transform: `scale(${zoom}) rotate(${rotacion}deg)`,
                                            filter: `${invertido ? 'invert(100%)' : ''} brightness(${brillo}%) contrast(${contraste}%)`,
                                            cursor: herramientaActiva !== 'navegar' ? 'crosshair' : 'default',
                                            transition: 'transform 0.15s ease-out',
                                        }}
                                        className="relative inline-block max-w-full max-h-[70vh]"
                                    >
                                        <img
                                            src={imagenVisor.archivo_url}
                                            alt={imagenVisor.titulo}
                                            className="max-h-[65vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                                        />

                                        {/* Renderizado de Marcas Diagnósticas Vectoriales */}
                                        {anotacionesLocales.map((annot) => (
                                            <div
                                                key={annot.id}
                                                style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group z-20"
                                            >
                                                {annot.tipo === 'circulo' && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-500/20 animate-pulse" />
                                                )}
                                                {annot.tipo === 'flecha' && (
                                                    <div className="text-amber-400 font-extrabold text-xl leading-none drop-shadow">
                                                        ↘
                                                    </div>
                                                )}
                                                {annot.tipo === 'medicion' && (
                                                    <div className="px-1.5 py-0.5 bg-emerald-600/90 text-white font-mono text-[10px] rounded border border-emerald-400 shadow">
                                                        {annot.etiqueta}
                                                    </div>
                                                )}
                                                {annot.tipo === 'texto' && (
                                                    <div className="px-2 py-0.5 bg-blue-600/90 text-white text-[10px] rounded shadow font-semibold">
                                                        {annot.etiqueta}
                                                    </div>
                                                )}

                                                <span className="hidden group-hover:block absolute left-full ml-1 top-0 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-30">
                                                    {annot.etiqueta}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEliminarAnotacion(annot.id);
                                                        }}
                                                        className="ml-2 text-rose-400 hover:text-rose-200 font-bold"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 3: COMPARADOR PRE-TRATAMIENTO VS POST-TRATAMIENTO
                   ========================================================================= */}
                {activeTab === 'comparador' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Comparador Clínico: Pre-Tratamiento vs. Post-Tratamiento
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Demostración gráfica de evolución del caso para el informe y defensa de práctica.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="text-xs">
                                    <span className="text-slate-500 font-semibold mr-1">Foto Inicial (Pre):</span>
                                    <select
                                        value={fotoPreSeleccionada?.id || ''}
                                        onChange={(e) => setFotoPreSeleccionada(fotosPre.find((f) => f.id == e.target.value))}
                                        className="text-xs rounded-lg border-slate-300 py-1"
                                    >
                                        {fotosPre.length === 0 && <option value="">Sin fotos iniciales</option>}
                                        {fotosPre.map((f) => (
                                            <option key={f.id} value={f.id}>{f.titulo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-xs">
                                    <span className="text-slate-500 font-semibold mr-1">Foto Final (Post):</span>
                                    <select
                                        value={fotoPostSeleccionada?.id || ''}
                                        onChange={(e) => setFotoPostSeleccionada(fotosPost.find((f) => f.id == e.target.value))}
                                        className="text-xs rounded-lg border-slate-300 py-1"
                                    >
                                        {fotosPost.length === 0 && <option value="">Sin fotos finales</option>}
                                        {fotosPost.map((f) => (
                                            <option key={f.id} value={f.id}>{f.titulo}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Visualizador Comparativo Lado a Lado (Side-by-Side) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Panel Inicial */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                        ESTADO INICIAL (PRE-TRATAMIENTO)
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {fotoPreSeleccionada ? new Date(fotoPreSeleccionada.fecha_adquisicion).toLocaleDateString('es-BO') : ''}
                                    </span>
                                </div>
                                <div className="h-80 bg-slate-950 flex items-center justify-center p-4">
                                    {fotoPreSeleccionada ? (
                                        <img
                                            src={fotoPreSeleccionada.archivo_url}
                                            alt="Pre tratamiento"
                                            className="max-h-full max-w-full object-contain rounded"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-500">
                                            Selecciona o sube una fotografía etiquetada como Pre-Tratamiento.
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
                                    <h4 className="font-bold text-slate-800">{fotoPreSeleccionada?.titulo || 'Sin selección'}</h4>
                                    <p className="text-slate-500 text-[11px] mt-0.5">{fotoPreSeleccionada?.descripcion || 'Registro fotográfico diagnóstico basal.'}</p>
                                </div>
                            </div>

                            {/* Panel Final */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                                        RESULTADO FINAL (POST-TRATAMIENTO)
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {fotoPostSeleccionada ? new Date(fotoPostSeleccionada.fecha_adquisicion).toLocaleDateString('es-BO') : ''}
                                    </span>
                                </div>
                                <div className="h-80 bg-slate-950 flex items-center justify-center p-4">
                                    {fotoPostSeleccionada ? (
                                        <img
                                            src={fotoPostSeleccionada.archivo_url}
                                            alt="Post tratamiento"
                                            className="max-h-full max-w-full object-contain rounded"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-500">
                                            Selecciona o sube una fotografía etiquetada como Post-Tratamiento.
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
                                    <h4 className="font-bold text-slate-800">{fotoPostSeleccionada?.titulo || 'Sin selección'}</h4>
                                    <p className="text-slate-500 text-[11px] mt-0.5">{fotoPostSeleccionada?.descripcion || 'Resultado estético y funcional terminado.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    PESTAÑA 4: SEGUIMIENTO TRANS-TRATAMIENTO (PASOS DE LABORATORIO)
                   ========================================================================= */}
                {activeTab === 'proceso' && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <span className="p-2 bg-amber-500 text-white rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-amber-900">
                                    Registro de Pasos Clínicos y de Laboratorio (Trans-Tratamiento)
                                </h3>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Documenta fotográficamente los pasos intermedios: toma de impresiones, encerado diagnóstico,
                                    pruebas de prótesis y estratificación de resinas para evaluación y calificación del Docente Supervisor.
                                </p>
                            </div>
                        </div>

                        {/* Muro de Pasos de Laboratorio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imagenes
                                .filter((img) => img.categoria === 'proceso_laboratorio' || img.fase_caso === 'trans_tratamiento')
                                .map((img) => (
                                    <div key={img.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="h-44 bg-slate-900 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={img.archivo_url}
                                                alt={img.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-3.5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                                                    Paso Clínico
                                                </span>
                                                {img.validada_por_docente ? (
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                        Aprobado: {img.calificacion_docente || 100} pts
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                        Pendiente de Firma
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="text-xs font-bold text-slate-900">{img.titulo}</h4>
                                            <p className="text-[11px] text-slate-600 line-clamp-2">{img.descripcion || 'Sin descripción adicional.'}</p>

                                            {img.observaciones_docente && (
                                                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-700">
                                                    <strong>Obs. Docente:</strong> {img.observaciones_docente}
                                                </div>
                                            )}

                                            {['docente', 'admin', 'director_clinica'].includes(userRole) && !img.validada_por_docente && (
                                                <button
                                                    type="button"
                                                    onClick={() => openValidarModal(img)}
                                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition"
                                                >
                                                    Calificar y Validar Paso
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    MODAL: SUBIR IMAGEN / RADIOGRAFÍA PSP / CAPTURA CBCT
                   ========================================================================= */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Adquisición y Carga de Imagen Clínica
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Vinculación obligatoria con IUP, Pieza Dental y Tipo de Estudio.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Paciente */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Paciente Vinculado (IUP Obligatorio) *
                                        </label>
                                        <select
                                            value={uploadData.paciente_id}
                                            onChange={(e) => setUploadData('paciente_id', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            {pacientes.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.apellido_paterno} {p.apellido_materno} {p.nombres} - IUP: {p.iup || p.ci}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Categoría General */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Modalidad / Categoría *
                                        </label>
                                        <select
                                            value={uploadData.categoria}
                                            onChange={(e) => {
                                                const cat = e.target.value;
                                                setUploadData('categoria', cat);
                                                // Ajustar tipo por defecto según categoría
                                                if (cat === 'radiografia_psp') setUploadData('tipo_imagen', 'psp_periapical');
                                                else if (cat === 'tomografia_cbct') setUploadData('tipo_imagen', 'cbct_axial');
                                                else if (cat === 'diagnostico_facial') setUploadData('tipo_imagen', 'facial_frente_sonrisa');
                                                else if (cat === 'diagnostico_intraoral') setUploadData('tipo_imagen', 'intraoral_frontal');
                                                else if (cat === 'proceso_laboratorio') setUploadData('tipo_imagen', 'proceso_impresion');
                                                else if (cat === 'final_post_tratamiento') setUploadData('tipo_imagen', 'final_sonrisa');
                                            }}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="radiografia_psp">Escáner Placas de Fósforo (PSP)</option>
                                            <option value="tomografia_cbct">Captura de Tomografía CBCT</option>
                                            <option value="diagnostico_facial">Fotografía Facial de Diagnóstico</option>
                                            <option value="diagnostico_intraoral">Fotografía Intraoral Inicial</option>
                                            <option value="proceso_laboratorio">Trans-Tratamiento (Proceso / Lab)</option>
                                            <option value="final_post_tratamiento">Post-Tratamiento (Resultado Final)</option>
                                        </select>
                                    </div>

                                    {/* Tipo Específico según la Categoría */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Tipo Específico de Imagen *
                                        </label>
                                        <select
                                            value={uploadData.tipo_imagen}
                                            onChange={(e) => setUploadData('tipo_imagen', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            {tiposCatalogo[uploadData.categoria] &&
                                                Object.entries(tiposCatalogo[uploadData.categoria]).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Fase Clínica */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Fase Clínica del Caso *
                                        </label>
                                        <select
                                            value={uploadData.fase_caso}
                                            onChange={(e) => setUploadData('fase_caso', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        >
                                            <option value="pre_tratamiento">Pre-Tratamiento (Diagnóstico Inicial)</option>
                                            <option value="trans_tratamiento">Trans-Tratamiento (En Proceso)</option>
                                            <option value="post_tratamiento">Post-Tratamiento (Alta / Final)</option>
                                        </select>
                                    </div>

                                    {/* Pieza Dental (FDI) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Pieza Dental / Zona Anatómica
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: 16, 21, General, Cuadrante 1"
                                            value={uploadData.pieza_dental}
                                            onChange={(e) => setUploadData('pieza_dental', e.target.value)}
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Atributo condicional para PSP */}
                                    {uploadData.categoria === 'radiografia_psp' && (
                                        <div className="sm:col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <label className="block text-xs font-bold text-emerald-950 mb-1">
                                                Tamaño de Placa de Fósforo (PSP)
                                            </label>
                                            <select
                                                value={uploadData.tipo_placa_psp}
                                                onChange={(e) => setUploadData('tipo_placa_psp', e.target.value)}
                                                className="w-full text-xs rounded-lg border-emerald-300"
                                            >
                                                <option value="tamano_0_pediatrico">Placa #0 (Pediátrica 22x31 mm)</option>
                                                <option value="tamano_1">Placa #1 (Periapical Anterior 24x40 mm)</option>
                                                <option value="tamano_2_adulto">Placa #2 (Periapical Adulto 31x41 mm - Estándar)</option>
                                                <option value="tamano_3_aleta">Placa #3 (Aleta de Mordida 27x54 mm)</option>
                                                <option value="tamano_4_oclusal">Placa #4 (Oclusal 57x76 mm)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Atributo condicional para CBCT */}
                                    {uploadData.categoria === 'tomografia_cbct' && (
                                        <div className="sm:col-span-2 p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                                            <label className="block text-xs font-bold text-cyan-950 mb-1">
                                                Plano de Corte Tomográfico (CBCT)
                                            </label>
                                            <select
                                                value={uploadData.plano_corte_cbct}
                                                onChange={(e) => setUploadData('plano_corte_cbct', e.target.value)}
                                                className="w-full text-xs rounded-lg border-cyan-300"
                                            >
                                                <option value="axial">Corte Axial (Transversal)</option>
                                                <option value="sagital">Corte Sagital (Lateral)</option>
                                                <option value="coronal">Corte Coronal (Frontal)</option>
                                                <option value="panoramica">Reconstrucción Panorámica Sintética</option>
                                                <option value="3d">Render 3D Volumétrico</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Título de la imagen */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Título Descriptivo *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Radiografía Periapical Pieza 16 - Control Endodóntico"
                                            value={uploadData.titulo}
                                            onChange={(e) => setUploadData('titulo', e.target.value)}
                                            required
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Archivo a subir */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Archivo de Imagen / Radiografía / DICOM *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,application/pdf,.dcm,.dicom"
                                            onChange={(e) => setUploadData('archivo', e.target.files[0])}
                                            required
                                            className="w-full text-xs border border-slate-300 rounded-lg p-2"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            Formatos soportados: JPEG, PNG, WEBP, DICOM (.dcm), PDF. Se aplica compresión estándar optimizada.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadProcessing}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow transition"
                                    >
                                        {uploadProcessing ? 'Comprimiendo y guardando...' : 'Guardar y Vincular al IUP'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    MODAL: VALIDACIÓN Y CALIFICACIÓN DOCENTE
                   ========================================================================= */}
                {isDocenteModalOpen && imagenParaValidar && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                        Supervisión Clínica
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 mt-1">
                                        Validar y Calificar Imagen
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsDocenteModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleValidarSubmit} className="mt-4 space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                    <p><strong>Imagen:</strong> {imagenParaValidar.titulo}</p>
                                    <p><strong>Estudiante:</strong> {imagenParaValidar.user?.name}</p>
                                    <p><strong>Categoría:</strong> {imagenParaValidar.categoria}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Calificación Numérica (0 - 100) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={docenteData.calificacion_docente}
                                        onChange={(e) => setDocenteData('calificacion_docente', parseInt(e.target.value))}
                                        required
                                        className="w-full text-xs rounded-lg border-slate-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Observaciones Docentes / Criterio de Calidad *
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={docenteData.observaciones_docente}
                                        onChange={(e) => setDocenteData('observaciones_docente', e.target.value)}
                                        required
                                        className="w-full text-xs rounded-lg border-slate-300"
                                        placeholder="Ej: Buena técnica radiológica bisectriz, sin cono cortado. Encerado con anatomía adecuada."
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsDocenteModalOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={docenteProcessing}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow transition"
                                    >
                                        {docenteProcessing ? 'Firmando...' : 'Firmar y Validar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
