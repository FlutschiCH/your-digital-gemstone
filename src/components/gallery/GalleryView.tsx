import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Home, Loader2, ImageOff } from "lucide-react";
import { fetchAlbums, fetchImages } from "@/lib/gallery-api";
import type { GalleryImage } from "@/lib/gallery-api";
import AlbumGrid from "./AlbumGrid";
import ImageGrid from "./ImageGrid";
import Lightbox from "./Lightbox";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";

const GalleryView = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [titleClickCount, setTitleClickCount] = useState(0);

  const albumsQuery = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: fetchAlbums,
  });

  const imagesQuery = useQuery({
    queryKey: ["gallery-images", currentFolder],
    queryFn: () => fetchImages(currentFolder!),
    enabled: !!currentFolder,
  });

  const handleTitleDoubleClick = useCallback(() => {
    if (!adminToken) {
      setLoginOpen(true);
    }
  }, [adminToken]);

  const handleRefresh = useCallback(() => {
    if (currentFolder) {
      imagesQuery.refetch();
    } else {
      albumsQuery.refetch();
    }
  }, [currentFolder, imagesQuery, albumsQuery]);

  const isLoading = currentFolder ? imagesQuery.isLoading : albumsQuery.isLoading;
  const isError = currentFolder ? imagesQuery.isError : albumsQuery.isError;

  return (
    <section className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="font-display text-3xl md:text-4xl font-bold text-foreground cursor-default select-none"
            onDoubleClick={handleTitleDoubleClick}
          >
            Galleries
          </h1>
          <div className="line-accent mt-3 w-24" />
        </motion.div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => setCurrentFolder(null)}
            className={`flex items-center gap-1 transition-colors ${
              currentFolder
                ? "text-muted-foreground hover:text-foreground"
                : "text-foreground font-medium"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Galleries
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">{currentFolder}</span>
            </>
          )}
        </nav>

        {/* Admin Panel */}
        {adminToken && (
          <AdminPanel
            currentFolder={currentFolder}
            token={adminToken}
            onLogout={() => setAdminToken(null)}
            onRefresh={handleRefresh}
          />
        )}

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <ImageOff className="w-12 h-12" />
            <p className="font-display">Failed to load gallery</p>
            <p className="text-sm">
              Make sure <code className="bg-card px-2 py-0.5 rounded text-xs">api.php</code> is deployed on your server.
            </p>
          </div>
        )}

        {!isLoading && !isError && !currentFolder && albumsQuery.data && (
          <AlbumGrid
            albums={albumsQuery.data}
            onSelect={(name) => setCurrentFolder(name)}
          />
        )}

        {!isLoading && !isError && currentFolder && imagesQuery.data && (
          <ImageGrid
            images={imagesQuery.data}
            onSelect={(i) => setLightboxIndex(i)}
          />
        )}

        {/* Empty state */}
        {!isLoading &&
          !isError &&
          ((currentFolder && imagesQuery.data?.length === 0) ||
            (!currentFolder && albumsQuery.data?.length === 0)) && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
              <ImageOff className="w-10 h-10" />
              <p className="font-display">
                {currentFolder ? "No images in this album" : "No albums yet"}
              </p>
            </div>
          )}

        {/* Lightbox */}
        {lightboxIndex !== null && imagesQuery.data && (
          <Lightbox
            images={imagesQuery.data}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        {/* Admin Login Dialog */}
        <AdminLogin
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLogin={setAdminToken}
        />
      </div>
    </section>
  );
};

export default GalleryView;
