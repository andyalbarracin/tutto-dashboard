import React from "react";

const industrySummaries = {
  Telecom: "Telecom companies rely on strong digital presence to reach B2B and B2C audiences. Engagement, content regularity, and technical expertise shared online are key to maintaining reputation and driving business growth.",
  SaaS: "SaaS companies leverage content marketing and thought leadership to stand out in a crowded market. Success is measured by consistent content output, high engagement rates, and growing a professional audience.",
  Ecommerce: "Ecommerce brands focus on visual storytelling, product launches, and high-frequency content to drive sales and brand loyalty.",
  ProServ: "Professional service companies succeed on LinkedIn by showcasing client success stories, sharing insights, and highlighting industry expertise. Thought leadership is key.",
  Edu: "Education sector brands prioritize informative content, community building, and consistent interaction with students and professionals.",
  Health: "Healthcare brands use social media for education and trust-building, focusing on factual content and compliance.",
  Marketing: "Marketing and advertising companies focus on creativity, campaign results, and social proof. Engaging posts, client wins, and team highlights drive engagement.",
  Manufacturing: "Manufacturers build trust by sharing behind-the-scenes content, innovation, and reliability. Regular updates help maintain B2B relationships.",
  Nonprofit: "Nonprofits use storytelling, transparency, and real impact examples to drive awareness and engagement with their cause.",
  Hospitality: "Hospitality brands leverage social media for guest engagement, event promotion, and showcasing positive experiences.",
  Gov: "Government agencies use platforms for official announcements, citizen engagement, and education.",
  RealEstate: "Real estate brands share property showcases, market trends, and client stories to build reputation and generate leads.",
  Finance: "Finance brands aim for trust and authority, sharing expertise and updates. Top performers post thought leadership content and industry insights.",
};

export default function AISummary({ data, industry, theme = "dark" }) {
  return (
    <div className={`w-full rounded-xl shadow p-5
      ${theme === "dark" ? "bg-[#232744] text-white" : "bg-[#8eb69b] text-black"}`}>
      <div className="mb-3">
        <h3 className={`font-bold text-lg ${theme === "dark" ? "text-teal-300" : "text-[#2000B1]"}`}>Executive Summary</h3>
        <div className={`text-sm ${theme === "dark" ? "text-white" : "text-[#004643]"}`}>{industrySummaries[industry] || "No summary available for this industry."}</div>
      </div>
      <div className="mb-3">
        <h4 className={`font-bold text-base mt-4 ${theme === "dark" ? "text-purple-400" : "text-[#2000B1]"}`}>AI Executive Summary</h4>
        <div className={`text-sm italic ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>[This is where your AI insights will appear for industry: {industry}]</div>
      </div>
    </div>
  );
}
