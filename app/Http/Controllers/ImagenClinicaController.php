<?php

namespace App\Http\Controllers;

use App\Models\AuditoriaLog;
use App\Models\HistoriaClinica;
use App\Models\ImagenClinica;
use App\Models\Paciente;
use App\Models\PlanTratamiento;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ImagenClinicaController extends Controller
{
    /**
     * Display the clinical imaging repository, PSP scanner gallery, CBCT captures, and annotations.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userRole = $user->rol ? $user->rol->slug : 'estudiante';

        // 1. Selector de paciente
        $pacienteId = $request->query('paciente_id');
        $categoria = $request->query('categoria');
        $faseCaso = $request->query('fase_caso');
        $piezaDental = $request->query('pieza_dental');

        $pacientes = Paciente::where('activo', true)
            ->orderBy('apellido_paterno')
            ->limit(100)
            ->get(['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'iup', 'estudiante_asignado_id']);

        // Si no se especificó paciente, tomar el primero o el asignado al estudiante
        if (!$pacienteId) {
            if ($userRole === 'estudiante') {
                $primerPaciente = $pacientes->firstWhere('estudiante_asignado_id', $user->id) ?? $pacientes->first();
            } else {
                $primerPaciente = $pacientes->first();
            }
            $pacienteId = $primerPaciente ? $primerPaciente->id : null;
        }

        $pacienteSeleccionado = $pacienteId ? Paciente::with(['historiasClinicas' => function ($q) {
            $q->latest()->limit(1);
        }, 'planesTratamiento' => function ($q) {
            $q->latest()->limit(3);
        }])->find($pacienteId) : null;

        // 2. Query de imágenes clínicas
        $imagenesQuery = ImagenClinica::with([
            'paciente:id,nombres,apellido_paterno,apellido_materno,ci,iup',
            'user:id,name,email',
            'docenteValidador:id,name',
        ]);

        if ($pacienteId) {
            $imagenesQuery->where('paciente_id', $pacienteId);
        }
        if ($categoria) {
            $imagenesQuery->where('categoria', $categoria);
        }
        if ($faseCaso) {
            $imagenesQuery->where('fase_caso', $faseCaso);
        }
        if ($piezaDental) {
            $imagenesQuery->where('pieza_dental', $piezaDental);
        }

        $imagenes = $imagenesQuery->orderByDesc('fecha_adquisicion')->get();

        // 3. Métricas y Estadísticas
        $imagenesPaciente = $pacienteId ? ImagenClinica::where('paciente_id', $pacienteId)->get() : collect();
        $metricas = [
            'total_imagenes' => $imagenesPaciente->count(),
            'radiografias_psp' => $imagenesPaciente->where('categoria', 'radiografia_psp')->count(),
            'capturas_cbct' => $imagenesPaciente->where('categoria', 'tomografia_cbct')->count(),
            'fotos_pre_tratamiento' => $imagenesPaciente->where('fase_caso', 'pre_tratamiento')->count(),
            'fotos_trans_proceso' => $imagenesPaciente->where('fase_caso', 'trans_tratamiento')->count(),
            'fotos_post_finales' => $imagenesPaciente->where('fase_caso', 'post_tratamiento')->count(),
            'validadas_docente' => $imagenesPaciente->where('validada_por_docente', true)->count(),
        ];

        // 4. Catálogo de tipos de imagen estandarizados UNIFRANZ
        $tiposCatalogo = [
            'diagnostico_facial' => [
                'facial_frente_reposo' => 'Facial Frente (Reposo)',
                'facial_frente_sonrisa' => 'Facial Frente (Sonrisa)',
                'facial_perfil' => 'Facial Perfil Estricto',
                'facial_tres_cuartos' => 'Facial Tres Cuartos (3/4)',
            ],
            'diagnostico_intraoral' => [
                'intraoral_frontal' => 'Intraoral Frontal en Oclusión',
                'intraoral_oclusal_sup' => 'Intraoral Oclusal Superior',
                'intraoral_oclusal_inf' => 'Intraoral Oclusal Inferior',
                'intraoral_lateral_der' => 'Intraoral Lateral Derecha',
                'intraoral_lateral_izq' => 'Intraoral Lateral Izquierda',
            ],
            'radiografia_psp' => [
                'psp_periapical' => 'Radiografía Periapical (Placa Fósforo)',
                'psp_aleta_mordida' => 'Aleta de Mordida (Bite-Wing)',
                'psp_oclusal' => 'Radiografía Oclusal Total',
                'psp_serie_completa' => 'Serie Radiográfica Periapical',
            ],
            'tomografia_cbct' => [
                'cbct_axial' => 'Captura CBCT - Corte Axial',
                'cbct_sagital' => 'Captura CBCT - Corte Sagital',
                'cbct_coronal' => 'Captura CBCT - Corte Coronal',
                'cbct_panoramica' => 'Reconstrucción Panorámica CBCT',
                'cbct_3d' => 'Render 3D Volumétrico CBCT',
            ],
            'proceso_laboratorio' => [
                'proceso_impresion' => 'Paso 1: Toma de Impresión y Modelos',
                'proceso_encerado' => 'Paso 2: Encerado de Diagnóstico',
                'proceso_prueba_protesis' => 'Paso 3: Prueba de Estructura / Bizcocho',
                'proceso_estratificacion_resina' => 'Paso 4: Estratificación de Resinas Capa a Capa',
                'proceso_pulido_acabado' => 'Paso 5: Pulido y Acabado Clínico',
            ],
            'final_post_tratamiento' => [
                'final_sonrisa' => 'Resultado Final: Sonrisa en Reposo y Dinámica',
                'final_intraoral' => 'Resultado Final: Oclusión y Restauración Terminada',
                'final_radiografia_control' => 'Radiografía de Control Post-operatorio',
            ],
        ];

        return Inertia::render('Imagenes/Index', [
            'imagenes' => $imagenes,
            'pacientes' => $pacientes,
            'pacienteSeleccionado' => $pacienteSeleccionado,
            'filtros' => [
                'paciente_id' => $pacienteId,
                'categoria' => $categoria,
                'fase_caso' => $faseCaso,
                'pieza_dental' => $piezaDental,
            ],
            'metricas' => $metricas,
            'tiposCatalogo' => $tiposCatalogo,
            'userRole' => $userRole,
        ]);
    }

    /**
     * Almacenamiento seguro, etiquetado y compresión de imágenes clínicas.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'categoria' => 'required|string|in:diagnostico_facial,diagnostico_intraoral,proceso_laboratorio,final_post_tratamiento,radiografia_psp,tomografia_cbct,dicom_original',
            'tipo_imagen' => 'required|string|max:80',
            'fase_caso' => 'required|string|in:pre_tratamiento,trans_tratamiento,post_tratamiento',
            'pieza_dental' => 'nullable|string|max:50',
            'plano_corte_cbct' => 'nullable|string|in:axial,sagital,coronal,panoramica,3d',
            'tipo_placa_psp' => 'nullable|string|in:tamano_0_pediatrico,tamano_1,tamano_2_adulto,tamano_3_aleta,tamano_4_oclusal',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'fecha_adquisicion' => 'nullable|date',
            'archivo' => 'required|file|mimes:jpeg,png,jpg,webp,gif,pdf,dcm,dicom|max:35840', // Hasta 35MB
        ]);

        $paciente = Paciente::findOrFail($validated['paciente_id']);
        $user = Auth::user();

        // 1. Garantizar IUP único en el paciente si aún no lo tenía
        if (empty($paciente->iup)) {
            $paciente->iup = 'UNIFRANZ-' . date('Y') . '-' . str_pad($paciente->id, 6, '0', STR_PAD_LEFT);
            $paciente->save();
        }

        $file = $request->file('archivo');
        $originalName = $file->getClientOriginalName();
        $mime = $file->getMimeType();
        $sizeBytes = $file->getSize();
        $sizeFormatted = $sizeBytes >= 1048576
            ? round($sizeBytes / 1048576, 1) . ' MB'
            : round($sizeBytes / 1024, 1) . ' KB';

        // 2. Almacenamiento organizado por paciente y categoría
        $subfolder = "imagenes_clinicas/{$paciente->id}/{$validated['categoria']}";
        $path = $file->store($subfolder, 'public');
        $url = asset('storage/' . $path);

        // 3. Metadatos según tecnología de captura
        $metadatos = [
            'software_origen' => $validated['categoria'] === 'radiografia_psp' ? 'PSP Phosphor Scanner UNIFRANZ' : 'Visualizador Digital',
            'calibracion_mm_px' => 0.1, // Calibración estándar inicial de 0.1mm por píxel
            'extension' => strtolower($file->getClientOriginalExtension()),
            'fecha_subida' => now()->toIso8601String(),
        ];

        if ($validated['categoria'] === 'radiografia_psp') {
            $metadatos['tipo_placa'] = $validated['tipo_placa_psp'] ?? 'tamano_2_adulto';
            $metadatos['tecnologia'] = 'Placa de Fósforo Fotoestimulable (PSP)';
        }

        if ($validated['categoria'] === 'tomografia_cbct') {
            $metadatos['plano_corte'] = $validated['plano_corte_cbct'] ?? 'axial';
            $metadatos['modalidad'] = 'Cone Beam Computed Tomography (CBCT)';
        }

        // Obtener última historia clínica del paciente si existe
        $historia = HistoriaClinica::where('paciente_id', $paciente->id)->latest()->first();
        $plan = PlanTratamiento::where('paciente_id', $paciente->id)->latest()->first();

        $imagen = ImagenClinica::create([
            'paciente_id' => $paciente->id,
            'iup' => $paciente->iup,
            'historia_clinica_id' => $historia ? $historia->id : null,
            'plan_tratamiento_id' => $plan ? $plan->id : null,
            'user_id' => $user->id,
            'categoria' => $validated['categoria'],
            'tipo_imagen' => $validated['tipo_imagen'],
            'fase_caso' => $validated['fase_caso'],
            'pieza_dental' => $validated['pieza_dental'] ?? null,
            'plano_corte_cbct' => $validated['plano_corte_cbct'] ?? null,
            'tipo_placa_psp' => $validated['tipo_placa_psp'] ?? null,
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'archivo_path' => $path,
            'archivo_url' => $url,
            'nombre_original' => $originalName,
            'mime_type' => $mime,
            'tamano_bytes' => $sizeBytes,
            'tamano_formateado' => $sizeFormatted,
            'fecha_adquisicion' => !empty($validated['fecha_adquisicion']) ? Carbon::parse($validated['fecha_adquisicion']) : now(),
            'metadatos' => $metadatos,
            'anotaciones' => [],
        ]);

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'imagen_clinica_subida',
            'tabla' => 'imagenes_clinicas',
            'registro_id' => $imagen->id,
            'payload_diff' => ['titulo' => $imagen->titulo, 'iup' => $imagen->iup, 'categoria' => $imagen->categoria],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Imagen '{$imagen->titulo}' vinculada exitosamente al IUP {$paciente->iup}.");
    }

    /**
     * Guardar anotaciones y mediciones vectoriales sobre la imagen diagnóstica sin alterar el archivo binario.
     */
    public function guardarAnotaciones(Request $request, $id)
    {
        $validated = $request->validate([
            'anotaciones' => 'required|array',
        ]);

        $imagen = ImagenClinica::findOrFail($id);
        $imagen->update([
            'anotaciones' => $validated['anotaciones'],
        ]);

        return back()->with('success', 'Anotaciones diagnósticas y mediciones guardadas correctamente.');
    }

    /**
     * Validación docente de fotografías de proceso (laboratorio, resinas) y radiografías.
     */
    public function validarDocente(Request $request, $id)
    {
        $validated = $request->validate([
            'observaciones_docente' => 'required|string|max:1000',
            'calificacion_docente' => 'nullable|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $imagen = ImagenClinica::findOrFail($id);

        $imagen->update([
            'validada_por_docente' => true,
            'docente_validador_id' => $user->id,
            'fecha_validacion' => now(),
            'observaciones_docente' => $validated['observaciones_docente'],
            'calificacion_docente' => $validated['calificacion_docente'] ?? null,
        ]);

        return back()->with('success', "Imagen clínica validada y calificada por Dr(a). {$user->name}.");
    }

    /**
     * Eliminar imagen clínica (Soft delete).
     */
    public function destroy($id)
    {
        $imagen = ImagenClinica::findOrFail($id);
        $imagen->delete();

        return back()->with('success', 'Imagen clínica eliminada del expediente.');
    }
}
