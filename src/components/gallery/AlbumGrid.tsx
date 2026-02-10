import { motion } from "framer-motion";
import { FolderOpen, ImageIcon } from "lucide-react";
import type { Album } from "@/lib/gallery-api";

interface AlbumGridProps {
  albums: Album[];
  onSelect: (album: string) => void;
}

const AlbumGrid = ({ albums, onSelect }: AlbumGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album, i) => (
        <motion.button
          key={album.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(album.name)}
          className="group relative aspect-square rounded-lg bg-card border border-border overflow-hidden hover:border-primary/50 transition-all"
        >
          {album.thumbnail ? (
            <img
              src={album.thumbnail}
              alt={album.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <FolderOpen className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-display font-semibold text-sm text-foreground truncate">
              {album.name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <ImageIcon className="w-3 h-3" />
              {album.count} photos
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default AlbumGrid;
