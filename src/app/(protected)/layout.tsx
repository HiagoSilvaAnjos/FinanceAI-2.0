import { ChatbotDialog } from "@/components/chatbot-dialog";
import NavBar from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
      <ChatbotDialog />
    </>
  );
}
