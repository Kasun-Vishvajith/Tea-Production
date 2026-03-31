"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { fetchData } from "@/lib/api";

export default function EDA() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData({ limit: 50 }).then((res) => {
      const arr = Array.isArray(res) ? res : (res.data || []);
      const aggregated = arr.reduce((acc: any, curr: any) => {
        const year = curr.year;
        if (!acc[year]) acc[year] = { year, production: 0, count: 0 };
        acc[year].production += curr.production_volume;
        acc[year].count += 1;
        return acc;
      }, {});
      
      const chartData = Object.values(aggregated)
        .map((d: any) => ({
          year: d.year,
          production: Math.floor(d.production / d.count)
        }))
        .sort((a: any, b: any) => a.year - b.year);
      
      setData(chartData);
    });
  }, []);

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="apple-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Exploratory Data Analysis
          </h1>
          <p className="text-secondary max-w-xl">
            Historical production insights derived from multi-decadal records across Sri Lanka's primary cultivation districts.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="premium-card p-10"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Average Production Intensity (Yearly)</h2>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-accent" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Yield Volume</span>
            </div>
          </div>
          
          <div className="w-full h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="year" 
                  stroke="#86868b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#86868b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.05)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: '#2d5a27', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#2d5a27" 
                  strokeWidth={4}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: '#2d5a27', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
