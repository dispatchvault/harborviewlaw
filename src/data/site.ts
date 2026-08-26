// Shared firm facts, extracted from the live Webflow site (Aug 2026).
// The live site showed "+1 (949) 971-7764" on the contact page and
// "+1 (949) 791-7764" everywhere else (footer, home FAQ, Jim's profile);
// 791 is treated as canonical — confirm with the client.

export const SITE_NAME = "Harborview Law";
export const LEGAL_NAME = "Harbor View Law, P.C.";
export const PHONE = "+1 (949) 791-7764";
export const PHONE_HREF = "tel:+19497917764";
export const EMAIL = "info@harborviewlaw.com";
export const ADDRESS_LINES = ["23 Corporate Plaza Drive", "Suite 150", "Newport Beach, CA 92660"];

export const PRACTICE_LINKS = [
  { slug: "general-counsel-services", label: "General Counsel Services" },
  { slug: "corporate-law", label: "Corporate Law" },
  { slug: "commercial-contracts-transactions", label: "Commercial Contracts & Transactions" },
  { slug: "real-estate-law", label: "Real Estate Law" },
  { slug: "telecommunications", label: "Telecommunications" },
  { slug: "legal-consultation", label: "Legal Consultation" },
];

export const NEWS_CATEGORIES: Record<string, string> = {
  "general-counsel-news": "General Counsel News",
  "real-estate": "Real Estate",
  "telecommunications": "Telecommunications",
  "corporate-law": "Corporate Law",
  "commercial-contracts-and-transactions": "Commercial Contracts & Transactions",
};

export type Testimonial = { text: string; name: string; role: string; photo?: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Our mid-sized marketing and web design firm needed legal support to navigate client contracts, intellectual property concerns, and employment agreements. Jim at Harborview Law has been an incredible asset to our business. They provided us with clear, customized solutions that protected our interests while maintaining strong client relationships. If you're looking for outside general counsel who truly understands the challenges of running a creative business, Jim is the one to call!",
    name: "Jim Zaslaw",
    role: "CEO, Zinc Solutions",
    photo: "/images/Jim-Z-web-picture.png",
  },
  {
    text: "As a property manager overseeing multiple units, legal issues are an inevitable part of the job. Working with Harborview Law has been a game-changer for my team. Whether it's drafting and reviewing lease agreements, resolving disputes with tenants, or ensuring compliance with complex housing regulations, Jim has provided invaluable guidance every step of the way. I highly recommend Harborview Law to anyone in property management looking for reliable and effective legal support.",
    name: "Jamie Buster",
    role: "Owner, Meridian Property Management",
    photo: "/images/Jamie-web-photo.jpg",
  },
  {
    text: "Working with Harborview Law was an absolute game-changer for our event space business. We needed legal guidance on a complex matter, and Jim's expertise, attention to detail, and ability to break down complicated concepts made the process so much smoother. His professionalism and dedication gave us complete confidence that we were in good hands. Whether you're a small business owner or an individual seeking legal advice, we can't recommend Harborview Law highly enough.",
    name: "Andrew Shoup",
    role: "Owner, Swell Studio",
    photo: "/images/Andrew-web-photo.jpg",
  },
  {
    text: "I was dealing with a stressful and complicated situation with my landlord, and I didn't know where to turn. Jim stepped in and completely turned things around. He took the time to listen to my concerns, explain my rights, and develop a clear strategy to resolve the issue. Thanks to his expertise and persistence, I was able to reach a fair resolution that I didn't think was possible. If you're dealing with any real estate or tenant issues, I highly recommend Jim at Harborview Law.",
    name: "Jeannie Garrido",
    role: "Satisfied Client",
    photo: "/images/Jeannie-web-photo.jpg",
  },
];

export const FAQS = [
  {
    q: "What types of legal services does Harborview Law provide?",
    a: "We offer expert legal services in general counsel, corporate law, real estate, commercial contracts, telecommunications law, and strategic legal consultation for businesses.",
  },
  {
    q: "Does Harborview Law act as an outside general counsel?",
    a: "Yes, we provide personalized, on-demand legal support and outside general counsel services, offering strategic advice on corporate governance, regulatory compliance, and risk management.",
  },
  {
    q: "What experience does Harborview Law have?",
    a: "Harborview Law has over 25 years of experience in offering personalized, on-demand legal support to drive business success across various industries.",
  },
  {
    q: "Can Harborview Law assist with real estate legal issues?",
    a: "Absolutely. We offer expert handling of property transactions, including acquisitions, leases, entitlements, and zoning matters for both commercial and residential projects.",
  },
  {
    q: "Where is Harborview Law located?",
    a: "Our office is located at 23 Corporate Plaza Drive, Suite 150, Newport Beach, CA 92660. You can also reach us at +1 (949) 791-7764.",
  },
];
