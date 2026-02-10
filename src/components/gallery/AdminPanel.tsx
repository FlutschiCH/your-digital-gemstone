import { useState, useRef } from "react";
import { Upload, FolderPlus, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImages, createAlbum } from "@/lib/gallery-api";
import { toast } from "@/hooks/use-toast";

interface AdminPanelProps {
  currentFolder: string | null;
  token: string;
  onLogout: () => void;
  onRefresh: () => void;
}

const AdminPanel = ({ currentFolder, token, onLogout, onRefresh }: AdminPanelProps) => {
  const [newAlbumName, setNewAlbumName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !currentFolder) return;

    setUploading(true);
    try {
      const result = await uploadImages(currentFolder, files, token);
      toast({ title: "Upload complete", description: result.message });
      onRefresh();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateAlbum = async () => {
    const name = newAlbumName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const result = await createAlbum(name, token);
      toast({ title: "Album created", description: result.message });
      setNewAlbumName("");
      onRefresh();
    } catch {
      toast({ title: "Failed to create album", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-card border border-primary/30 mb-6">
      <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">
        Admin
      </span>

      {currentFolder && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading…" : "Upload Images"}
          </Button>
        </>
      )}

      {!currentFolder && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="New album name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateAlbum()}
            className="h-9 w-48"
          />
          <Button size="sm" onClick={handleCreateAlbum} disabled={creating}>
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}
            Create
          </Button>
        </div>
      )}

      <Button size="sm" variant="ghost" onClick={onLogout} className="ml-auto">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
};

export default AdminPanel;
