import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[#E5E0D8]">
      <div className="w-full max-w-md bg-[#FAFAFA] rounded-2xl border border-[#E5E0D8] p-8 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#231F20]">
          Access Denied
        </h1>
        <p className="text-sm text-[#3D3531]">
          You do not have permission to access this page. This area is restricted to a different account role.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="w-full py-3 rounded-lg bg-[#00A8E8] hover:bg-[#0277BD] text-white font-bold text-xs font-mono transition-colors shadow text-center"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="w-full py-3 rounded-lg bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-xs font-mono transition-colors shadow text-center"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
