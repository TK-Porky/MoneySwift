import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWithdraw } from "@/hooks/useTransactions";
import {
  withdrawSchema,
  type WithdrawInput,
} from "@/lib/validators/transaction.validator";

const providers = [
  { value: "MTN", label: "MTN Mobile Money" },
  { value: "ORANGE", label: "Orange Money" },
];

export default function WithdrawPage() {
  const withdraw = useWithdraw();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema as any),
    defaultValues: { provider: "MTN" },
  });

  const selectedProvider = watch("provider");

  const onSubmit = (data: WithdrawInput) => {
    withdraw.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Withdrawal initiated! Ref: ${res.reference}`);
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error ??
            "Withdrawal failed. Please try again.",
        );
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center">
          <ArrowUpFromLine size={20} className="text-warning-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Withdraw</h1>
          <p className="text-sm text-gray-500">
            Transfer to your mobile money account
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-border p-6 space-y-5"
      >
        {/* Provider */}
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
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  selectedProvider === p.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-border text-gray-600 hover:border-gray-300"
                }`}
              >
                {p.label}
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
            placeholder="5000"
            min={100}
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-xs text-red-500">{errors.amount.message}</p>
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

        <Button type="submit" className="w-full" disabled={withdraw.isPending}>
          {withdraw.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Processing...
            </>
          ) : (
            "Withdraw"
          )}
        </Button>
      </form>
    </div>
  );
}
