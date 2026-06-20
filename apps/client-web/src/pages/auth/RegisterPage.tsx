import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth.validator";

export default function RegisterPage() {
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema as any),
  });

  const onSubmit = (data: RegisterInput) => {
    register_.mutate(data, {
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error ??
            "Registration failed. Please try again.",
        );
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 text-sm mt-1">Join MoneySwift today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Alice Mbarga"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+237699000000"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Email (optionnel) */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="alice@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* PIN */}
        <div className="space-y-1.5">
          <Label htmlFor="pin">PIN (6 digits)</Label>
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

        {/* Confirm PIN */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPin">Confirm PIN</Label>
          <Input
            id="confirmPin"
            type="password"
            placeholder="••••••"
            maxLength={6}
            {...register("confirmPin")}
          />
          {errors.confirmPin && (
            <p className="text-xs text-red-500">{errors.confirmPin.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={register_.isPending}>
          {register_.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Creating
              account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
