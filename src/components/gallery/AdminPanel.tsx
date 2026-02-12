import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FolderPlus,
  LogOut,
  Loader2,
  Trash2,
  ImagePlus,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  uploadImages,
  createAlbum,
  deleteAlbum,
  deleteImage,
  fetchImages,
} from "@/lib/gallery-api";
import type { Album, GalleryImage } from "@/lib/gallery-api";
import { toast } from "@/hooks/use-toast";

interface AdminPanelProps {
  albums: Album[];
  token: string;
  onLogout: () => void;
  onRefresh: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
}

const AdminPanel = ({ albums, token, onLogout, onRefresh }: AdminPanelProps) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  const [albumImages, setAlbumImages] = useState<GalleryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Load images when album changes
  const loadAlbumImages = useCallback(
    async (album: string) => {
      if (!album) {
        setAlbumImages([]);
        return;
      }
      setLoadingImages(true);
      try {
        const imgs = await fetchImages(album);
        setAlbumImages(imgs);
      } catch {
        setAlbumImages([]);
      } finally {
        setLoadingImages(false);
      }
    },
    []
  );

  const handleAlbumChange = (value: string) => {
    setSelectedAlbum(value);
    loadAlbumImages(value);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFiles = (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleUpload = async () => {
    if (!selectedAlbum || pendingFiles.length === 0) return;
    setUploading(true);

    setPendingFiles((prev) =>
      prev.map((f) => ({ ...f, status: "uploading" as const }))
    );

    try {
      const files = pendingFiles.map((f) => f.file);
      const result = await uploadImages(selectedAlbum, files, token);
      setPendingFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: result.success ? ("done" as const) : ("error" as const),
        }))
      );
      toast({ title: "Upload complete", description: result.message });

      // Clean up after a short delay
      setTimeout(() => {
        setPendingFiles((prev) => {
          prev.forEach((f) => URL.revokeObjectURL(f.preview));
          return [];
        });
      }, 1500);

      onRefresh();
      loadAlbumImages(selectedAlbum);
    } catch {
      setPendingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "error" as const }))
      );
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAlbum = async () => {
    const name = newAlbumName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createAlbum(name, token);
      toast({ title: "Album created", description: `"${name}" is ready` });
      setNewAlbumName("");
      onRefresh();
    } catch {
      toast({ title: "Failed to create album", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlbum = async (albumName: string) => {
    setDeletingAlbum(albumName);
    try {
      await deleteAlbum(albumName, token);
      toast({ title: "Album deleted" });
      if (selectedAlbum === albumName) {
        setSelectedAlbum("");
        setAlbumImages([]);
      }
      onRefresh();
    } catch {
      toast({ title: "Failed to delete album", variant: "destructive" });
    } finally {
      setDeletingAlbum(null);
    }
  };

  const handleDeleteImage = async (imageName: string) => {
    if (!selectedAlbum) return;
    setDeletingImage(imageName);
    try {
      await deleteImage(selectedAlbum, imageName, token);
      toast({ title: "Image deleted" });
      loadAlbumImages(selectedAlbum);
      onRefresh();
    } catch {
      toast({ title: "Failed to delete image", variant: "destructive" });
    } finally {
      setDeletingImage(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-card p-6 mb-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-primary" />
          Media Manager
        </h2>
        <Button size="sm" variant="ghost" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Create album */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Create New Album
        </label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Album name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateAlbum()}
            className="h-9 max-w-xs"
          />
          <Button size="sm" onClick={handleCreateAlbum} disabled={creating || !newAlbumName.trim()}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Create
          </Button>
        </div>
      </div>

      {/* Album selector + delete */}
      {albums.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Album
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedAlbum} onValueChange={handleAlbumChange}>
              <SelectTrigger className="w-60 h-9">
                <SelectValue placeholder="Choose an album…" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5" />
                      {a.name} ({a.count})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAlbum && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteAlbum(selectedAlbum)}
                disabled={deletingAlbum === selectedAlbum}
              >
                {deletingAlbum === selectedAlbum ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Album
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Drop zone */}
      {selectedAlbum && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Upload Images to "{selectedAlbum}"
          </label>
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all ${
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <Upload className={`w-10 h-10 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {dragging ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse • JPG, PNG, GIF, WebP, SVG
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Pending files preview */}
          <AnimatePresence>
            {pendingFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {pendingFiles.length} file{pendingFiles.length !== 1 && "s"} selected
                  </p>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading…" : "Upload All"}
                  </Button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {pendingFiles.map((uf, i) => (
                    <motion.div
                      key={uf.preview}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group aspect-square rounded-md overflow-hidden bg-muted"
                    >
                      <img
                        src={uf.preview}
                        alt={uf.file.name}
                        className="w-full h-full object-cover"
                      />
                      {uf.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {uf.status === "uploading" && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                      {uf.status === "done" && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                      {uf.status === "error" && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Album images list */}
      {selectedAlbum && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Images in "{selectedAlbum}"
          </label>
          {loadingImages ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : albumImages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No images yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {albumImages.map((img) => (
                <div
                  key={img.name}
                  className="relative group aspect-square rounded-md overflow-hidden bg-muted"
                >
                  <img
                    src={img.thumbnail}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{img.name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteImage(img.name)}
                    disabled={deletingImage === img.name}
                    className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingImage === img.name ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
