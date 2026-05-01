import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ExternalLink, Mail, MessageCircle, Phone, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppUrl, siteConfig } from "@/config/site";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
}

const quickReplies = [
  "I need a laptop recommendation",
  "Do you offer warranties?",
  "How do deliveries work?",
  "I want help placing an order",
];

const cannedResponses: Record<string, string> = {
  "i need a laptop recommendation": "Tell us your budget, preferred brand, and whether you want a new, refurbished, or ex-UK machine. Our sales team can recommend a few options immediately on WhatsApp.",
  "do you offer warranties?": "Yes. Warranty length depends on the product and condition. Share the product you want and we will confirm the exact warranty terms for it.",
  "how do deliveries work?": "We support Nairobi delivery and can also arrange countrywide delivery. Send us your location on WhatsApp and we will confirm timelines and delivery cost.",
  "i want help placing an order": "Great. Continue on WhatsApp and our team will help you confirm the item, delivery details, and payment steps.",
};

const timeLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const initialMessage: Message = {
  id: 1,
  text: `Hi! 👋 Welcome to ${siteConfig.businessName}. Ask a question here, then continue on WhatsApp for a faster human response.`,
  sender: "bot",
  time: timeLabel(),
};

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");

  const appendBotReply = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text,
        sender: "bot",
        time: timeLabel(),
      },
    ]);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        sender: "user",
        time: timeLabel(),
      },
    ]);
    setInput("");

    window.setTimeout(() => {
      const canned = cannedResponses[trimmed.toLowerCase()];
      appendBotReply(
        canned ||
          `Thanks for your message. For faster assistance, continue on WhatsApp or call ${siteConfig.supportPhoneDisplay}.`
      );
    }, 350);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handoffMessage = useMemo(() => {
    const transcript = messages
      .slice(1)
      .map((message) => `${message.sender === "user" ? "Customer" : "Techalves"}: ${message.text}`)
      .join("\n");

    const parts = [
      `Hello ${siteConfig.businessName},`,
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      transcript ? `\nChat transcript:\n${transcript}` : "\nI would like assistance with a product.",
    ].filter(Boolean);

    return parts.join("\n");
  }, [email, messages, name]);

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(handoffMessage), [handoffMessage]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 right-4 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-elevated"
          >
            <div className="flex items-center justify-between bg-[#030303] p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">{siteConfig.businessName} Support</p>
                  <p className="text-xs text-primary-foreground/75">Quick answers here, human handoff on WhatsApp</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-b px-4 py-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                />
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email (optional)"
                  type="email"
                  aria-label="Your email"
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.sender === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </motion.div>
              ))}

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => sendMessage(reply)}
                      className="rounded-full border  px-3 py-1.5 text-xs  transition-colors  hover:text-primary"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t p-3">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  aria-label="Type a message"
                />
                <Button type="submit" size="icon" className="shrink-0" aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <div className="grid gap-2 grid-cols-3">
                <Button asChild className="col-span-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="whatsapp-handoff"
                  >
                    Continue on WhatsApp
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${siteConfig.supportPhoneE164}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <a href={`mailto:${siteConfig.supportEmail}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {siteConfig.supportEmail}
                </a>
                <span>{siteConfig.businessHours}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform hover:scale-110"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        data-testid="live-chat-toggle"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
};

export default LiveChatWidget;
