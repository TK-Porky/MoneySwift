import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtp } from "@/hooks/useAuth";
import {
  verifyOtpSchema,
  type VerifyOtpInput,
} from "@/lib/validators/auth.validator";

export default function VerifyOtpPage() {
  const location = useLocation();
  const userId = (location.state as { userId?: string })?.userId ?? "";
  const verifyOtp = useVerifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema as any),
  });

  const onSubmit = (data: VerifyOtpInput) => {
    verifyOtp.mutate(
      { ...data, userId },
      {
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ?? "Invalid code. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={28} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify your number</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter the 6-digit code sent to your phone
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-xs text-red-500 text-center">
              {errors.code.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </form>
    </div>
  );
}
