import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      {/* Card centrale */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              MoneySwift
            </span>
          </div>
          <p className="text-primary-300 text-sm">
            Fast & Secure Mobile Money Transfers
          </p>
        </div>

        {/* Contenu de la page auth */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-primary-400 text-xs mt-6">
          © {new Date().getFullYear()} MoneySwift · Cameroon
        </p>
      </div>
    </div>
  );
}
