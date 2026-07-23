/**
 * BlueprintGenerator — Phase 3-8
 *
 * Takes the intent object from AIArchitect and either:
 *   A) Calls the backend /api/generate endpoint (Claude API) for a rich AI-generated blueprint
 *   B) Falls back to local template-based generation if the API is unavailable
 *
 * Returns a fully populated blueprint conforming to blueprintSchema.js
 */

import {
  emptyBlueprint,
  BLUEPRINT_VERSION,
} from "../templates/blueprintSchema.js";

// ─── Section templates per page type ─────────────────────────────────────────

const PAGE_SECTIONS = {
  Home: [
    {
      id: "hero",
      name: "Hero",
      purpose:
        "First impression — grab attention and communicate the core value proposition",
      animation: "parallax + float",
      threeObject: null, // filled from intent
      content: {
        headline: "",
        subheadline: "",
        cta: { primary: "Get Started", secondary: "Watch Demo" },
      },
    },
    {
      id: "features",
      name: "Features",
      purpose:
        "Showcase 3 to 6 core product features with icons and micro-animations",
      animation: "slide-up on scroll",
      threeObject: "geometric-grid",
      content: {
        heading: "Built for the Future",
        items: [],
      },
    },
    {
      id: "showcase",
      name: "Product Showcase",
      purpose: "Interactive 3D product demo or rotating mockup",
      animation: "orbit rotation",
      threeObject: null,
      content: {
        heading: "See It in Action",
        description: "",
      },
    },
    {
      id: "testimonials",
      name: "Testimonials",
      purpose: "Social proof via glass cards with customer quotes",
      animation: "fade-in stagger",
      threeObject: null,
      content: {
        heading: "Trusted by Thousands",
        items: [],
      },
    },
    {
      id: "cta",
      name: "Call to Action",
      purpose: "Final conversion push before footer",
      animation: "scale-in + glow",
      threeObject: "particle-field",
      content: {
        heading: "",
        subheading: "Start your journey today.",
        button: "Start Free Trial",
      },
    },
  ],
  About: [
    {
      id: "about-hero",
      name: "About Hero",
      purpose: "Brand story header",
      animation: "fade-in",
      threeObject: "floating-sphere",
      content: { heading: "Our Story", description: "" },
    },
    {
      id: "team",
      name: "Team",
      purpose: "Team member cards with hover effects",
      animation: "slide-up stagger",
      threeObject: null,
      content: { heading: "Meet the Team", items: [] },
    },
    {
      id: "mission",
      name: "Mission & Values",
      purpose: "Core values in animated card grid",
      animation: "scale-in",
      threeObject: null,
      content: { heading: "What We Stand For", items: [] },
    },
  ],
  Services: [
    {
      id: "services-hero",
      name: "Services Hero",
      purpose: "Services overview header",
      animation: "float + parallax",
      threeObject: null,
      content: { heading: "What We Offer", description: "" },
    },
    {
      id: "service-cards",
      name: "Service Cards",
      purpose: "Individual service offerings in glass cards",
      animation: "slide-up stagger",
      threeObject: null,
      content: { heading: "Our Services", items: [] },
    },
    {
      id: "process",
      name: "Process",
      purpose: "Step-by-step visual workflow",
      animation: "slide-in sequential",
      threeObject: "geometric-grid",
      content: { heading: "How It Works", steps: [] },
    },
  ],
  Products: [
    {
      id: "products-hero",
      name: "Products Hero",
      purpose: "Product lineup header with 3D preview",
      animation: "orbit",
      threeObject: null,
      content: { heading: "Our Products", description: "" },
    },
    {
      id: "product-grid",
      name: "Product Grid",
      purpose: "Interactive product cards with 3D hover",
      animation: "scale-in hover",
      threeObject: null,
      content: { heading: "Explore the Lineup", items: [] },
    },
  ],
  Pricing: [
    {
      id: "pricing-hero",
      name: "Pricing Hero",
      purpose: "Pricing page header",
      animation: "fade-in",
      threeObject: "crystal",
      content: { heading: "Simple, Transparent Pricing", description: "" },
    },
    {
      id: "pricing-cards",
      name: "Pricing Cards",
      purpose: "Tiered pricing with glass card design",
      animation: "scale-in stagger",
      threeObject: null,
      content: {
        heading: "Choose Your Plan",
        tiers: ["Starter", "Pro", "Enterprise"],
      },
    },
  ],
  Contact: [
    {
      id: "contact-hero",
      name: "Contact Hero",
      purpose: "Contact page header",
      animation: "float",
      threeObject: "particle-field",
      content: { heading: "Get in Touch", description: "" },
    },
    {
      id: "contact-form",
      name: "Contact Form",
      purpose: "Glassmorphism contact form",
      animation: "slide-up",
      threeObject: null,
      content: { heading: "Let's Talk", fields: ["name", "email", "message"] },
    },
  ],
};

// ─── Video scene templates ────────────────────────────────────────────────────

function buildVideoScenes(intent) {
  return [
    {
      id: 1,
      name: "Opening Hero",
      duration: 5,
      camera: "Slow zoom-in",
      elements: [
        "Logo reveal",
        "Background particle animation",
        "Main headline typewriter effect",
      ],
      description: `${intent.websiteName} logo fades in from darkness. Particles swirl. Main headline types out character by character.`,
    },
    {
      id: 2,
      name: "3D Hero Section",
      duration: 8,
      camera: "Orbit movement around central 3D object",
      elements: [
        "Floating 3D objects",
        "Particle field",
        "Interactive light trails",
      ],
      description: `Camera orbits a glowing ${intent.threeObjects[0]} object. Particles react to camera movement. Depth-of-field blur on edges.`,
    },
    {
      id: 3,
      name: "Features Section",
      duration: 8,
      camera: "Smooth horizontal scroll",
      elements: [
        "Feature cards slide in",
        "Icons animate",
        "Glass morphism cards",
      ],
      description:
        "Three feature cards enter from bottom with staggered timing. Each card glows on hover.",
    },
    {
      id: 4,
      name: "Product Showcase",
      duration: 10,
      camera: "Slow 360° rotation",
      elements: ["3D product model", "Holographic overlay", "Spec callouts"],
      description: `Central ${intent.threeObjects[1] || intent.threeObjects[0]} slowly rotates. Holographic labels pop out pointing to key features.`,
    },
    {
      id: 5,
      name: "Testimonials",
      duration: 5,
      camera: "Static with subtle parallax",
      elements: ["Floating glass quote cards", "Avatar images", "Star ratings"],
      description:
        "Three testimonial cards float at different depths. Stars animate in sequence.",
    },
    {
      id: 6,
      name: "Pricing",
      duration: 5,
      camera: "Slight zoom-out",
      elements: [
        "3 pricing tier cards",
        "Highlight animation on recommended",
        "CTA buttons glow",
      ],
      description:
        "Pricing cards rise from bottom. Middle card has neon glow border. CTA buttons pulse.",
    },
    {
      id: 7,
      name: "Final CTA",
      duration: 5,
      camera: "Slow zoom-in to CTA button",
      elements: [
        "Brand logo",
        "CTA button with glow",
        "Particle burst on hover",
      ],
      description: `${intent.websiteName} logo centered. "Get Started" button glows with neon halo. Particle burst plays.`,
    },
  ];
}

function buildAIVideoPrompt(intent, blueprint) {
  return `Create an ultra-realistic futuristic website preview video (60fps, 4K quality).

Website: "${intent.websiteName}"
Type: ${intent.prompt}
Style: ${intent.style}

Visual direction:
Show a premium ${intent.style.toLowerCase()} landing page with smooth cinematic camera movement, glassmorphism UI panels, floating ${intent.threeObjects.join(", ")} 3D elements, animated typography with typewriter effects, interactive sections with hover states, ultra-smooth page transitions, cinematic depth-of-field lighting, volumetric god rays, particle systems with physics, realistic reflections on glass surfaces, smooth parallax scrolling effects, immersive spatial audio-reactive visuals, Apple-quality design aesthetics, high-end motion graphics.

Color palette: primary ${blueprint.palette.primary}, secondary ${blueprint.palette.secondary}, accent ${blueprint.palette.accent} on background ${blueprint.palette.background}.

Camera: Start with slow zoom-in hero reveal → orbit around central 3D object → horizontal scroll through features → 360° product rotation → gentle float on testimonials → zoom-out to pricing → final zoom-in CTA.

Quality: 8K textures, sub-pixel anti-aliasing, HDR rendering, physically-based materials, real-time ray tracing.`;
}

// ─── Component structure generator ────────────────────────────────────────────

function buildComponentStructure(intent) {
  const layout = ["Navbar", "Footer", "ScrollProgress", "CustomCursor"];
  const sections = [];
  const threeD = ["ParticleField", "CameraRig"];
  const pages = intent.pages.map((p) => `${p}Page`);

  intent.pages.forEach((page) => {
    const secs = PAGE_SECTIONS[page] || [];
    secs.forEach((s) => {
      const comp = s.name.replace(/\s+/g, "");
      if (!sections.includes(comp)) sections.push(comp);
    });
  });

  intent.threeObjects.forEach((obj) => {
    const comp = obj
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("");
    if (!threeD.includes(comp)) threeD.push(comp);
  });

  return { layout, sections, threeD, pages };
}

// ─── Main local blueprint builder (fallback) ──────────────────────────────────

export function buildLocalBlueprint(intent) {
  const bp = emptyBlueprint();

  bp.meta.prompt = intent.prompt;
  bp.concept = {
    websiteName: intent.websiteName,
    tagline: `The Future of ${intent.websiteName}`,
    businessType: inferBusinessType(intent.prompt),
    targetAudience: inferAudience(intent.style),
    uniqueSellingProposition: `The most advanced ${inferBusinessType(intent.prompt)} platform powered by AI`,
    designStyle: intent.style,
    brandPersonality: intent.brandPersonality,
  };
  bp.palette = {
    ...intent.palette,
    text: "#f0f0ff",
    textMuted: "#7070a0",
    surface: "#0f0f1a",
  };
  bp.pages = intent.pages.map((pageName) => ({
    name: pageName,
    path: pageName === "Home" ? "/" : `/${pageName.toLowerCase()}`,
    sections: (PAGE_SECTIONS[pageName] || []).map((s) => ({
      ...s,
      threeObject: s.threeObject || intent.threeObjects[0],
      content: { ...s.content, headline: `${intent.websiteName} — ${s.name}` },
    })),
  }));
  bp.videoScript = {
    duration: 55,
    resolution: "1920x1080",
    fps: 60,
    style: `${intent.style} cinematic UI showcase`,
    scenes: buildVideoScenes(intent),
    aiVideoPrompt: "",
  };
  bp.videoScript.aiVideoPrompt = buildAIVideoPrompt(intent, bp);
  bp.components = buildComponentStructure(intent);
  bp.seo = {
    title: `${intent.websiteName} — ${bp.concept.tagline}`,
    description: bp.concept.uniqueSellingProposition,
    keywords: [intent.websiteName, intent.style, ...intent.brandPersonality],
    ogImage: "/og-image.jpg",
  };

  return bp;
}

function inferBusinessType(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.match(/saas|platform|software|app/)) return "SaaS Platform";
  if (lower.match(/agency|studio|creative/)) return "Creative Agency";
  if (lower.match(/ecommerce|shop|store/)) return "E-Commerce";
  if (lower.match(/game|gaming|esport/)) return "Gaming";
  if (lower.match(/finance|fintech|payment/)) return "FinTech";
  if (lower.match(/health|medical|wellness/)) return "HealthTech";
  if (lower.match(/space|cosmos|nasa/)) return "Space Tech";
  if (lower.match(/fashion|luxury|brand/)) return "Fashion & Luxury";
  return "Technology";
}

function inferAudience(style) {
  const map = {
    Corporate: "Enterprise decision-makers and C-level executives",
    Gaming: "Gamers aged 16-35 who value performance and immersion",
    Luxury: "High-net-worth individuals seeking premium experiences",
    Startup: "Tech-savvy early adopters and startup founders",
    Space: "Science enthusiasts, engineers, and visionaries",
    Minimal: "Design-conscious professionals and creatives",
    default: "Tech-forward professionals and early adopters aged 25-45",
  };
  return map[style] || map.default;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate blueprint via Claude API (server-side).
 * Falls back to local generation if API is unavailable.
 *
 * @param {object} intent  Output of AIArchitect.analyzePrompt()
 * @param {object} [opts]  { onProgress }
 * @returns {Promise<object>}  Blueprint
 */
export async function generateBlueprint(intent, opts = {}) {
  const { onProgress } = opts;

  try {
    onProgress?.({ phase: 1, label: "Analyzing intent..." });

    const res = await fetch("/api/generate-blueprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: intent.prompt, intent }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    onProgress?.({ phase: 2, label: "Parsing blueprint..." });
    const { blueprint } = await res.json();

    onProgress?.({ phase: 3, label: "Blueprint ready" });
    return blueprint;
  } catch {
    // Graceful fallback — fully local generation
    onProgress?.({ phase: 2, label: "Generating locally..." });
    await sleep(400);
    onProgress?.({ phase: 3, label: "Blueprint ready" });
    return buildLocalBlueprint(intent);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
