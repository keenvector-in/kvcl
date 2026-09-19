import { useCallback, useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/index';

export interface RedirectButtonProps extends Omit<ButtonProps<'button'>, 'onClick' | 'as'> {
  /**
   * Returns the URL to send the browser to. Sync or async — async lets you
   * fetch a redirect_uri/state token (e.g. from webhook-ingress) right
   * before navigating, instead of baking it in ahead of time.
   */
  resolveHref: () => string | Promise<string>;
  /** Called if resolveHref rejects. The button re-enables itself either way. */
  onError?: (error: unknown) => void;
  /** Shown instead of children while resolveHref is pending. */
  loadingChildren?: ReactNode;
}

/**
 * A button that takes the browser fully away from the app — not client-side
 * routing — to start a provider's own login/signup (Meta OAuth, Instagram
 * Business Login, etc). Kept separate from Button/`as={Link}` because those
 * navigate *within* the app; this one intentionally leaves it.
 */
export function RedirectButton({
  resolveHref,
  onError,
  loadingChildren,
  children,
  disabled,
  ...rest
}: RedirectButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      window.location.href = await resolveHref();
      // No reset on success — the page is navigating away.
    } catch (error) {
      setLoading(false);
      onError?.(error);
    }
  }, [resolveHref, onError]);

  return (
    <Button onClick={handleClick} disabled={disabled || loading} {...rest}>
      {loading ? (loadingChildren ?? children) : children}
    </Button>
  );
}
