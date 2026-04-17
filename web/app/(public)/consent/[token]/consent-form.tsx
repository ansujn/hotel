"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/Button";
import { MuxPlayer } from "@/components/video/MuxPlayer";
import { StepIndicator } from "@/components/consent/StepIndicator";
import { ScopeToggleRow } from "@/components/consent/ScopeToggleRow";
import { LanguageToggle } from "@/components/consent/LanguageToggle";
import {
  consentStrings,
  submitConsent,
  type ConsentContext,
  type ConsentScope,
  type ConsentStrings,
  type Lang,
} from "@/lib/consent";
import { ApiError } from "@/lib/api";

interface FormValues {
  channel: boolean;
  social: boolean;
  print: boolean;
  valid_months: 6 | 12 | 24;
  otp: string;
  signed_name: string;
}

interface Props {
  token: string;
  initialContext: ConsentContext | null;
}

export function ConsentForm({ token, initialContext }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const t = consentStrings[lang];
  const context = initialContext;
  const isInvalid = !context;

  const { control, watch, handleSubmit, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: {
        channel: true,
        social: false,
        print: false,
        valid_months: 12,
        otp: "",
        signed_name: "",
      },
    });

  const vals = watch();

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    if (!values.otp || values.otp.length !== 6) {
      setError(t.errorOtp);
      return;
    }
    if (!values.signed_name.trim()) {
      setError(t.errorName);
      return;
    }
    setSubmitting(true);
    try {
      const scope: ConsentScope = {
        channel: values.channel,
        social: values.social,
        print: values.print,
        valid_months: values.valid_months,
      };
      await submitConsent(token, {
        otp: values.otp,
        signed_name: values.signed_name.trim(),
        scope,
      });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || t.errorGeneric);
      } else {
        setError(t.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  });

  // ---------- Invalid token ----------
  if (isInvalid && !done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <Header lang={lang} onLang={setLang} t={t} />
        <div
          role="alert"
          className="mt-10 w-full rounded-2xl border border-[#2A2A36] bg-[#15151C] p-8"
        >
          <div className="text-4xl" aria-hidden>
            🔒
          </div>
          <h1 className="serif mt-3 text-2xl font-bold">{t.invalidTitle}</h1>
          <p className="mt-2 text-[#8A8A96]">{t.invalidBody}</p>
        </div>
      </div>
    );
  }

  // ---------- Success ----------
  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <Header lang={lang} onLang={setLang} t={t} />
        <div className="mt-10 w-full rounded-2xl border border-[#2A2A36] bg-[#15151C] p-10">
          <CheckAnim />
          <h1 className="serif mt-6 text-3xl font-bold">{t.successTitle}</h1>
          <p className="mt-2 text-[#B0B0BA]">{t.successBody}</p>
          <Link
            href="https://viktheatre.in"
            className="mt-6 inline-block text-sm text-[#E8C872] underline underline-offset-4 hover:text-[#f0d589]"
          >
            {t.successLink}
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Main wizard ----------
  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-8">
      <Header lang={lang} onLang={setLang} t={t} />

      <div className="mt-8">
        <StepIndicator current={step} t={t} />
      </div>

      <h1 className="serif mt-6 text-3xl font-bold sm:text-4xl">
        {t.pageTitle}
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[#B0B0BA]">
        {t.intro}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {step === 1 && <StepReview t={t} context={context!} />}
        {step === 2 && (
          <StepScope t={t} control={control} setValue={setValue} values={vals} />
        )}
        {step === 3 && (
          <StepSign
            t={t}
            values={vals}
            error={error}
            onOtpChange={(v) => setValue("otp", v)}
            onNameChange={(v) => setValue("signed_name", v)}
          />
        )}

        <div
          className="rounded-lg border border-[#2A2A36] bg-[#15151C]/50 px-4 py-3 text-xs text-[#8A8A96]"
          role="note"
        >
          {t.revoke}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : s))}
            disabled={step === 1 || submitting}
          >
            {t.back}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep((s) => ((s + 1) as 2 | 3))}
            >
              {t.next}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? t.signingButton : t.signButton}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------- Sub-components ----------

function Header({
  lang,
  onLang,
  t,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  t: ConsentStrings;
}) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="serif text-lg font-black">
        {t.brand}
        <span className="text-[#E8C872]">.</span>
      </Link>
      <LanguageToggle lang={lang} onChange={onLang} />
    </header>
  );
}

function StepReview({
  t,
  context,
}: {
  t: ConsentStrings;
  context: ConsentContext;
}) {
  return (
    <section aria-labelledby="review-h" className="space-y-4">
      <div>
        <h2 id="review-h" className="serif text-xl font-bold">
          {t.reviewHeading}
        </h2>
        <p className="mt-1 text-sm text-[#8A8A96]">{t.reviewHint}</p>
      </div>
      {context.asset.mux_playback_id ? (
        <MuxPlayer
          playbackId={context.asset.mux_playback_id}
          title={context.asset.title}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#2A2A36] bg-black/60 text-[#8A8A96]">
          {context.asset.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={context.asset.thumbnail_url}
              alt={context.asset.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm">Preview unavailable</span>
          )}
        </div>
      )}
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-[#2A2A36] bg-[#15151C] p-5 text-sm">
        <div>
          <dt className="text-[10px] tracking-[0.3em] text-[#8A8A96]">TITLE</dt>
          <dd className="serif mt-1 text-base">{context.asset.title}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.3em] text-[#8A8A96]">STUDENT</dt>
          <dd className="serif mt-1 text-base">{context.student.name}</dd>
        </div>
        {context.batch && (
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-[#8A8A96]">BATCH</dt>
            <dd className="serif mt-1 text-base">{context.batch.name}</dd>
          </div>
        )}
        <div>
          <dt className="text-[10px] tracking-[0.3em] text-[#8A8A96]">DATE</dt>
          <dd className="serif mt-1 text-base">
            {new Date(context.asset.created_at).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function StepScope({
  t,
  control,
  setValue,
  values,
}: {
  t: ConsentStrings;
  control: ReturnType<typeof useForm<FormValues>>["control"];
  setValue: (name: keyof FormValues, value: FormValues[keyof FormValues]) => void;
  values: FormValues;
}) {
  const months = [6, 12, 24] as const;
  const monthLabel: Record<(typeof months)[number], string> = {
    6: t.months6,
    12: t.months12,
    24: t.months24,
  };
  return (
    <section aria-labelledby="scope-h" className="space-y-4">
      <div>
        <h2 id="scope-h" className="serif text-xl font-bold">
          {t.scopeHeading}
        </h2>
        <p className="mt-1 text-sm text-[#8A8A96]">{t.scopeSub}</p>
      </div>
      <Controller
        name="channel"
        control={control}
        render={({ field }) => (
          <ScopeToggleRow
            title={t.channelTitle}
            hint={t.channelHint}
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="social"
        control={control}
        render={({ field }) => (
          <ScopeToggleRow
            title={t.socialTitle}
            hint={t.socialHint}
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="print"
        control={control}
        render={({ field }) => (
          <ScopeToggleRow
            title={t.printTitle}
            hint={t.printHint}
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <fieldset className="rounded-xl border border-[#2A2A36] bg-[#15151C] p-5">
        <legend className="serif px-2 text-base font-bold">
          {t.validityTitle}
        </legend>
        <p className="text-sm text-[#8A8A96]">{t.validityHint}</p>
        <div
          role="radiogroup"
          aria-label={t.validityTitle}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {months.map((m) => {
            const active = values.valid_months === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue("valid_months", m)}
                className={[
                  "rounded-lg border px-3 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60",
                  active
                    ? "border-[#E8C872] bg-[#E8C872]/10 text-[#E8C872]"
                    : "border-[#2A2A36] text-[#C9C9D1] hover:border-[#E8C872]/40",
                ].join(" ")}
              >
                {monthLabel[m]}
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function StepSign({
  t,
  values,
  error,
  onOtpChange,
  onNameChange,
}: {
  t: ConsentStrings;
  values: FormValues;
  error: string | null;
  onOtpChange: (v: string) => void;
  onNameChange: (v: string) => void;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => values.otp.padEnd(6, " ").split(""), [values.otp]);

  const setDigit = (i: number, d: string) => {
    const clean = d.replace(/\D/g, "").slice(0, 1);
    const arr = values.otp.padEnd(6, " ").split("");
    arr[i] = clean || " ";
    onOtpChange(arr.join("").replace(/\s+$/, "").trim());
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    onOtpChange(text);
    const last = Math.min(text.length, 5);
    inputs.current[last]?.focus();
  };

  return (
    <section aria-labelledby="sign-h" className="space-y-6">
      <div>
        <h2 id="sign-h" className="serif text-xl font-bold">
          {t.verifyHeading}
        </h2>
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#C9C9D1]">
          {t.otpLabel}
        </label>
        <div className="flex gap-2" role="group" aria-label={t.otpLabel}>
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digits[i].trim()}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-12 rounded-lg border border-[#2A2A36] bg-[#15151C] text-center text-xl font-semibold text-[#F5F5F7] focus:border-[#E8C872] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="signed_name" className="mb-2 block text-sm text-[#C9C9D1]">
          {t.nameLabel}
        </label>
        <input
          id="signed_name"
          type="text"
          autoComplete="name"
          value={values.signed_name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.namePlaceholder}
          className="w-full rounded-lg border border-[#2A2A36] bg-[#15151C] px-4 py-3 font-serif italic text-[#E8C872] placeholder:not-italic placeholder:text-[#555] focus:border-[#E8C872] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
        />
        <p className="mt-2 text-xs text-[#8A8A96]">{t.nameHint}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}
    </section>
  );
}

function CheckAnim() {
  return (
    <div
      aria-hidden
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8C872]/15 text-[#E8C872]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-9 w-9"
        strokeWidth="2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M5 12l4 4L19 7"
          style={{
            strokeDasharray: 24,
            strokeDashoffset: 0,
            animation: "consent-check 420ms ease-out",
          }}
        />
      </svg>
      <style>{`@keyframes consent-check { from { stroke-dashoffset: 24 } to { stroke-dashoffset: 0 } }`}</style>
    </div>
  );
}
