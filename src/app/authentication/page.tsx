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
    <div className="grid h-screen grid-cols-1 md:grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
          width={173}
          height={39}
          alt="Finance AI"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Seja Bem vindo</h1>
        <p className="mb-8 text-justify text-muted-foreground">
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Entrar com Google</CardTitle>
              <CardDescription className="text-white">
                Faça login para continuar usando sua conta Google.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <GoogleSignInButton />
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-sm text-muted-foreground">
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
