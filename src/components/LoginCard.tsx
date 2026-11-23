import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { CheckIcon, EyeIcon, LockIcon, Spinner, UserIcon } from "./icons";
import { AuthError, signIn, type AuthErrorCode } from "../auth";

type Errors = { username?: string; password?: string; auth?: string };

const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "账号或密码错误",
  RATE_LIMITED: "尝试次数过多，请稍后再试",
  FORBIDDEN: "登录请求未通过安全校验",
  PROTOCOL_ERROR: "登录响应异常，请刷新后重试",
  NETWORK_ERROR: "网络连接失败，请稍后再试",
  SERVER_ERROR: "服务暂时不可用，请稍后再试",
};

export function LoginCard() {
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="auth-title"
      className="relative mt-28 flex w-full flex-col rounded-card bg-white px-24 pb-28 pt-34 shadow-card sm:px-40 sm:pb-40 sm:pt-44 desk:absolute desk:left-1039 desk:top-145 desk:mt-0 desk:h-617 desk:w-584 desk:pb-0 desk:pl-47 desk:pr-40 desk:pt-80"
    >
      {signedInAs === null ? (
        <LoginForm onSuccess={setSignedInAs} />
      ) : (
        <SignedIn name={signedInAs} onBack={() => setSignedInAs(null)} />
      )}
    </section>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const name = username.trim();
    const nextErrors: Errors = {
      username: name ? undefined : "请输入用户名或邮箱",
      password: !password ? "请输入密码" : password.length < 6 ? "密码至少需要 6 位" : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.username) {
      usernameRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setPending(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next") ?? "/";
      const redirectTo = await signIn(name, password, next);
      window.location.assign(redirectTo);
    } catch (failure) {
      const code = failure instanceof AuthError ? failure.code : "SERVER_ERROR";
      setErrors({ auth: AUTH_MESSAGES[code] });
      setPending(false);
    }
  };

  return (
    <div className="animate-panel-in">
      <header className="text-center">
        <h1
          id="auth-title"
          className="text-26 font-bold leading-none tracking-[0.02em] text-ink sm:text-30 desk:text-44"
        >
          登录 T3 Code
        </h1>
        <p className="mt-12 text-15 font-medium leading-none text-ink-3 sm:text-17 desk:mt-24 desk:text-26 desk:font-[480] desk:tracking-[0.01em]">
          开启你的智能编码之旅
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-busy={pending || undefined}
        className="mt-28 desk:mt-61"
      >
        <Field
          id="login-username"
          label="用户名或邮箱"
          icon={<UserIcon className="h-19 w-18 desk:h-27 desk:w-26 desk:translate-y-1" />}
          inputRef={usernameRef}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            if (errors.username) setErrors((current) => ({ ...current, username: undefined }));
          }}
          placeholder="请输入用户名或邮箱"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          readOnly={pending}
          error={errors.username}
        />
        <div className="mt-16 desk:mt-31.5">
          <Field
            id="login-password"
            label="密码"
            icon={
              <LockIcon
                preserveAspectRatio="none"
                className="h-20 w-18 desk:h-29.5 desk:w-25 desk:-translate-y-1.5"
              />
            }
            inputRef={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="请输入密码"
            autoComplete="current-password"
            readOnly={pending}
            error={errors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                aria-pressed={showPassword}
                className="mr-8 grid size-38 shrink-0 place-items-center rounded-field text-[#646a86] transition-colors hover:bg-[#f1f4fa] hover:text-ink desk:mr-12 desk:size-42"
              >
                <EyeIcon off={showPassword} className="h-15 w-21 desk:h-19.5 desk:w-28" />
              </button>
            }
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-24 flex h-52 w-full items-center justify-center gap-10 rounded-field bg-brand text-17 font-medium text-white transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-hover hover:shadow-button active:scale-[0.99] active:bg-brand-press disabled:cursor-progress disabled:bg-brand-hover desk:mt-37.5 desk:h-66 desk:text-24 desk:font-[440]"
        >
          {pending && <Spinner className="size-19 desk:size-26" />}
          {pending ? "登录中…" : "登录"}
        </button>
        {errors.auth && (
          <p role="alert" className="mt-12 text-13 text-danger desk:text-16">
            {errors.auth}
          </p>
        )}
      </form>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

function Field({ id, label, icon, error, trailing, inputRef, ...inputProps }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={`group flex h-52 items-center rounded-field border bg-white transition-[border-color,box-shadow] duration-200 desk:h-69.5 ${
          error
            ? "border-danger shadow-[0_0_0_0.1875rem_rgb(229_72_77/0.12)]"
            : "border-field hover:border-field-hover focus-within:border-brand focus-within:shadow-[0_0_0_0.1875rem_rgb(6_101_254/0.12)] hover:focus-within:border-brand"
        }`}
      >
        <span
          className={`pointer-events-none ml-16 flex shrink-0 transition-colors desk:ml-24 ${
            error ? "text-danger" : "text-icon group-focus-within:text-brand"
          }`}
        >
          {icon}
        </span>
        <input
          id={id}
          ref={inputRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent pl-12 pr-16 text-16 text-ink caret-brand outline-none placeholder:font-[470] placeholder:text-muted desk:pl-25 desk:text-22 desk:tracking-[0.02em]"
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-6 pl-2 text-13 leading-none text-danger desk:absolute desk:left-0 desk:top-full desk:mt-7 desk:text-16"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SignedIn({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div
      role="status"
      className="animate-panel-in flex flex-1 flex-col items-center justify-center py-16 text-center desk:pb-80 desk:pt-0"
    >
      <span className="grid size-64 place-items-center rounded-full bg-brand text-white shadow-button desk:size-84">
        <CheckIcon className="size-30 desk:size-40" />
      </span>
      <h1
        id="auth-title"
        className="mt-22 text-26 font-bold leading-none text-ink desk:mt-30 desk:text-38"
      >
        登录成功
      </h1>
      <p className="mt-12 text-15 text-ink-3 desk:mt-16 desk:text-22">欢迎回来，{name}</p>
      <div className="mt-28 w-full max-w-260 desk:mt-40 desk:max-w-340">
        <div className="h-5 overflow-hidden rounded-full bg-[#e5ecfb] desk:h-6">
          <div className="h-full origin-left animate-progress rounded-full bg-brand" />
        </div>
        <p className="mt-12 text-13 text-muted desk:mt-14 desk:text-18">正在进入工作台…</p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-26 text-14 font-medium text-brand transition-colors hover:text-brand-hover hover:underline hover:underline-offset-4 desk:mt-40 desk:text-19"
      >
        返回登录
      </button>
    </div>
  );
}
