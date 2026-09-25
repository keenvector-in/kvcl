import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../Button/index';
import { InlineStatus } from '../InlineStatus/index';
import { TextField } from '../TextField/index';
import { setTokens } from '../../api/httpClient';
import type { ForgotPasswordResponse, Session, TokenPair } from '../../api/identity';

/**
 * The email + password half of the login screen, shared by every KeenPlaza frontend
 * (the consoles and each storefront). Phone OTP stays the default method; these forms
 * sit behind the second tab and on the /reset page the emailed link opens.
 *
 * Each form owns only its own fields and request state — the caller passes the matching
 * `identityApi` function and decides what happens after success.
 */

/** Identity's rule, mirrored here so the field can say so before the request goes out. */
export const MIN_PASSWORD_LENGTH = 8;

function useSubmit<T>(run: () => Promise<T>, onDone: (result: T) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    run().then(
      (result) => {
        setPending(false);
        onDone(result);
      },
      (err: unknown) => {
        setPending(false);
        setError(err instanceof Error ? err.message : 'Something went wrong, try again.');
      },
    );
  };
  return { pending, error, submit };
}

export interface PasswordLoginFormProps {
  /** `identity.login` */
  login: (email: string, password: string) => Promise<TokenPair>;
  /** Called after the tokens are stored. */
  onLoggedIn: () => void;
  onForgotPassword: () => void;
  /** Extra content under the button (e.g. a link to sign up). */
  footer?: ReactNode;
  submitLabel?: string;
}

export function PasswordLoginForm({
  login,
  onLoggedIn,
  onForgotPassword,
  footer,
  submitLabel = 'Log in',
}: PasswordLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { pending, error, submit } = useSubmit(
    () => login(email.trim(), password),
    (tokens: TokenPair) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      onLoggedIn();
    },
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <Button type="submit" block loading={pending} disabled={!email.trim() || !password}>
        {submitLabel}
      </Button>
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
      <button
        type="button"
        onClick={onForgotPassword}
        className="self-center text-[13px] font-semibold text-brand-600 underline-offset-2 hover:underline"
      >
        Forgot password?
      </button>
      {footer}
    </form>
  );
}

export interface RegisterFormProps {
  /** `identity.register` */
  register: (email: string, password: string) => Promise<TokenPair>;
  /** Called after the tokens are stored: the new account is logged in. */
  onRegistered: () => void;
  /** Extra content under the button (e.g. "Already have an account? Log in"). */
  footer?: ReactNode;
  submitLabel?: string;
}

/** Email sign-up: email, password, the password again. Success logs the new account in. */
export function RegisterForm({ register, onRegistered, footer, submitLabel = 'Create account' }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const { pending, error, submit } = useSubmit(
    () => register(email.trim(), password),
    (tokens: TokenPair) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      onRegistered();
    },
  );
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = again.length > 0 && again !== password;

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={tooShort ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <TextField
        label="Password again"
        type="password"
        autoComplete="new-password"
        value={again}
        onChange={(e) => setAgain(e.target.value)}
        error={mismatch ? "The two passwords don't match." : undefined}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <Button
        type="submit"
        block
        loading={pending}
        disabled={!email.trim() || password.length < MIN_PASSWORD_LENGTH || again !== password}
      >
        {submitLabel}
      </Button>
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
      {footer}
    </form>
  );
}

export interface ForgotPasswordFormProps {
  /** `identity.forgotPassword` */
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  onBack: () => void;
  /** Prefill when the user already typed an address on the login tab. */
  defaultEmail?: string;
}

export function ForgotPasswordForm({ forgotPassword, onBack, defaultEmail = '' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [sent, setSent] = useState<ForgotPasswordResponse | null>(null);
  const { pending, error, submit } = useSubmit(() => forgotPassword(email.trim()), setSent);

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <InlineStatus kind="success">{sent.message}</InlineStatus>
        {sent.dev_reset_link ? (
          // Dev only: identity has no SMTP host configured, so it hands the link back instead.
          <p className="break-all rounded-lg border border-line bg-sunken p-3 text-xs">
            Dev mode — open{' '}
            <a className="font-semibold text-brand-600 underline" href={sent.dev_reset_link}>
              {sent.dev_reset_link}
            </a>
          </p>
        ) : null}
        <Button type="button" variant="ghost" block onClick={onBack}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <p className="text-[13px] text-fg-muted">
        We'll email you a link to set a new password. It works once and expires shortly.
      </p>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <Button type="submit" block loading={pending} disabled={!email.trim()}>
        Send reset link
      </Button>
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
      <Button type="button" variant="ghost" block onClick={onBack}>
        Back to login
      </Button>
    </form>
  );
}

export interface ResetPasswordFormProps {
  /** `identity.resetPassword` */
  resetPassword: (token: string, password: string) => Promise<unknown>;
  /** The `token` query parameter from the emailed link. */
  token: string;
  /** Called once the password is set — the old sessions are gone, so send them to login. */
  onDone: () => void;
}

export function ResetPasswordForm({ resetPassword, token, onDone }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm !== '' && confirm !== password;
  const { pending, error, submit } = useSubmit(() => resetPassword(token, password), onDone);

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <p className="text-[13px] text-fg-muted">Choose something you haven't used before.</p>
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? 'Both passwords must match.' : undefined}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <Button
        type="submit"
        block
        loading={pending}
        disabled={password.length < MIN_PASSWORD_LENGTH || mismatch || confirm === ''}
      >
        Set new password
      </Button>
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
    </form>
  );
}

export interface SessionsListProps {
  /** `identity.sessions` */
  sessions: () => Promise<Session[]>;
  /** `identity.revokeSession` */
  revokeSession: (id: string) => Promise<unknown>;
  /** `identity.revokeOtherSessions` */
  revokeOtherSessions: () => Promise<unknown>;
}

const whenLabel = (iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};

/**
 * "Where you're signed in": the account's live sessions, with a way to end one or all the
 * others. Ending a session takes effect at once — the gateway stops accepting its access token.
 */
export function SessionsList({ sessions, revokeSession, revokeOtherSessions }: SessionsListProps) {
  const [rows, setRows] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    sessions().then(
      (list) => {
        setRows(list);
        setError(null);
      },
      (err: unknown) => setError(err instanceof Error ? err.message : 'Could not load your sessions.'),
    );
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    action().then(
      () => {
        setBusy(null);
        load();
      },
      (err: unknown) => {
        setBusy(null);
        setError(err instanceof Error ? err.message : 'Could not end that session.');
      },
    );
  };

  if (error && rows === null) return <InlineStatus kind="error">{error}</InlineStatus>;
  if (rows === null) return <InlineStatus kind="loading">Loading your sessions…</InlineStatus>;

  const others = rows.filter((s) => !s.current);

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2"
          >
            <span className="min-w-0">
              <b className="block truncate text-[13px]">
                {s.device_info || 'Unknown device'}
                {s.current ? <span className="ml-2 text-xs font-semibold text-success">this device</span> : null}
              </b>
              <small className="text-xs text-fg-subtle">Last used {whenLabel(s.last_used_at)}</small>
            </span>
            {s.current ? null : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={busy === s.id}
                onClick={() => run(s.id, () => revokeSession(s.id))}
              >
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>
      {others.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          loading={busy === 'others'}
          onClick={() => run('others', revokeOtherSessions)}
        >
          Sign out everywhere else
        </Button>
      ) : null}
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
    </div>
  );
}

export interface LoginDetailsPanelProps {
  /** What `identity.me` returned. */
  me: { phone: string; email?: string; has_password?: boolean };
  /** `identity.setEmail` */
  setEmail: (email: string) => Promise<unknown>;
  /** `identity.changePassword` */
  changePassword: (currentPassword: string, newPassword: string) => Promise<unknown>;
  /** Called after the email or the password changed, to refetch `me`. */
  onUpdated?: () => void;
  /** Pass `identity.sessions/revokeSession/revokeOtherSessions` to add "where you're signed in". */
  sessions?: SessionsListProps;
}

/**
 * The account screen's login section: the email on file plus the password.
 * An account is created from a phone number alone, so without an email here its owner can
 * never receive a reset link — which is how a first password gets set.
 */
export function LoginDetailsPanel({ me, setEmail, changePassword, onUpdated, sessions }: LoginDetailsPanelProps) {
  const [email, setEmailValue] = useState('');
  const [saved, setSaved] = useState(false);
  const { pending, error, submit } = useSubmit(
    () => setEmail(email.trim()),
    () => {
      setEmailValue('');
      setSaved(true);
      onUpdated?.();
    },
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[13px] text-fg-muted">
          Mobile number <b className="text-fg">{me.phone}</b>
        </p>
        <p className="mt-1 text-[13px] text-fg-muted">
          Email {me.email ? <b className="text-fg">{me.email}</b> : <span className="text-fg-subtle">not set yet</span>}
        </p>
        <form className="mt-3 flex flex-col gap-3" onSubmit={submit} noValidate>
          <TextField
            label={me.email ? 'Change email' : 'Add an email'}
            type="email"
            autoComplete="email"
            placeholder="you@example.in"
            value={email}
            onChange={(e) => setEmailValue(e.target.value)}
            hint="Used to log in with a password and to send a reset link."
            required
            disabled={pending}
            style={{ marginBottom: 0 }}
          />
          <Button type="submit" loading={pending} disabled={!email.trim()}>
            Save email
          </Button>
          {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
          {saved && !error ? <InlineStatus kind="success">Email saved.</InlineStatus> : null}
        </form>
      </div>

      <div className="border-t border-line pt-4">
        <h3 className="mb-3 text-sm font-bold">{me.has_password ? 'Change password' : 'Set a password'}</h3>
        <ChangePasswordForm changePassword={changePassword} hasPassword={me.has_password} onDone={onUpdated} />
      </div>

      {sessions ? (
        <div className="border-t border-line pt-4">
          <h3 className="mb-3 text-sm font-bold">Where you're signed in</h3>
          <SessionsList {...sessions} />
        </div>
      ) : null}
    </div>
  );
}

export interface ChangePasswordFormProps {
  /** `identity.changePassword` */
  changePassword: (currentPassword: string, newPassword: string) => Promise<unknown>;
  /** False for an account that has never had a password (it logs in with OTP). */
  hasPassword?: boolean;
  onDone?: () => void;
}

/** The logged-in change, for an account screen. */
export function ChangePasswordForm({ changePassword, hasPassword = true, onDone }: ChangePasswordFormProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [done, setDone] = useState(false);
  const { pending, error, submit } = useSubmit(
    () => changePassword(current, next),
    () => {
      setCurrent('');
      setNext('');
      setDone(true);
      onDone?.();
    },
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      {hasPassword ? (
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          disabled={pending}
          style={{ marginBottom: 0 }}
        />
      ) : null}
      <TextField
        label={hasPassword ? 'New password' : 'Password'}
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        required
        disabled={pending}
        style={{ marginBottom: 0 }}
      />
      <Button type="submit" loading={pending} disabled={next.length < MIN_PASSWORD_LENGTH || (hasPassword && !current)}>
        {hasPassword ? 'Change password' : 'Set password'}
      </Button>
      {error ? <InlineStatus kind="error">{error}</InlineStatus> : null}
      {done && !error ? <InlineStatus kind="success">Password updated.</InlineStatus> : null}
    </form>
  );
}
