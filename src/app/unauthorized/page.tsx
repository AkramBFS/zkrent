import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[#EDECE4]">
      <div className="w-full max-w-md bg-[#F6F5F0] rounded-2xl border border-[#14213D]/15 p-8 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#14213D]">
          Access Denied
        </h1>
        <p className="text-sm text-[#4B5A79]">
          You do not have permission to access this page. This area is restricted to a different account role.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="w-full py-3 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-bold text-xs font-mono transition-colors shadow text-center"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="w-full py-3 rounded-lg bg-[#AE8B3F] hover:bg-[#977732] text-white font-bold text-xs font-mono transition-colors shadow text-center"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
