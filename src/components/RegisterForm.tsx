"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Fields {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

interface Errors extends Partial<Fields> {}

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "name is required";
    if (!fields.email.trim()) e.email = "email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "enter a valid email";
    if (!fields.password) e.password = "password is required";
    else if (fields.password.length < 8)
      e.password = "password must be at least 8 characters";
    if (!fields.confirm) e.confirm = "please confirm your password";
    else if (fields.confirm !== fields.password)
      e.confirm = "passwords do not match";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    const result = await register(fields.name, fields.email, fields.password);
    if (result.success) {
      router.push("/menu");
    } else {
      setServerError(result.error ?? "something went wrong");
    }
  }

  function inputClass(hasError: boolean) {
    return `w-full bg-transparent border px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none transition-colors ${
      hasError ? "border-burgundy" : "border-ink/20 focus:border-burgundy"
    }`;
  }

  return (
    <div className="w-full max-w-md border border-ink/10 p-10">
      <h1 className="font-playfair text-4xl text-ink mb-2">create an account.</h1>
      <p className="font-inter text-sm text-ink/50 mb-10">
        join crave. to start ordering.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {(
          [
            { id: "name", label: "full name", type: "text", placeholder: "Jane Smith" },
            { id: "email", label: "email", type: "email", placeholder: "jane@example.com" },
            { id: "password", label: "password", type: "password", placeholder: "min. 8 characters" },
            { id: "confirm", label: "confirm password", type: "password", placeholder: "••••••••" },
          ] as const
        ).map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2"
            >
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={fields[id]}
              onChange={(e) => update(id, e.target.value)}
              placeholder={placeholder}
              className={inputClass(!!errors[id])}
            />
            {errors[id] && (
              <p className="font-inter text-xs text-burgundy mt-1">{errors[id]}</p>
            )}
          </div>
        ))}

        {serverError && (
          <p className="font-inter text-xs text-burgundy">{serverError}</p>
        )}

        <button
          type="submit"
          className="w-full bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors mt-2"
        >
          create account
        </button>
      </form>

      <p className="font-inter text-sm text-ink/50 text-center mt-8">
        already have an account?{" "}
        <Link href="/login" className="text-burgundy hover:text-ink transition-colors">
          sign in →
        </Link>
      </p>
    </div>
  );
}
