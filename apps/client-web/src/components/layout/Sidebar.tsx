import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  CreditCard,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { to: "/deposit", icon: ArrowDownToLine, label: "Deposit" },
  { to: "/withdraw", icon: ArrowUpFromLine, label: "Withdraw" },
  { to: "/history", icon: History, label: "History" },
  { to: "/cards", icon: CreditCard, label: "Cards" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const logout = useLogout();

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-gray-900 text-lg">MoneySwift</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {/* Badge notifications */}
            {to === "/notifications" && unreadCount > 0 && (
              <span className="ml-auto bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName ?? "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.phoneNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout.mutate()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
