"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-5xl mb-6 block">🍃</span>
          <h1 className="text-4xl font-bold mb-4">
            About <span className="text-gradient">This Project</span>
          </h1>
          <p className="text-foreground/40 max-w-lg mx-auto">
            An Advanced Machine Learning project for predicting Sri Lanka&apos;s tea production
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Project Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold mb-4 text-gradient">Project Overview</h2>
            <p className="text-foreground/60 leading-relaxed">
              This system predicts Sri Lanka&apos;s tea production using a hybrid approach combining 
              SARIMAX time-series forecasting with CatBoost gradient boosting. The model accounts for 
              climate variables (rainfall, humidity, air temperature) across 3 elevation zones and 
              7 tea types, generating 21 unique production forecasts.
            </p>
          </motion.div>

          {/* Methodology */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold mb-4 text-gradient">Methodology</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-green mb-2">
                  Total Forecast — SARIMAX
                </h3>
                <p className="text-foreground/50 text-sm leading-relaxed">
                  Seasonal ARIMA with exogenous variables predicts total tea production using 
                  rainfall, humidity, and temperature as climate inputs.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-green mb-2">
                  Share Weights — CatBoost
                </h3>
                <p className="text-foreground/50 text-sm leading-relaxed">
                  CatBoost regressor generates production share weights for each elevation × tea type 
                  combination, with structural zero enforcement for invalid combos.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold mb-4 text-gradient">Tech Stack</h2>
            <div className="flex flex-wrap gap-3">
              {["Next.js", "Tailwind CSS", "Leaflet", "Framer Motion", "AG Grid", "Recharts", "FastAPI", "SARIMAX", "CatBoost"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-xl text-sm font-medium glass"
                  style={{ borderColor: "rgba(34, 197, 94, 0.2)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
