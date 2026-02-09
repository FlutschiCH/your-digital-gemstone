import { motion } from "framer-motion";
import { Code2, Palette, Zap } from "lucide-react";

const skills = [
  {
    icon: Code2,
    title: "Development",
    description:
      "Building fast, accessible, and scalable web applications with modern technologies.",
  },
  {
    icon: Palette,
    title: "Design",
    description:
      "Creating thoughtful interfaces that are as beautiful as they are functional.",
  },
  {
    icon: Zap,
    title: "Performance",
    description:
      "Optimising every detail to deliver lightning-fast user experiences.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-32 px-6">
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
            About
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6">
            A little bit about me
          </h2>
          <div className="line-accent max-w-xs" />
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              I'm a passionate creator who loves turning ideas into reality. With a keen eye for detail and a love for clean code, I build digital products that make an impact.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              When I'm not coding, you can find me exploring new technologies, contributing to open source, or enjoying nature. I believe in continuous learning and pushing creative boundaries.
            </p>
          </motion.div>

          {/* Skills */}
          <div className="space-y-6">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                viewport={{ once: true, margin: "-100px" }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:glow-sm transition-all">
                    <skill.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">
                      {skill.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
