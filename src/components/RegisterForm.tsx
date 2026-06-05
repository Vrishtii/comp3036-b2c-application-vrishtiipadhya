"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PreferencePicker from "@/components/PreferencePicker";

interface Fields {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

interface Errors extends Partial<Fields> {}

function Required() {
  return <span className="text-burgundy ml-0.5">*</span>;
}

export default function RegisterForm() {
  const { register } = useAuth();

  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (key === "confirm") {
      if (value && value !== fields.password) {
        setErrors((prev) => ({ ...prev, confirm: "passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirm: undefined }));
      }
    } else if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "name is required";
    if (!fields.email.trim()) e.email = "email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "enter a valid email";
    if (fields.phone.trim()) {
      const stripped = fields.phone.replace(/[\s\-\(\)]/g, "");
      if (!/^(\+?61|0)[2-9]\d{8}$/.test(stripped))
        e.phone = "enter a valid australian phone number";
    }
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
    const result = await register(fields.name, fields.email, fields.password, fields.phone.trim() || undefined, preferences.length ? preferences : undefined);
    if (result.success) {
      window.location.href = "/";
    } else {
      setServerError(result.error ?? "something went wrong");
    }
  }

  function inputClass(hasError: boolean) {
    return `w-full bg-transparent border px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none transition-colors ${
      hasError ? "border-burgundy" : "border-ink/20 focus:border-burgundy"
    }`;
  }

  const topFields = [
    { id: "name",  label: "full name",    type: "text",  placeholder: "Jane Smith",       required: true },
    { id: "email", label: "email",        type: "email", placeholder: "jane@example.com", required: true },
    { id: "phone", label: "phone number", type: "tel",   placeholder: "04XX XXX XXX",     required: false },
  ] as const;

  const bottomFields = [
    { id: "password", label: "password",         type: "password", placeholder: "min. 8 characters", required: true },
    { id: "confirm",  label: "confirm password", type: "password", placeholder: "••••••••",          required: true },
  ] as const;

  return (
    <div className="w-full max-w-md border border-ink/10 p-10">
      <h1 className="font-playfair text-4xl text-ink mb-2">create an account.</h1>
      <p className="font-inter text-sm text-ink/50 mb-10">
        join crave. to start ordering.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {topFields.map(({ id, label, type, placeholder, required }) => (
          <div key={id}>
            <label htmlFor={id} className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
              {label}{required ? <Required /> : <span className="font-inter text-ink/30 ml-1 normal-case tracking-normal">(optional)</span>}
            </label>
            <input
              id={id} type={type} value={fields[id]}
              onChange={(e) => update(id, e.target.value)}
              placeholder={placeholder}
              className={inputClass(!!errors[id])}
            />
            {errors[id] && <p className="font-inter text-xs text-burgundy mt-1">{errors[id]}</p>}
          </div>
        ))}

        <div>
          <p className="font-inter text-xs tracking-widest uppercase text-ink/50 mb-3">
            i love <span className="normal-case tracking-normal">(optional)</span>
          </p>
          <PreferencePicker selected={preferences} onChange={setPreferences} />
        </div>

        {bottomFields.map(({ id, label, type, placeholder, required }) => (
          <div key={id}>
            <label htmlFor={id} className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
              {label}{required ? <Required /> : <span className="font-inter text-ink/30 ml-1 normal-case tracking-normal">(optional)</span>}
            </label>
            <input
              id={id} type={type} value={fields[id]}
              onChange={(e) => update(id, e.target.value)}
              placeholder={placeholder}
              className={inputClass(!!errors[id])}
            />
            {errors[id] && <p className="font-inter text-xs text-burgundy mt-1">{errors[id]}</p>}
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
