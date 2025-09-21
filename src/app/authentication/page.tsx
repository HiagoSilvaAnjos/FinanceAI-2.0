import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import GoogleSignInButton from "./components/google-sign-in-button";

const Authentication = async () => {
  return (
    <div className="grid h-screen grid-cols-1 bg-[hsl(20_14.3%_4.1%)] md:grid-cols-2">
      <div className="mx-auto flex h-full max-w-[650px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
          width={173}
          height={39}
          alt="Finance AI"
          className="mb-8"
          priority
        />
        <h1 className="mb-3 text-4xl font-bold text-white">Seja Bem vindo</h1>
        <p className="mb-8 text-justify text-white">
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <div className="flex w-full flex-col gap-6">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Entrar com Google
              </CardTitle>
              <CardDescription className="text-white/70">
                Faça login para continuar usando sua conta Google.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <GoogleSignInButton />
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-sm text-white/70">
                Ao continuar, você concorda com nossos termos de uso e política
                de privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="relative hidden h-full w-full md:block">
        <Image
          src="/banner-authentication.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default Authentication;
