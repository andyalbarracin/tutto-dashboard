import React from "react";
import { X, ExternalLink, TrendingUp, MessageCircle, ThumbsUp, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Devuelve una frase motivadora según el benchmark y valores
function getMotivation({ post }) {
  // 1. Si viene una frase explícita (Calendar/KPIAlerts), úsala:
  if (post.message) return post.message;

  // 2. Si tenemos benchmark y value (y tipo de métrica):
  const val = typeof post.engagements === "number" ? post.engagements
    : typeof post.value === "number" ? post.value
    : undefined;

  if (
    typeof val === "number" &&
    post.benchmark &&
    typeof post.benchmark.engagements === "number"
  ) {
    if (val === 0)
      return "You posted, but got no engagements — try posting at a different time or using a new format!";
    if (val > post.benchmark.engagements)
      return "Your post performed well and beat the industry benchmark for engagements! 🚀";
    if (val === post.benchmark.engagements)
      return "Matched the industry benchmark for engagements! Solid performance.";
    if (val > 0 && val < post.benchmark.engagements)
      return "Decent, but you didn't reach the industry benchmark. Try a new CTA or format.";
  }

  // 3. Otras métricas (likes, views, clicks...)
  if (
    typeof val === "number" &&
    post.benchmark &&
    (typeof post.benchmark.views === "number" ||
      typeof post.benchmark.likes === "number")
  ) {
    // Por ejemplo para likes:
    if (
      typeof post.likes === "number" &&
      typeof post.benchmark.likes === "number"
    ) {
      if (post.likes === 0)
        return "You got no likes. Try changing the post content or posting time.";
      if (post.likes > post.benchmark.likes)
        return "Your post got more likes than the industry benchmark! 🔥";
      if (post.likes === post.benchmark.likes)
        return "Matched the industry benchmark for likes! Solid!";
      if (post.likes > 0 && post.likes < post.benchmark.likes)
        return "Not bad, but you can get more likes! Test a new angle or CTA.";
    }
  }

  // 4. Fallback
  return "";
}

export default function PostDrilldown({ open, post, onClose, theme = "dark" }) {
  if (!open || !post) return null;
  const message = getMotivation({ post });

  return (
    <AnimatePresence>
      <motion.div
        key="drilldown-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex"
        onClick={onClose}
      >
        <motion.div
          key="drilldown-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`
            w-full max-w-lg h-full bg-white dark:bg-[#171B2C] shadow-2xl
            rounded-l-2xl flex flex-col p-8 overflow-y-auto relative
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-6 text-gray-400 hover:text-red-500 z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            {post.platform === "LinkedIn" && <BarChart3 size={22} className="text-[#0A66C2]" />}
            {post.platform === "X" && <BarChart3 size={22} className="text-black dark:text-white" />}
            <span className="font-semibold uppercase text-xs tracking-wide opacity-60">
              {post.platform} • {post.date}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3">{post.title || "Untitled Post"}</h2>

          {/* Motivational message */}
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-blue-100 dark:bg-[#232744] text-blue-900 dark:text-blue-200">
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Content (image + text) */}
          {post.image && (
            <img
              src={post.image}
              alt="Post visual"
              className="w-full max-h-44 object-cover rounded-xl mb-4 border"
            />
          )}
          <p className="mb-5 text-base whitespace-pre-line opacity-90">
            {post.content || "(No content available)"}
          </p>
          {/* Link */}
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:underline mb-3"
            >
              <ExternalLink size={18} />
              View original post
            </a>
          )}

          {/* Main metrics (chips) */}
          <div className="flex flex-wrap gap-4 my-5">
            <MetricChip
              icon={<TrendingUp size={20} />}
              value={post.views}
              label="Impressions"
              highlight
              theme={theme}
            />
            <MetricChip
              icon={<ThumbsUp size={20} />}
              value={post.likes}
              label="Likes"
              theme={theme}
            />
            <MetricChip
              icon={<MessageCircle size={20} />}
              value={post.comments}
              label="Comments"
              theme={theme}
            />
            <MetricChip
              icon={<BarChart3 size={20} />}
              value={post.shares}
              label="Shares"
              theme={theme}
            />
            <MetricChip
              icon={<TrendingUp size={20} />}
              value={post.engagements}
              label="Engagements"
              theme={theme}
            />
            {typeof post.clicks === "number" && (
              <MetricChip
                icon={<TrendingUp size={20} />}
                value={post.clicks}
                label="Clicks"
                theme={theme}
              />
            )}
          </div>

          {/* Benchmarks */}
          {post.benchmark && (
            <div className="mt-2 mb-6 p-3 rounded-xl bg-blue-100 dark:bg-[#232744] text-blue-900 dark:text-blue-200">
              <span className="font-semibold">Benchmarks:</span>{" "}
              <span className="ml-2 text-sm">
                {typeof post.benchmark.views !== "undefined" && <>Views: <b>{post.benchmark.views}</b> • </>}
                {typeof post.benchmark.likes !== "undefined" && <>Likes: <b>{post.benchmark.likes}</b></>}
                {typeof post.benchmark.engagements !== "undefined" && <>Engagements: <b>{post.benchmark.engagements}</b></>}
              </span>
            </div>
          )}

          {/* AI Insights */}
          {post.extra?.aiInsight && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300">
              <b>AI Insight:</b> {post.extra.aiInsight}
            </div>
          )}

          {/* Top comments */}
          {post.extra?.topComments && post.extra.topComments.length > 0 && (
            <div className="mb-6">
              <div className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-300">Top Comments:</div>
              <ul className="list-disc pl-5">
                {post.extra.topComments.map((c, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{c.user}: </span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evolution chart or other extra features here (TODO) */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper component for metric chips
function MetricChip({ icon, value, label, highlight, theme }) {
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-xl shadow text-sm font-semibold
      ${highlight
        ? (theme === "dark" ? "bg-[#f1c40f]/80 text-black" : "bg-[#f7e9a8] text-[#111]")
        : (theme === "dark" ? "bg-[#232744] text-white" : "bg-[#e4e9ef] text-[#151419]")}
      min-w-[100px]
    `}>
      <span className="text-lg">{icon}</span>
      <span className="text-base font-bold">{value ?? 0}</span>
      <span className="text-xs ml-1 opacity-70">{label}</span>
    </div>
  );
}
