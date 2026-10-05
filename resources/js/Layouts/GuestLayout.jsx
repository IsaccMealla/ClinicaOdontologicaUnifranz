import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-6 sm:justify-center sm:pt-0 font-sans antialiased text-slate-800">
            <div className="text-center mb-4">
                <Link href="/" className="inline-flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-600/20">
                        U
                    </div>
                    <div className="text-left">
                        <h1 className="font-extrabold text-xl text-slate-900 leading-tight">Clínica Unifranz</h1>
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Sistema de Gestión Clínica Odontológica</p>
                    </div>
                </Link>
            </div>

            <div className="mt-2 w-full overflow-hidden bg-white px-8 py-8 shadow-sm border border-slate-200/80 sm:max-w-md sm:rounded-2xl">
                {children}
            </div>

            {/* Credenciales de demostración institucionales */}
            <div className="mt-4 max-w-md w-full px-4 text-center">
                <p className="text-xs text-slate-500">
                    Credenciales demo: <span className="font-semibold text-slate-700">admin@unifranz.edu.bo</span> / <span className="font-semibold text-slate-700">password123</span>
                </p>
            </div>
        </div>
    );
}
