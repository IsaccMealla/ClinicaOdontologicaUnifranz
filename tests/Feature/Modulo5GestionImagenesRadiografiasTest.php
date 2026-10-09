<?php

namespace Tests\Feature;

use App\Models\HistoriaClinica;
use App\Models\ImagenClinica;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Modulo5GestionImagenesRadiografiasTest extends TestCase
{
    use DatabaseTransactions;

    protected User $docente;
    protected User $estudiante;
    protected Paciente $paciente;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        $rolDocente = Role::where('slug', 'docente')->first();
        $rolEstudiante = Role::where('slug', 'estudiante')->first();

        $this->docente = User::firstOrCreate(
            ['email' => 'docente.img@unifranz.edu.bo'],
            ['name' => 'Dr. Imagenólogo Unifranz', 'password' => bcrypt('password123'), 'is_active' => true]
        );
        $this->docente->rol_id = $rolDocente->id;
        $this->docente->is_active = true;
        $this->docente->save();
        $this->docente->load('rol');

        $this->estudiante = User::firstOrCreate(
            ['email' => 'estudiante.img@unifranz.edu.bo'],
            ['name' => 'Univ. Alumno Imagenología', 'password' => bcrypt('password123'), 'is_active' => true]
        );
        $this->estudiante->rol_id = $rolEstudiante->id;
        $this->estudiante->is_active = true;
        $this->estudiante->save();
        $this->estudiante->load('rol');

        $this->paciente = Paciente::firstOrCreate(
            ['ci' => '88991122'],
            [
                'nombres' => 'Valeria',
                'apellido_paterno' => 'Miranda',
                'apellido_materno' => 'Rojas',
                'fecha_nacimiento' => '1998-03-20',
                'sexo' => 'F',
                'celular' => '71234567',
                'iup' => 'UNIFRANZ-2026-889911',
                'activo' => true,
                'estudiante_asignado_id' => $this->estudiante->id,
            ]
        );
    }

    public function test_imagenes_index_renderiza_correctamente_con_metricas_y_paciente(): void
    {
        $response = $this->actingAs($this->docente)->get(route('imagenes.index', ['paciente_id' => $this->paciente->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Imagenes/Index')
            ->has('imagenes')
            ->has('pacientes')
            ->has('pacienteSeleccionado')
            ->has('metricas')
            ->has('tiposCatalogo')
        );
    }

    public function test_subida_radiografia_psp_con_metadatos_y_vinculacion_iup_y_pieza(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('periapical_pieza_16.jpg', 800, 600);

        $response = $this->actingAs($this->estudiante)->post(route('imagenes.store'), [
            'paciente_id' => $this->paciente->id,
            'categoria' => 'radiografia_psp',
            'tipo_imagen' => 'psp_periapical',
            'fase_caso' => 'pre_tratamiento',
            'pieza_dental' => '16',
            'tipo_placa_psp' => 'tamano_2_adulto',
            'titulo' => 'Radiografía Periapical Pieza 16 - PSP',
            'descripcion' => 'Evaluación de cámara pulpar y ápices',
            'fecha_adquisicion' => now()->toDateString(),
            'archivo' => $file,
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('imagenes_clinicas', [
            'paciente_id' => $this->paciente->id,
            'iup' => $this->paciente->iup,
            'categoria' => 'radiografia_psp',
            'tipo_imagen' => 'psp_periapical',
            'pieza_dental' => '16',
            'tipo_placa_psp' => 'tamano_2_adulto',
            'titulo' => 'Radiografía Periapical Pieza 16 - PSP',
        ]);
    }

    public function test_subida_captura_cbct_con_plano_de_corte(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('cbct_axial_maxilar.png', 1024, 768);

        $response = $this->actingAs($this->estudiante)->post(route('imagenes.store'), [
            'paciente_id' => $this->paciente->id,
            'categoria' => 'tomografia_cbct',
            'tipo_imagen' => 'cbct_axial',
            'fase_caso' => 'pre_tratamiento',
            'plano_corte_cbct' => 'axial',
            'titulo' => 'Captura CBCT Corte Axial Maxilar',
            'descripcion' => 'Medición de grosor de tabla ósea vestibular',
            'fecha_adquisicion' => now()->toDateString(),
            'archivo' => $file,
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('imagenes_clinicas', [
            'paciente_id' => $this->paciente->id,
            'categoria' => 'tomografia_cbct',
            'plano_corte_cbct' => 'axial',
            'titulo' => 'Captura CBCT Corte Axial Maxilar',
        ]);
    }

    public function test_fotografias_de_proceso_y_validacion_docente_con_calificacion(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('impresion_modelos.jpg', 800, 600);

        // Subir foto de proceso trans-tratamiento
        $this->actingAs($this->estudiante)->post(route('imagenes.store'), [
            'paciente_id' => $this->paciente->id,
            'categoria' => 'proceso_laboratorio',
            'tipo_imagen' => 'proceso_impresion',
            'fase_caso' => 'trans_tratamiento',
            'titulo' => 'Paso 1: Toma de Impresión Silicona por Adición',
            'descripcion' => 'Detalle nítido de márgenes subgingivales',
            'archivo' => $file,
        ]);

        $imagen = ImagenClinica::where('titulo', 'Paso 1: Toma de Impresión Silicona por Adición')->first();
        $this->assertNotNull($imagen);
        $this->assertFalse($imagen->validada_por_docente);

        // Docente valida y califica la foto de proceso
        $responseDocente = $this->actingAs($this->docente)->post(route('imagenes.validar-docente', $imagen->id), [
            'observaciones_docente' => 'Excelente nitidez en margen gingival. Aprobado para vaciado en yeso tipo IV.',
            'calificacion_docente' => 98,
        ]);

        $responseDocente->assertSessionHasNoErrors();
        $imagen->refresh();

        $this->assertTrue($imagen->validada_por_docente);
        $this->assertEquals(98, $imagen->calificacion_docente);
        $this->assertEquals($this->docente->id, $imagen->docente_validador_id);
    }

    public function test_guardar_anotaciones_vectoriales_sin_modificar_archivo(): void
    {
        $imagen = ImagenClinica::create([
            'paciente_id' => $this->paciente->id,
            'iup' => $this->paciente->iup,
            'user_id' => $this->estudiante->id,
            'categoria' => 'radiografia_psp',
            'tipo_imagen' => 'psp_periapical',
            'fase_caso' => 'pre_tratamiento',
            'pieza_dental' => '21',
            'titulo' => 'Radiografía Periapical Pieza 21',
            'archivo_path' => 'imagenes_clinicas/test/rx21.jpg',
            'archivo_url' => '/storage/imagenes_clinicas/test/rx21.jpg',
            'nombre_original' => 'rx21.jpg',
            'mime_type' => 'image/jpeg',
            'tamano_bytes' => 150000,
            'tamano_formateado' => '146 KB',
            'fecha_adquisicion' => now(),
            'anotaciones' => [],
        ]);

        $anotacionesPayload = [
            [
                'id' => 'annot-1',
                'tipo' => 'circulo',
                'x' => 45,
                'y' => 52,
                'etiqueta' => 'Halo radiolúcido periapical compatible con granuloma',
                'color' => '#ef4444',
            ],
            [
                'id' => 'annot-2',
                'tipo' => 'medicion',
                'x' => 45,
                'y' => 60,
                'etiqueta' => 'Diámetro lesión: 4.2 mm',
                'color' => '#10b981',
            ],
        ];

        $response = $this->actingAs($this->docente)->post(route('imagenes.anotaciones', $imagen->id), [
            'anotaciones' => $anotacionesPayload,
        ]);

        $response->assertSessionHasNoErrors();
        $imagen->refresh();

        $this->assertCount(2, $imagen->anotaciones);
        $this->assertEquals('Halo radiolúcido periapical compatible con granuloma', $imagen->anotaciones[0]['etiqueta']);
        $this->assertEquals('Diámetro lesión: 4.2 mm', $imagen->anotaciones[1]['etiqueta']);
    }

    public function test_eliminacion_suave_de_imagen(): void
    {
        $imagen = ImagenClinica::create([
            'paciente_id' => $this->paciente->id,
            'iup' => $this->paciente->iup,
            'user_id' => $this->estudiante->id,
            'categoria' => 'diagnostico_facial',
            'tipo_imagen' => 'facial_frente_sonrisa',
            'fase_caso' => 'pre_tratamiento',
            'titulo' => 'Fotografía Facial Inicial',
            'archivo_path' => 'imagenes_clinicas/test/face.jpg',
            'archivo_url' => '/storage/imagenes_clinicas/test/face.jpg',
            'nombre_original' => 'face.jpg',
            'mime_type' => 'image/jpeg',
            'tamano_bytes' => 120000,
            'tamano_formateado' => '117 KB',
            'fecha_adquisicion' => now(),
        ]);

        $response = $this->actingAs($this->docente)->delete(route('imagenes.destroy', $imagen->id));

        $response->assertSessionHasNoErrors();
        $this->assertSoftDeleted('imagenes_clinicas', ['id' => $imagen->id]);
    }
}
