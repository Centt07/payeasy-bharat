import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setMessage("Error sending reset link");
    else setMessage("Password reset link sent to your email!");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleReset} className="flex flex-col gap-4 w-80">
        <h2 className="text-xl font-bold text-center">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Send Reset Link
        </button>
        {message && <p className="text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}
