import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mailto fallback
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.open(`mailto:hello@flutschi.ch?subject=${subject}&body=${body}`);
  };

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
            Contact
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6">
            Let's work together
          </h2>
          <div className="line-accent max-w-xs" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <p className="text-muted-foreground text-lg leading-relaxed">
              Have a project in mind or just want to say hello? I'd love to hear
              from you. Drop me a message and I'll get back to you as soon as
              possible.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Mail size={18} />
                </div>
                <span>hello@flutschi.ch</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <span>Switzerland</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-5"
          >
            <div>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:opacity-90 transition-all glow-sm hover:glow-md"
            >
              Send Message
              <Send size={16} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
