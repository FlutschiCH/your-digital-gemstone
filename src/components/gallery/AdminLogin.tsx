import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (token: string) => void;
}

const AdminLogin = ({ open, onOpenChange, onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    // Simple token = the password itself; the PHP backend validates it
    // In production, you'd do a proper auth endpoint
    try {
      const res = await fetch("/gallery/api.php?action=list_albums", {
        headers: { "X-Admin-Token": password },
      });
      if (res.ok) {
        onLogin(password);
        setPassword("");
        onOpenChange(false);
      } else {
        setError("Invalid password");
      }
    } catch {
      // If API is unreachable, still store token locally for later
      onLogin(password);
      setPassword("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Admin Login
          </DialogTitle>
          <DialogDescription>
            Enter the admin password to manage galleries.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
