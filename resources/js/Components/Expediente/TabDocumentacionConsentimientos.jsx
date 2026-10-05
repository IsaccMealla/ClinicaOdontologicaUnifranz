import React, { useState, useRef } from 'react';

export default function TabDocumentacionConsentimientos({
    paciente,
    onActualizarConsentimiento,
    onSubirCi,
    readOnly = false,
}) {
    const ciUrl = paciente.ci_documento_url;
    const consent = paciente.consentimiento_inicial || {};

    // Estado para subida de CI
    const [archivoCi, setArchivoCi] = useState(null);
    const [subiendoCi, setSubiendoCi] = useState(false);

    // Estado para firma digital
    const [firmaCanvasData, setFirmaCanvasData] = useState(consent.firma_canvas || null);
    const [dibujando, setDibujando] = useState(false);
    const canvasRef = useRef(null);

    // Estado del formulario de consentimiento
    const [reglamentoAceptado, setReglamentoAceptado] = useState(
        consent.reglamento_general_aceptado !== undefined ? consent.reglamento_general_aceptado : true
    );
    const [privacidadAceptada, setPrivacidadAceptada] = useState(
        consent.politica_privacidad_aceptada !== undefined ? consent.politica_privacidad_aceptada : true
    );
    const [observaciones, setObservaciones] = useState(consent.observaciones || '');
    const [guardandoConsent, setGuardandoConsent] = useState(false);

    // Canvas drawing handlers
    const startDrawing = (e) => {
        if (readOnly) return;
        setDibujando(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e) => {
        if (!dibujando || readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0F172A';
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!dibujando) return;
        setDibujando(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setFirmaCanvasData(canvas.toDataURL('image/png'));
        }
    };

    const limpiarFirma = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setFirmaCanvasData(null);
        }
    };

    const handleSubirDocumentoCi = async (e) => {
        e.preventDefault();
        if (!archivoCi) return;

        setSubiendoCi(true);
        const formData = new FormData();
        formData.append('documento', archivoCi);

        try {
            const res = await fetch(route('pacientes.documento-ci.subir', paciente.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url && onSubirCi) {
                    onSubirCi(data.url);
                }
                setArchivoCi(null);
                window.location.reload();
            }
        } catch (err) {
            console.error('Error subiendo CI:', err);
        } finally {
            setSubiendoCi(false);
        }
    };

    const handleGuardarConsentimiento = async (e) => {
        e.preventDefault();
        setGuardandoConsent(true);

        const payload = {
            reglamento_general_aceptado: reglamentoAceptado,
            politica_privacidad_aceptada: privacidadAceptada,
            tipo: firmaCanvasData ? 'digital_canvas' : 'digital_formulario',
            firma_canvas: firmaCanvasData,
            observaciones,
        };

        try {
            const res = await fetch(route('pacientes.consentimiento.guardar', paciente.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.consentimiento && onActualizarConsentimiento) {
                    onActualizarConsentimiento(data.consentimiento);
                }
                alert('Consentimiento informado actualizado con fecha y hora.');
            }
        } catch (err) {
            console.error('Error guardando consentimiento:', err);
        } finally {
            setGuardandoConsent(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* SECCIÓN 1: ESCANEO DIGITAL DE CÉDULA DE IDENTIDAD */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Copia Digital de Cédula de Identidad o Documento Legal
                            </h3>
                            <p className="text-xs text-slate-500">
                                Validación oficial de identidad del paciente según normativa de admisión
                            </p>
                        </div>
                    </div>

                    {ciUrl && (
                        <a
                            href={ciUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition"
                        >
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Ver Documento Adjunto</span>
                        </a>
                    )}
                </div>

                {ciUrl ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs">
                                PDF / IMG
                            </span>
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                    Cédula de Identidad cargada y validada
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Documento oficial disponible para cotejo clínico institucional.
                                </span>
                            </div>
                        </div>
                        {!readOnly && (
                            <label className="cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 underline">
                                <span>Reemplazar Archivo</span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setArchivoCi(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-3">
                        <svg className="w-10 h-10 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Sin documento de identidad adjunto</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Adjunte escaneo en formato PDF o fotografía legible (máximo 10MB)
                            </p>
                        </div>
                        {!readOnly && (
                            <label className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                                <span>Seleccionar Cédula de Identidad</span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setArchivoCi(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                )}

                {archivoCi && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-teal-800">
                            Archivo seleccionado: {archivoCi.name} ({(archivoCi.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                            type="button"
                            onClick={handleSubirDocumentoCi}
                            disabled={subiendoCi}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition"
                        >
                            {subiendoCi ? 'Subiendo...' : 'Confirmar Subida'}
                        </button>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: GESTIÓN DEL CONSENTIMIENTO INFORMADO INICIAL */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Gestión del Consentimiento Informado Inicial & Reglamento
                            </h3>
                            <p className="text-xs text-slate-500">
                                Registro de aceptación legal, manejo de datos sensibles y modelo asistencial supervisado
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            consent.firmado
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                            ● {consent.firmado ? 'Firmado y Aceptado' : 'Pendiente de Firma'}
                        </span>
                    </div>
                </div>

                {/* Fecha y Hora del Consentimiento */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Fecha y Hora de Firma:</span>
                        <span className="font-mono font-bold text-slate-800">
                            {consent.fecha_hora || 'Pendiente de formalización'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Registrado por:</span>
                        <span className="font-bold text-slate-800">
                            {consent.responsable_nombre || 'Personal de Admisión'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Método de Captura:</span>
                        <span className="font-bold text-teal-700 capitalize">
                            {consent.tipo ? consent.tipo.replace('_', ' ') : 'Digital'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleGuardarConsentimiento} className="space-y-4">
                    {/* Cláusulas Legales */}
                    <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                disabled={readOnly}
                                checked={reglamentoAceptado}
                                onChange={(e) => setReglamentoAceptado(e.target.checked)}
                                className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-bold text-slate-900 block">
                                    Reglamento General de la Clínica Odontológica UNIFRANZ
                                </span>
                                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                    El paciente confirma haber sido informado y aceptar que los procedimientos odontológicos son ejecutados por estudiantes universitarios en formación bajo la tutoría y aprobación de docentes especialistas acreditados.
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                disabled={readOnly}
                                checked={privacidadAceptada}
                                onChange={(e) => setPrivacidadAceptada(e.target.checked)}
                                className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-bold text-slate-900 block">
                                    Políticas de Privacidad y Tratamiento de Datos Sensibles
                                </span>
                                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                    Autorización expresa para el almacenamiento seguro de la historia clínica, radiografías y fotografías intraorales con resguardo del secreto profesional y fines exclusivamente de salud y docencia.
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Canvas de Firma Digital en Pantalla */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <label className="font-bold text-slate-700 uppercase">
                                Firma Digital del Paciente o Apoderado:
                            </label>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={limpiarFirma}
                                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                                >
                                    Limpiar trazo
                                </button>
                            )}
                        </div>

                        {firmaCanvasData && !dibujando ? (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                                <img
                                    src={firmaCanvasData}
                                    alt="Firma Digital"
                                    className="max-h-28 mx-auto border-b border-slate-200 pb-2"
                                />
                                <span className="text-[10px] text-emerald-700 font-bold block">
                                    Firma digital capturada electrónicamente
                                </span>
                            </div>
                        ) : (
                            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50/50">
                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={140}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-32 bg-white cursor-crosshair touch-none"
                                />
                                <div className="p-2 bg-slate-100 text-[10px] text-slate-500 text-center font-medium">
                                    Dibuje la firma aquí con el mouse, dedo o lápiz táctil
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Observaciones o Notas Especiales
                        </label>
                        <textarea
                            rows="2"
                            disabled={readOnly}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Aclaraciones del paciente o representante legal..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {!readOnly && (
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={guardandoConsent}
                                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            >
                                {guardandoConsent ? 'Guardando...' : 'Registrar Firma & Consentimiento'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
