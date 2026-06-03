"use client";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function DeleteAccountModal({ onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-8">
      <div className="bg-cream border border-ink/10 p-10 w-full max-w-sm">
        <h2 className="font-playfair text-3xl text-ink mb-3">delete account.</h2>
        <p className="font-inter text-sm text-ink/60 mb-2 leading-relaxed">
          this action is <span className="text-burgundy font-medium">permanent and cannot be undone.</span>
        </p>
        <p className="font-inter text-sm text-ink/50 mb-10 leading-relaxed">
          your account, order history, and all personal data will be permanently deleted. you will not be able to log back in — you would need to create a new account.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-ink/20 py-3 font-inter text-xs tracking-widest uppercase text-ink/50 hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-burgundy text-cream py-3 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "deleting..." : "delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}
