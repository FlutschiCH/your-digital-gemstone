import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryView from "@/components/gallery/GalleryView";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <GalleryView />
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
