
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (password.length < 6) {
        setPasswordError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    if (!recaptchaToken) {
        toast({
            variant: "destructive",
            title: "Verificación Requerida",
            description: "Por favor, completa la verificación de reCAPTCHA.",
        });
        return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password }, recaptchaToken);
      setShowSuccessMessage(true);

    } catch (error) {
      if (error instanceof Error) {
        let message = error.message;
        if (error.message.includes("auth/email-already-in-use")) {
            message = "Este correo electrónico ya está registrado. Por favor, inicia sesión.";
        } else if (error.message.includes("auth/weak-password")) {
            setPasswordError("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
            message = "La contraseña es demasiado débil.";
        }
        
        if (message !== "La contraseña es demasiado débil.") {
            toast({
                variant: "destructive",
                title: "Error de Registro",
                description: message,
            });
        }
      }
    } finally {
        setIsLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
        <div className="container mx-auto flex items-center justify-center py-12">
             <Alert className="max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>¡Registro casi completo!</AlertTitle>
                <AlertDescription>
                    Hemos enviado un enlace de activación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para verificar tu cuenta antes de iniciar sesión.
                </AlertDescription>
                 <div className="mt-4">
                    <Button asChild>
                        <Link href="/login">Ir a Iniciar Sesión</Link>
                    </Button>
                </div>
             </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                }}
                disabled={isLoading}
              />
               {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
            </div>
            <div className="flex justify-center">
               <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={(token) => setRecaptchaToken(token)}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !recaptchaToken}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
