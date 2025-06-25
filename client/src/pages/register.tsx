import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

const registerSchema = z.object({
  businessName: z.string().min(1, "Nama usaha wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => api.register(data),
    onSuccess: () => {
      toast({
        title: "Registrasi berhasil",
        description: "Selamat datang di FinanceWhiz.AI!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f29716]/5 via-[#ffde32]/5 to-[#04474f]/5 flex items-center justify-center p-4">
      <div className="card-base w-full max-w-md">
        <div className="text-center space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <img 
              src={financewhizLogo} 
              alt="FinanceWhiz.AI Logo" 
              className="w-16 h-16"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-league">FinanceWhiz.AI</h1>
            <p className="text-gray-600 mt-2 font-league">Daftar akun baru</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-league">Nama Usaha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Toko Berkah" 
                      {...field} 
                      disabled={registerMutation.isPending}
                      className="font-league"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-league">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      {...field} 
                      disabled={registerMutation.isPending}
                      className="font-league"
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
                  <FormLabel className="font-league">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Minimal 8 karakter" 
                      {...field}
                      disabled={registerMutation.isPending}
                      className="font-league"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button 
              type="submit" 
              className="btn-orange w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Daftar Sekarang
            </button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-league">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#f29716] hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}