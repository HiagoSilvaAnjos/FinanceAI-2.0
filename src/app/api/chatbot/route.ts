/* eslint-disable @typescript-eslint/no-unused-vars */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getChatbotResponse } from "@/services/ai-chatbot-service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return redirect("/authentication");

  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Pergunta é obrigatória." },
        { status: 400 },
      );
    }

    const response = await getChatbotResponse(question);

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
