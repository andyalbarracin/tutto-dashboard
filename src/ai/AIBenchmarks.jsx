import React from "react";

const INDUSTRIES = [
  {
    label: "Telecom",
    value: "Telecom",
    benchmarks: { engagement: "2-5%", views: "1k+/post", followers: "2k-10k+" }
  },
  {
    label: "SaaS (Software)",
    value: "SaaS",
    benchmarks: { engagement: "3-6%", views: "800+/post", followers: "3k-15k+" }
  },
  {
    label: "Ecommerce",
    value: "Ecommerce",
    benchmarks: { engagement: "4-7%", views: "2k+/post", followers: "5k-30k+" }
  },
  {
    label: "Professional Services",
    value: "ProServ",
    benchmarks: { engagement: "2-4%", views: "500+/post", followers: "1k-8k+" }
  },
  {
    label: "Education",
    value: "Edu",
    benchmarks: { engagement: "2-6%", views: "700+/post", followers: "2k-20k+" }
  },
  {
    label: "Healthcare",
    value: "Health",
    benchmarks: { engagement: "1-3%", views: "1k+/post", followers: "2k-10k+" }
  },
  {
    label: "Marketing/Advertising",
    value: "Marketing",
    benchmarks: { engagement: "4-8%", views: "1k+/post", followers: "3k-25k+" }
  },
  {
    label: "Manufacturing",
    value: "Manufacturing",
    benchmarks: { engagement: "1.5-3.5%", views: "800+/post", followers: "2k-15k+" }
  },
  {
    label: "Nonprofit",
    value: "Nonprofit",
    benchmarks: { engagement: "2-7%", views: "500+/post", followers: "500-6k+" }
  },
  {
    label: "Hospitality",
    value: "Hospitality",
    benchmarks: { engagement: "3-6%", views: "900+/post", followers: "1k-10k+" }
  },
  {
    label: "Government/Public Sector",
    value: "Gov",
    benchmarks: { engagement: "1-2.5%", views: "400+/post", followers: "2k-10k+" }
  },
  {
    label: "Real Estate",
    value: "RealEstate",
    benchmarks: { engagement: "2-4%", views: "800+/post", followers: "1k-12k+" }
  }
];

export default function AIBenchmarks({ industry, setIndustry, theme = "dark" }) {
  const selected = INDUSTRIES.find(i => i.value === industry) || INDUSTRIES[0];
  return (
    <div className={`p-5 rounded-xl min-w-[260px] shadow
      ${theme === "dark"
        ? "bg-[#232744] text-white"
        : "bg-[#8eb69b] text-black"}`}>
      <label className="block mb-2 font-bold">Industry</label>
      <select
        value={industry}
        onChange={e => setIndustry(e.target.value)}
        className={`rounded px-2 py-1 w-full mb-3
          ${theme === "dark"
            ? "bg-[#2a2f50] text-white"
            : "bg-white text-black border border-[#8eb69b]"}`}>
        {INDUSTRIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div>
        <div className={`text-sm ${theme === "dark" ? "text-teal-300" : "text-[#004643]"}`}>Benchmarks:</div>
        <div className="text-xs mb-1">Engagement Rate: <span className="font-semibold">{selected.benchmarks.engagement}</span></div>
        <div className="text-xs mb-1">Views per post: <span className="font-semibold">{selected.benchmarks.views}</span></div>
        <div className="text-xs">Followers (LinkedIn): <span className="font-semibold">{selected.benchmarks.followers}</span></div>
      </div>
    </div>
  );
}
