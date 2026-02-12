import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Home, Loader2, ImageOff, KeyRound, ServerOff } from "lucide-react";
import { fetchAlbums, fetchImages, NonJsonResponseError } from "@/lib/gallery-api";
import type { GalleryImage } from "@/lib/gallery-api";
import AlbumGrid from "./AlbumGrid";
import ImageGrid from "./ImageGrid";
import Lightbox from "./Lightbox";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";
import { Button } from "@/components/ui/button";

const GalleryView = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const albumsQuery = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: fetchAlbums,
    retry: false,
  });

  const imagesQuery = useQuery({
    queryKey: ["gallery-images", currentFolder],
    queryFn: () => fetchImages(currentFolder!),
    enabled: !!currentFolder,
    retry: false,
  });

  const handleRefresh = useCallback(() => {
    if (currentFolder) {
      imagesQuery.refetch();
    } else {
      albumsQuery.refetch();
    }
  }, [currentFolder, imagesQuery, albumsQuery]);

  const isLoading = currentFolder ? imagesQuery.isLoading : albumsQuery.isLoading;
  const isError = currentFolder ? imagesQuery.isError : albumsQuery.isError;
  const error = currentFolder ? imagesQuery.error : albumsQuery.error;
  const isPhpError = error instanceof NonJsonResponseError;

  return (
    <section className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Galleries
            </h1>
            <div className="line-accent mt-3 w-24" />
          </div>
          {!adminToken && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLoginOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Admin login"
            >
              <KeyRound className="w-5 h-5" />
            </Button>
          )}
        </motion.div>

        {/* Admin Panel */}
        {adminToken && (
          <AdminPanel
            albums={albumsQuery.data || []}
            token={adminToken}
            onLogout={() => setAdminToken(null)}
            onRefresh={handleRefresh}
          />
        )}

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

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && isPhpError && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <ServerOff className="w-12 h-12" />
            <p className="font-display text-lg">PHP Server Required</p>
            <p className="text-sm text-center max-w-md">
              The gallery needs a PHP server to work. Deploy to your server (e.g. flutschi.ch) to see your albums. 
              In the meantime, you can use the admin panel to prepare uploads.
            </p>
          </div>
        )}

        {isError && !isPhpError && (
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
