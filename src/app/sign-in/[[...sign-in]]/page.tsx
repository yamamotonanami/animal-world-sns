import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 装飾的な背景 */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-sage/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-mustard/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="self-start flex items-center gap-2 text-sage font-bold text-sm hover:opacity-70 transition-all">
              <ArrowLeft size={18} />
              <span>もどる</span>
            </Link>
            <div className="text-center space-y-2">
              <div className="text-4xl">🏠</div>
              <h1 className="text-2xl font-black text-sage tracking-tighter">すみかに入る</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sign In to Habitat</p>
            </div>
          </div>

          <div className="w-full flex justify-center">
        <SignIn 
          fallbackRedirectUrl="/diagnosis"
          forceRedirectUrl="/diagnosis"
          appearance={{
            elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none border-none bg-transparent p-0 w-full",
                  header: "hidden",
                  footer: "mt-4",
                  main: "w-full",
                  formFieldInput: "w-full",
                  formButtonPrimary: "w-full",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
