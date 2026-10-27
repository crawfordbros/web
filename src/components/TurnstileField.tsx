import { forwardRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { config } from "../config";

export type { TurnstileInstance };

/**
 * Cloudflare Turnstile spam check. Renders nothing when no site key is configured (local development),
 * in which case the form submits an empty token. The widget's space is reserved before it loads so the
 * submit button never moves under a visitor's finger.
 */
export const TurnstileField = forwardRef<TurnstileInstance, { armed: boolean; onToken: (token: string) => void }>(
  function TurnstileField({ armed, onToken }, ref) {
    if (!config.turnstileSiteKey) return null;
    return (
      <div className="min-h-[65px]">
        {armed && (
          <Turnstile
            ref={ref}
            siteKey={config.turnstileSiteKey}
            options={{ size: "flexible", theme: "light" }}
            onSuccess={onToken}
            onExpire={() => onToken("")}
            onError={() => onToken("")}
          />
        )}
      </div>
    );
  },
);
