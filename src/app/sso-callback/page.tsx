"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/diagnosis"
        signUpForceRedirectUrl="/diagnosis"
      />
    </div>
  );
}