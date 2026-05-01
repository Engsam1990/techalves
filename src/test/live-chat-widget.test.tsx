import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LiveChatWidget from "@/components/layout/LiveChatWidget";
import { siteConfig } from "@/config/site";

describe("LiveChatWidget", () => {
  it("opens and shows quick replies", () => {
    render(<LiveChatWidget />);

    fireEvent.click(screen.getByTestId("live-chat-toggle"));

    expect(screen.getByText(`${siteConfig.businessName} Support`)).toBeInTheDocument();
    expect(screen.getByText("I need a laptop recommendation")).toBeInTheDocument();
  });

  it("builds a WhatsApp handoff link with the visitor message", () => {
    render(<LiveChatWidget />);

    fireEvent.click(screen.getByTestId("live-chat-toggle"));
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Alex" } });
    fireEvent.change(screen.getByLabelText("Type a message"), { target: { value: "Need a Lenovo laptop" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    const handoffLink = screen.getByTestId("whatsapp-handoff") as HTMLAnchorElement;
    expect(handoffLink.href).toContain(`wa.me/${siteConfig.supportPhoneE164}`);
    expect(decodeURIComponent(handoffLink.href)).toContain("Alex");
    expect(decodeURIComponent(handoffLink.href)).toContain("Need a Lenovo laptop");
  });
});
