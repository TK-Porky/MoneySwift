import { useBalance } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// ── Formatage XAF ──────────────────────────────────────────────────
function formatXAF(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Badge statut transaction ───────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUCCESS: "bg-success-50 text-success-700",
    PENDING: "bg-warning-50 text-warning-700",
    PROCESSING: "bg-warning-50 text-warning-700",
    FAILED: "bg-danger-50  text-danger-700",
    REVERSED: "bg-gray-100   text-gray-600",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Quick action button ────────────────────────────────────────────
function QuickAction({
  to,
  icon: Icon,
  label,
  color,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border hover:shadow-card-hover transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 5 });

  return (
    <div className="space-y-6 max-w-2xl mx-auto lg:max-w-none">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <p className="text-primary-200 text-sm font-medium mb-1">
          Available Balance
        </p>
        {balanceLoading ? (
          <Loader2 size={28} className="animate-spin mt-2" />
        ) : (
          <p className="text-4xl font-bold tracking-tight">
            {formatXAF(balance?.balance ?? 0)}
          </p>
        )}
        <p className="text-primary-300 text-xs mt-3">
          {user?.phoneNumber} · MoneySwift Account
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            to="/deposit"
            icon={ArrowDownToLine}
            label="Deposit"
            color="bg-success-50 text-success-700"
          />
          <QuickAction
            to="/withdraw"
            icon={ArrowUpFromLine}
            label="Withdraw"
            color="bg-warning-50 text-warning-700"
          />
          <QuickAction
            to="/transfer"
            icon={ArrowLeftRight}
            label="Transfer"
            color="bg-primary-50 text-primary-700"
          />
          <QuickAction
            to="/cards"
            icon={CreditCard}
            label="Cards"
            color="bg-purple-50 text-purple-700"
          />
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Recent Transactions
          </h2>
          <Link
            to="/history"
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            See all
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-border divide-y divide-border">
          {txLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : txData?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <TrendingUp size={32} className="mb-2" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            txData?.data?.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  {/* Icône type */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === "DEPOSIT"
                        ? "bg-success-50"
                        : tx.type === "WITHDRAWAL"
                          ? "bg-warning-50"
                          : "bg-primary-50"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? (
                      <ArrowDownToLine size={16} className="text-success-700" />
                    ) : tx.type === "WITHDRAWAL" ? (
                      <ArrowUpFromLine size={16} className="text-warning-700" />
                    ) : (
                      <ArrowLeftRight size={16} className="text-primary-700" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.initiatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "DEPOSIT"
                        ? "text-success-700"
                        : "text-gray-900"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "-"}
                    {formatXAF(tx.amount)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
