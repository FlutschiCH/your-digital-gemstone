const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Flutschi. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
