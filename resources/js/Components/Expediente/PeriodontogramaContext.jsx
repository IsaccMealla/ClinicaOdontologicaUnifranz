import React, { createContext, useContext, useState, useEffect } from 'react';

const PeriodontogramaContext = createContext(undefined);

const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export const generarDientesIniciales = (dientes) => {
    const estado = {};
    dientes.forEach((num) => {
        estado[num] = {
            movilidad: '',
            implante: false,
            sangrado: [false, false, false],
            supuracion: [false, false, false],
            margen: [0, 0, 0],
            sondaje: [0, 0, 0],
        };
    });
    return estado;
};

export function PeriodontogramaProvider({ children, initialData, pacienteId }) {
    const [datos, setDatos] = useState(() => {
        const base = initialData?.mediciones_periodontales || initialData || {};
        return {
            datos_vestibular_superior: {
                ...generarDientesIniciales(dientesSuperiores),
                ...(base.datos_vestibular_superior || {}),
            },
            datos_palatino_superior: {
                ...generarDientesIniciales(dientesSuperiores),
                ...(base.datos_palatino_superior || {}),
            },
            datos_vestibular_inferior: {
                ...generarDientesIniciales(dientesInferiores),
                ...(base.datos_vestibular_inferior || {}),
            },
            datos_lingual_inferior: {
                ...generarDientesIniciales(dientesInferiores),
                ...(base.datos_lingual_inferior || {}),
            },
            diagnostico: initialData?.diagnostico_periodontal || base.diagnostico || '',
            pronostico: initialData?.pronostico_periodontal || base.pronostico || '',
            comentarios_docente: initialData?.comentarios_docente || base.comentarios_docente || '',
            indice_placa: initialData?.indice_placa_porcentaje || base.indice_placa || 0,
            indice_sangrado: initialData?.indice_sangrado_porcentaje || base.indice_sangrado || 0,
        };
    });

    const [guardando, setGuardando] = useState(false);

    // Calcular estadísticas en tiempo real
    const calcularEstadisticas = () => {
        let totalSitios = 0;
        let sangradoSitios = 0;
        let supuracionSitios = 0;
        let bolsasProfundas = 0; // Sondaje >= 4mm

        const arcadas = [
            datos.datos_vestibular_superior,
            datos.datos_palatino_superior,
            datos.datos_vestibular_inferior,
            datos.datos_lingual_inferior,
        ];

        arcadas.forEach((arcada) => {
            Object.values(arcada).forEach((diente) => {
                if (!diente) return;
                for (let i = 0; i < 3; i++) {
                    totalSitios++;
                    if (diente.sangrado && diente.sangrado[i]) sangradoSitios++;
                    if (diente.supuracion && diente.supuracion[i]) supuracionSitios++;
                    if (diente.sondaje && Number(diente.sondaje[i]) >= 4) bolsasProfundas++;
                }
            });
        });

        const bopPorcentaje = totalSitios > 0 ? ((sangradoSitios / totalSitios) * 100).toFixed(1) : 0;
        const supPorcentaje = totalSitios > 0 ? ((supuracionSitios / totalSitios) * 100).toFixed(1) : 0;

        return {
            totalSitios,
            sangradoSitios,
            supuracionSitios,
            bopPorcentaje,
            supPorcentaje,
            bolsasProfundas,
        };
    };

    const guardarPeriodontograma = async (pId) => {
        const idActual = pId || pacienteId;
        if (!idActual) return false;

        setGuardando(true);
        try {
            const stats = calcularEstadisticas();
            const payload = {
                mediciones_periodontales: {
                    datos_vestibular_superior: datos.datos_vestibular_superior,
                    datos_palatino_superior: datos.datos_palatino_superior,
                    datos_vestibular_inferior: datos.datos_vestibular_inferior,
                    datos_lingual_inferior: datos.datos_lingual_inferior,
                },
                indice_sangrado_porcentaje: stats.bopPorcentaje,
                diagnostico_periodontal: datos.diagnostico,
                pronostico_periodontal: datos.pronostico,
                comentarios_docente: datos.comentarios_docente,
            };

            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/pacientes/${idActual}/periodontograma`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al guardar periodontograma:', error);
            return false;
        } finally {
            setGuardando(false);
        }
    };

    return (
        <PeriodontogramaContext.Provider
            value={{
                datos,
                setDatos,
                guardando,
                guardarPeriodontograma,
                calcularEstadisticas,
            }}
        >
            {children}
        </PeriodontogramaContext.Provider>
    );
}

export function usePeriodontograma() {
    const context = useContext(PeriodontogramaContext);
    if (!context) {
        throw new Error('usePeriodontograma debe utilizarse dentro de un PeriodontogramaProvider');
    }
    return context;
}
