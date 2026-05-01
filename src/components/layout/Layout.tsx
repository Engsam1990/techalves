import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import LiveChatWidget from "./LiveChatWidget";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header />
      <main className="relative flex-1 overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.12),_transparent_30%)]" />
        {children}
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
};

export default Layout;
