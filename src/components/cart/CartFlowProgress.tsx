import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const steps = [
  { key: "cart", label: "Cart" },
  { key: "checkout", label: "Checkout" },
  { key: "confirm", label: "Confirm" },
] as const;

type CartFlowStep = (typeof steps)[number]["key"];

const stepOrder: Record<CartFlowStep, number> = {
  cart: 0,
  checkout: 1,
  confirm: 2,
};

const stepProgress: Record<CartFlowStep, number> = {
  cart: 34,
  checkout: 68,
  confirm: 100,
};

interface CartFlowProgressProps {
  current: CartFlowStep;
}

const CartFlowProgress = ({ current }: CartFlowProgressProps) => {
  const activeIndex = stepOrder[current];

  return (
    <div className="rounded-2xl border bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors sm:h-8 sm:w-8 sm:text-xs",
                  isActive
                    ? "border-brand-yellow bg-brand-yellow text-secondary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className={cn("truncate", isCurrent ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            </div>
          );
        })}
      </div>
      <Progress
        value={stepProgress[current]}
        className="cart-progress-track mt-4 h-2"
        indicatorClassName="cart-progress-indicator"
      />
    </div>
  );
};

export default CartFlowProgress;
