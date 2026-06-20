import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransfer } from "@/hooks/useTransactions";
import {
  transferSchema,
  type TransferInput,
} from "@/lib/validators/transaction.validator";

function formatXAF(amount: number) {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}

const FEE_GRID = [
  { max: 5_000, fee: 50 },
  { max: 50_000, rate: 0.008 },
  { max: 200_000, rate: 0.005 },
  { max: Infinity, rate: 0.003 },
];

function estimateFee(amount: number) {
  const tier = FEE_GRID.find((t) => amount <= t.max);
  if (!tier) return 0;
  return tier.fee !== undefined ? tier.fee : Math.ceil(amount * tier.rate!);
}

export default function TransferPage() {
  const transfer = useTransfer();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema as any),
  });

  const amount = watch("amount");
  const fee = amount > 0 ? estimateFee(Number(amount)) : 0;
  const total = Number(amount || 0) + fee;

  const onSubmit = (data: TransferInput) => {
    transfer.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Transfer successful! Ref: ${res.reference}`);
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error ?? "Transfer failed. Please try again.",
        );
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <ArrowLeftRight size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Send Money</h1>
          <p className="text-sm text-gray-500">
            Transfer to another MoneySwift user
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-border p-6 space-y-5"
      >
        {/* Recipient */}
        <div className="space-y-1.5">
          <Label htmlFor="toPhone">Recipient Phone Number</Label>
          <Input
            id="toPhone"
            type="tel"
            placeholder="+237699000000"
            {...register("toPhone")}
          />
          {errors.toPhone && (
            <p className="text-xs text-red-500">{errors.toPhone.message}</p>
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

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="description"
            placeholder="Lunch reimbursement..."
            {...register("description")}
          />
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

        {/* Fee summary */}
        {Number(amount) > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Amount</span>
              <span>{formatXAF(Number(amount))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Fee</span>
              <span>{formatXAF(fee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t border-border pt-2">
              <span>Total</span>
              <span>{formatXAF(total)}</span>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={transfer.isPending}>
          {transfer.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Sending...
            </>
          ) : (
            "Send Money"
          )}
        </Button>
      </form>
    </div>
  );
}
