import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => api.login(data.email, data.password),
    onSuccess: () => {
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });
      // Invalidate auth query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // Small delay to allow auth state to update
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: (error: Error) => {
      if (error.message?.includes('temporarily unavailable')) {
        toast({
          title: "Database Loading",
          description: "Database sedang aktif. Silakan tunggu 15 detik dan coba lagi.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login gagal",
          description: error.message || "Email atau password salah",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f29716]/5 via-[#ffde32]/5 to-[#04474f]/5 flex items-center justify-center p-4">
      <div className="card-base w-full max-w-md bg-[#04474f] text-[#fafafa]">
        <div className="text-center space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <img 
              src={financewhizLogo} 
              alt="FinanceWhiz.AI Logo" 
              className="w-16 h-16"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-league text-[#fafafa]">FinanceWhiz.AI</h1>
            <p className="mt-2 font-league text-[#fafafa]">Masuk ke akun Anda</p>
            <div className="mt-4 p-3 bg-[#f29716]/10 border border-[#f29716]/20 rounded-lg">
              <p className="text-sm text-[#fafafa] font-league mb-1">
                <strong>Demo Account:</strong>
              </p>
              <p className="text-xs text-[#fafafa] font-league">
                Email: admin@financewhiz.ai<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-league text-[#fafafa]">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      {...field} 
                      disabled={loginMutation.isPending}
                      className="font-league text-black bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-league text-[#fafafa]">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Masukkan password" 
                      {...field}
                      disabled={loginMutation.isPending}
                      className="font-league text-black bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button 
              type="submit" 
              className="btn-orange w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Masuk
            </button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm font-league text-[#fafafa]">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#f29716] hover:underline font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}