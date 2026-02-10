import { motion } from "framer-motion";
import type { GalleryImage } from "@/lib/gallery-api";

interface ImageGridProps {
  images: GalleryImage[];
  onSelect: (index: number) => void;
}

const ImageGrid = ({ images, onSelect }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((img, i) => (
        <motion.button
          key={img.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(i)}
          className="relative aspect-square rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all group"
        >
          <img
            src={img.thumbnail}
            alt={img.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </motion.button>
      ))}
    </div>
  );
};

export default ImageGrid;
