"use client";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-8">
      <div className="bg-cream border border-ink/10 p-10 w-full max-w-sm">
        <h2 className="font-playfair text-3xl text-ink mb-2">confirm logout.</h2>
        <p className="font-inter text-sm text-ink/50 mb-10">
          are you sure you want to log out?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 border border-ink/20 text-ink/50 py-3 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-burgundy text-cream py-3 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
}
