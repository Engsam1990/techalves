import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/config/site";

const WhatsAppButton = () => {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elevated flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
