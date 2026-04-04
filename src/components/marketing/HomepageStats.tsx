"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Stores tracked" },
  { value: "2.5M+", label: "Products monitored" },
  { value: "500K+", label: "Alerts sent" },
  { value: "99.9%", label: "Uptime" },
];

export function HomepageStats() {
  return (
    <section className="border-y border-border/60 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="text-center"
            >
              <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
