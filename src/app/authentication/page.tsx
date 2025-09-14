import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

const Authentication = async () => {
  return (
    <div className="grid h-screen grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
          width={173}
          height={39}
          alt="Finace AI"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Seja Bem vindo</h1>
        <p className="text-muted-foreground mb-8 text-justify">
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Tabs defaultValue="sign-in">
            <TabsList>
              <TabsTrigger
                className="cursor-pointer px-8 py-4 transition duration-300 ease-in-out hover:bg-gray-500/30"
                value="sign-in"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer px-8 py-4 transition duration-300 ease-in-out hover:bg-gray-500/30"
                value="sign-up"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
              <SignInForm />
            </TabsContent>
            <TabsContent value="sign-up">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="relative h-full w-full">
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
