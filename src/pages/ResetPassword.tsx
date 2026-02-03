import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage("Error updating password");
    else setMessage("Password updated successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 w-80">
        <h2 className="text-xl font-bold text-center">Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          Update Password
        </button>
        {message && <p className="text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}
