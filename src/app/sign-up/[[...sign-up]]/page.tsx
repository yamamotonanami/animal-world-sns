import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-sage-600 mb-6 font-maru">住人登録</h1>
      <SignUp />
    </div>
  );
}
