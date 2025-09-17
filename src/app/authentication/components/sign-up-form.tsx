"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z
  .object({
    name: z
      .string("Nome inválido!")
      .min(2, "Nome deve ter pelo menos 2 caracteres!"),
    email: z.email("E-mail inválido!"),
    password: z
      .string("Senha inválida!")
      .min(8, "Senha deve ter pelo menos 8 caracteres!"),
    confirmPassword: z.string("Confirmação de senha inválida!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem!",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  async function onSubmit(values: FormValues) {
    setIsSignUpLoading(true);
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          setIsSignUpLoading(false);
          toast.success("Conta criada com sucesso!", {
            position: "bottom-left",
          });
        },
        onError: (ctx) => {
          if (ctx.error.code === "USER_ALREADY_EXISTS") {
            toast.error("E-mail já cadastrado.");
            setIsSignUpLoading(false);
            return form.setError("email", {
              message: "E-mail já cadastrado.",
            });
          }
          if (ctx.error.code === "WEAK_PASSWORD") {
            toast.error("Senha muito fraca.");
            setIsSignUpLoading(false);
            return form.setError("password", {
              message: "Senha muito fraca.",
            });
          }
          toast.error(ctx.error.message);
          setIsSignUpLoading(false);
        },
      },
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Criar Conta</CardTitle>
        <CardDescription className="text-white">
          Crie sua conta para continuar.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu email" {...field} />
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme sua senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha novamente"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant={"default"}
              className="cursor-pointer text-foreground"
              disabled={isSignUpLoading}
            >
              {isSignUpLoading ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  &nbsp;Criando sua Conta...
                </>
              ) : (
                "Criar na Conta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
