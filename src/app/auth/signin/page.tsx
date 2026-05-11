"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [error, setError] = useState<string>("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/monitor",
      redirect: false,
    });

    if (!result || result.error) {
      setError("Login gagal. Periksa kredensial.");
      return;
    }

    window.location.href = result.url ?? "/monitor";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button type="submit" className="w-full rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-900">
          Login
        </button>
      </form>
    </main>
  );
}
