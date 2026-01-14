import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface TooltipHelpProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconClassName?: string;
}

/**
 * Reusable help icon with tooltip
 * Provides contextual help throughout the interface
 *
 * @example
 * <TooltipHelp content="This shows your available balance in the selected voucher" />
 */
export function TooltipHelp({
  content,
  side = "top",
  className,
  iconClassName,
}: TooltipHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger
          asChild
          className={cn("inline-flex items-center", className)}
        >
          <button
            type="button"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            aria-label="Help information"
          >
            <HelpCircle
              className={cn(
                "w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help",
                iconClassName
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[280px] text-sm leading-relaxed"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
