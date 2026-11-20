// Public company details from trustcode-system-website at 494b6a305853261bd01f53b32bca1545c6511538.
// Sources: src/content/site.ts, src/content/team.ts, and src/content/services.ts.
export const company = {
  name: "TrustCode System Limited",
  website: "https://trustcodesystem.tech",
  email: "hello@trustcodesystem.tech",
  phone: "+2349134062773",
  location: "Lagos, Nigeria",
  locationStatement: "Based in Lagos, Nigeria. Working remotely worldwide.",
  founded: 2026,
  description: "TrustCode System builds websites, online stores and apps, keeps systems running and protects customer data.",
  services: [
    { slug: "product-web-engineering", name: "Business websites & apps" },
    { slug: "ecommerce-development", name: "Online stores" },
    { slug: "cloud-devops", name: "Hosting & cloud operations" },
    { slug: "ai-integration", name: "AI tools & automation" },
    { slug: "cybersecurity-soc", name: "Security & data protection" },
    { slug: "it-support-managed", name: "Maintenance & support" },
    { slug: "training-mentorship", name: "Training & mentorship" },
  ],
} as const;

export const companyTeam = [
  {
    slug: "bashir-abdulah",
    name: "Bashir Abdulah",
    title: "Frontend & Product Engineering Lead",
    location: "London, UK",
    image: "/company/team/bashir-abdulah.webp",
    github: "https://github.com/Bash-Abdul",
    linkedin: "https://linkedin.com/in/bashir-abdulah",
  },
  {
    slug: "abdulhaleem-sanuth",
    name: "Abdulhaleem Sanuth",
    title: "Cloud & Backend Engineering Lead",
    location: "Lagos, Nigeria",
    image: "/company/team/abdulhaleem-sanuth.webp",
    github: "https://github.com/Abdulhaleem-6",
    linkedin: "https://linkedin.com/in/abdulhaleem-sanuth",
  },
  {
    slug: "olamilekan-oyedele",
    name: "Olamilekan Emmanuel Oyedele",
    title: "Security & SOC Lead",
    location: "Lagos, Nigeria",
    image: "/company/team/olamilekan-oyedele.webp",
    github: "https://github.com/Interleks",
    linkedin: "https://linkedin.com/in/interleks",
  },
  {
    slug: "abass-ibrahim",
    name: "Abass Ibrahim",
    title: "Full-Stack Delivery & Design Lead",
    location: "Lagos, Nigeria",
    image: "/company/team/abass-ibrahim.webp",
    github: "https://github.com/Lingz450",
    linkedin: "https://linkedin.com/in/abass-ibrahim-devv",
  },
] as const;
