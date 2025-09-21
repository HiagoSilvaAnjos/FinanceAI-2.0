/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Bot, Loader2, MessageSquare, Send, User, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Textarea } from "./ui/textarea";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const initialMessage: Message = {
  text: "Olá! Sou seu assistente FinanceAI. Como posso ajudar com suas finanças hoje?",
  sender: "bot",
};

const suggestions = [
  "Qual é o meu saldo atual?",
  "Quais foram minhas maiores despesas este mês?",
  "Me dê uma dica para economizar.",
];

export const ChatbotDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      setTimeout(() => {
        scrollAreaViewportRef.current!.scrollTop =
          scrollAreaViewportRef.current!.scrollHeight;
      }, 100);
    }
  }, [messages, isLoading]);

  const streamResponse = (fullText: string) => {
    let index = 0;
    const intervalDuration = Math.max(10, 6000 / fullText.length); // Duração máxima de 6s

    const intervalId = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.text = fullText.substring(0, index + 1);
        index++;
        return newMessages;
      });

      if (index > fullText.length) {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    }, intervalDuration);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage, { text: "", sender: "bot" }]); // Adiciona placeholder
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      });

      if (!response.ok) throw new Error("Falha na resposta da API");

      const data = await response.json();
      streamResponse(data.response);
    } catch (error) {
      const errorMessage: Message = {
        text: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        sender: "bot",
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-5 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
        aria-label="Abrir chat do assistente"
      >
        <MessageSquare />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex h-[80vh] w-[90vw] max-w-lg flex-col p-0 md:max-w-2xl">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex items-center gap-2">
              <Bot /> Assistente Financeiro
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1" ref={scrollAreaViewportRef}>
            <div className="space-y-6 p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    msg.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.sender === "bot" && (
                    <Bot className="h-6 w-6 flex-shrink-0 text-primary" />
                  )}
                  <div className="flex max-w-[85%] flex-col items-start">
                    <p
                      className={cn(
                        "mb-1 text-sm text-black dark:text-white",
                        msg.sender === "user" && "self-end",
                      )}
                    >
                      {msg.sender === "bot"
                        ? "FinanceAI"
                        : session?.user?.name || "Você"}
                    </p>
                    <div
                      className={cn(
                        "break-words rounded-lg px-4 py-2 text-xs md:text-sm",
                        msg.sender === "bot"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {msg.text ? (
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-inside list-decimal"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-inside list-disc"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-primary" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-primary" {...props} />
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-0"></span>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-150"></span>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-300"></span>
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <User className="h-6 w-6 flex-shrink-0" />
                  )}
                </div>
              ))}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col items-start gap-2 pt-4 md:flex-col">
                  {suggestions.map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      className="w-fit px-2 py-1 text-xs md:w-auto md:text-sm"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t">
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-2 p-4"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre suas finanças..."
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Enviar <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="px-4 pb-4 text-center text-xs text-black dark:text-white md:text-sm">
              A IA pode cometer erros. Considere verificar as informações
              importantes.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
