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

const ADMIN_PASSWORD = "Godzilla_12";

interface AdminLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (token: string) => void;
}

const AdminLogin = ({ open, onOpenChange, onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    if (password === ADMIN_PASSWORD) {
      onLogin(password);
      setPassword("");
      setError("");
      onOpenChange(false);
    } else {
      setError("Invalid password");
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
          <Button type="submit">Login</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
