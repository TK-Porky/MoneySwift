import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeposit } from "@/hooks/useTransactions";
import {
  depositSchema,
  type DepositInput,
} from "@/lib/validators/transaction.validator";

function formatXAF(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}

const providers = [
  {
    value: "MTN",
    label: "MTN Mobile Money",
    color: "bg-yellow-400",
    text: "text-yellow-900",
  },
  {
    value: "ORANGE",
    label: "Orange Money",
    color: "bg-orange-400",
    text: "text-orange-900",
  },
];

export default function DepositPage() {
  const deposit = useDeposit();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DepositInput>({
    resolver: zodResolver(depositSchema as any),
    defaultValues: { provider: "MTN" },
  });

  const selectedProvider = watch("provider");
  const amount = watch("amount");

  const onSubmit = (data: DepositInput) => {
    deposit.mutate(data, {
      onSuccess: (res) => {
        toast.success(
          `Deposit initiated! Confirm on your phone. Ref: ${res.reference}`,
        );
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error ?? "Deposit failed. Please try again.",
        );
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
          <ArrowDownToLine size={20} className="text-success-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Deposit</h1>
          <p className="text-sm text-gray-500">
            Top up your MoneySwift account
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-border p-6 space-y-5"
      >
        {/* Provider selector */}
        <div className="space-y-2">
          <Label>Select Provider</Label>
          <div className="grid grid-cols-2 gap-3">
            {providers.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  setValue("provider", p.value as "MTN" | "ORANGE")
                }
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  selectedProvider === p.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center`}
                >
                  <span className={`text-xs font-bold ${p.text}`}>
                    {p.value[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Provider phone */}
        <div className="space-y-1.5">
          <Label htmlFor="providerPhone">
            {selectedProvider === "MTN" ? "MTN" : "Orange"} Phone Number
          </Label>
          <Input
            id="providerPhone"
            type="tel"
            placeholder="+237699000000"
            {...register("providerPhone")}
          />
          {errors.providerPhone && (
            <p className="text-xs text-red-500">
              {errors.providerPhone.message}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (XAF)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="10000"
            min={100}
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-xs text-red-500">{errors.amount.message}</p>
          )}
          {Number(amount) > 0 && (
            <p className="text-xs text-gray-400">
              You will receive {formatXAF(Number(amount))} in your MoneySwift
              account
            </p>
          )}
        </div>

        {/* PIN */}
        <div className="space-y-1.5">
          <Label htmlFor="pin">Your PIN</Label>
          <Input
            id="pin"
            type="password"
            placeholder="••••••"
            maxLength={6}
            {...register("pin")}
          />
          {errors.pin && (
            <p className="text-xs text-red-500">{errors.pin.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={deposit.isPending}>
          {deposit.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Initiating...
            </>
          ) : (
            "Deposit"
          )}
        </Button>
      </form>
    </div>
  );
}
