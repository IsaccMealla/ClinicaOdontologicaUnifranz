import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const setDemoCredentials = (email, password = 'password123') => {
        setData(prev => ({
            ...prev,
            email,
            password,
        }));
    };

    const quickLogin = (email, password = 'password123') => {
        setDemoCredentials(email, password);
        router.post(route('login'), {
            email,
            password,
            remember: false,
        });
    };

    const demoRoles = [
        { 
            title: 'Admin', 
            email: 'admin@unifranz.edu.bo', 
            role: 'Administrador General',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        { 
            title: 'Docente', 
            email: 'docente@unifranz.edu.bo', 
            role: 'Supervisor Clínico',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        { 
            title: 'Estudiante', 
            email: 'estudiante@unifranz.edu.bo', 
            role: 'Operador Odontología',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        { 
            title: 'Admisión', 
            email: 'admision@unifranz.edu.bo', 
            role: 'Recepción & Triaje',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        { 
            title: 'Director', 
            email: 'director@unifranz.edu.bo', 
            role: 'Dirección de Carrera',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        { 
            title: 'Paciente', 
            email: 'paciente@unifranz.edu.bo', 
            role: 'Portal del Paciente',
            icon: (
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
    ];

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión - Clínica Odontológica Unifranz" />

            {/* Header del Formulario */}
            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Acceso Institucional</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Sistema de Gestión y Registro Clínico Odontológico
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 rounded-xl p-3 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Campo Email */}
                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Correo Institucional
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="usuario@unifranz.edu.bo"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Campo Password con botón de ver/ocultar contraseña */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Contraseña
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••••••"
                            className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition font-mono"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        {/* Botón Ver / Ocultar Contraseña */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-teal-600 focus:outline-none transition cursor-pointer"
                            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                            {showPassword ? (
                                // Icono Ojo Tachado (EyeOff)
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                // Icono Ojo (Eye)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Recordarme */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600">
                            Mantener sesión activa
                        </span>
                    </label>
                </div>

                {/* Botón Ingresar */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Verificando credenciales...</span>
                            </>
                        ) : (
                            <>
                                <span>Ingresar al Sistema</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Accesos Rápidos de Prueba (Demo Roles) */}
            <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Accesos Rápidos de Demostración
                    </p>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                        1 Clic
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {demoRoles.map((item) => (
                        <div
                            key={item.email}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 hover:border-teal-300 border border-slate-200 transition group flex flex-col justify-between"
                        >
                            <div
                                onClick={() => setDemoCredentials(item.email, 'password123')}
                                className="cursor-pointer"
                                title="Rellenar formulario con estas credenciales"
                            >
                                <div className="font-bold text-slate-800 group-hover:text-teal-700 flex items-center gap-1.5">
                                    {item.icon}
                                    <span>{item.title}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.email}</div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setDemoCredentials(item.email, 'password123')}
                                    className="text-[10px] text-slate-500 hover:text-teal-700 font-medium"
                                    title="Cargar en campos"
                                >
                                    Rellenar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin(item.email, 'password123')}
                                    className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded font-bold transition flex items-center gap-1 shadow-2xs"
                                    title="Entrar de inmediato con este rol"
                                >
                                    <span>Entrar</span>
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-3">
                    Credenciales válidas: <span className="font-mono font-semibold text-slate-600">password123</span> o <span className="font-mono font-semibold text-slate-600">ClinicaUnifranz2026!</span>
                </p>
            </div>
        </GuestLayout>
    );
}
