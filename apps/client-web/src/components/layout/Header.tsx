import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between">
      {/* Mobile : logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">M</span>
        </div>
        <span className="font-bold text-gray-900">MoneySwift</span>
      </div>

      {/* Desktop : greeting */}
      <div className="hidden lg:block">
        <p className="text-sm text-gray-500">Welcome back,</p>
        <p className="font-semibold text-gray-900">
          {user?.fullName ?? "User"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          )}
        </Link>
      </div>
    </header>
  );
}
