"use client";

import { useActionState, useState } from "react";
import {
  sendMagicLink,
  verifyCode,
  type SendMagicLinkState,
  type VerifyCodeState,
} from "./actions";

const initialSendState: SendMagicLinkState = { status: "idle" };
const initialVerifyState: VerifyCodeState = { status: "idle" };

export default function LoginPage() {
  const [sendState, sendAction, sendPending] = useActionState(
    sendMagicLink,
    initialSendState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyCode,
    initialVerifyState,
  );
  const [email, setEmail] = useState("");

  const codeStep = sendState.status === "success";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {codeStep
            ? "Entre le code reçu par email."
            : "Pas de mot de passe : entre ton email, tu reçois un code."}
        </p>
      </div>

      {!codeStep ? (
        <form action={sendAction} className="flex flex-col gap-3">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={sendPending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {sendPending ? "Envoi..." : "Recevoir mon code de connexion"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={sendState.email ?? email} />
          <label htmlFor="code" className="sr-only">
            Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="123456"
            autoFocus
            className="rounded-md border border-neutral-300 px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={verifyPending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {verifyPending ? "Vérification..." : "Confirmer"}
          </button>
        </form>
      )}

      {sendState.status !== "idle" && (
        <p
          role="status"
          className={
            sendState.status === "success"
              ? "text-sm text-green-600"
              : "text-sm text-red-600"
          }
        >
          {sendState.message}
        </p>
      )}

      {verifyState.status === "error" && (
        <p role="status" className="text-sm text-red-600">
          {verifyState.message}
        </p>
      )}
    </main>
  );
}
