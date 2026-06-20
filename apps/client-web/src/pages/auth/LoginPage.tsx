import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.validator";

export default function LoginPage() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginInput) => {
    login.mutate(data, {
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error ?? "Login failed. Please try again.",
        );
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sign in to your MoneySwift account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone number */}
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

        {/* PIN */}
        <div className="space-y-1.5">
          <Label htmlFor="pin">PIN</Label>
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

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-primary-600 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
