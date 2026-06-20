import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar — desktop uniquement */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        <Header />

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile uniquement */}
      <BottomNav />
    </div>
  );
}
