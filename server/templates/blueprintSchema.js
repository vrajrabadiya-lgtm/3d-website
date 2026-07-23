/**
 * Master JSON schema that every generated blueprint must conform to.
 * This drives Phase 2-8 of the AI Architect pipeline.
 */

export const BLUEPRINT_VERSION = '1.0.0'

export const DESIGN_STYLES = [
  'Futuristic', 'Cyberpunk', 'Minimal', 'Luxury',
  'Corporate', 'Startup', 'Gaming', 'Space',
  'AI', 'Glassmorphism', 'Neumorphism',
]

export const ANIMATION_TYPES = [
  'parallax', 'float', 'orbit', 'rotate', 'pulse',
  'slide-up', 'fade-in', 'scale-in', 'morph',
  'particle-burst', 'wave', 'typewriter',
]

export const THREE_OBJECT_TYPES = [
  'floating-sphere', 'torus-knot', 'icosahedron', 'octahedron',
  'ai-brain', 'particle-field', 'planet', 'crystal',
  'dna-helix', 'neural-network', 'geometric-grid', 'black-hole',
]

/**
 * Empty blueprint — use as a starting template.
 */
export const emptyBlueprint = () => ({
  version: BLUEPRINT_VERSION,
  meta: {
    generatedAt: new Date().toISOString(),
    prompt: '',
  },

  // Phase 2 — Concept
  concept: {
    websiteName: '',
    tagline: '',
    businessType: '',
    targetAudience: '',
    uniqueSellingProposition: '',
    designStyle: 'Futuristic',
    brandPersonality: [],        // e.g. ['bold', 'innovative', 'trustworthy']
  },

  // Phase 6 — Visual Identity
  palette: {
    primary:    '#3d5eff',
    secondary:  '#00d4ff',
    accent:     '#bf5fff',
    background: '#0a0a14',
    surface:    '#0f0f1a',
    text:       '#f0f0ff',
    textMuted:  '#7070a0',
  },

  typography: {
    displayFont: 'Syne',
    bodyFont:    'Inter',
    monoFont:    'JetBrains Mono',
    scale: {
      hero:     'text-6xl lg:text-8xl',
      heading:  'text-4xl lg:text-5xl',
      subhead:  'text-2xl lg:text-3xl',
      body:     'text-base lg:text-lg',
    },
  },

  // Phase 5 — Website Structure
  pages: [],            // PageBlueprint[]

  // Phase 3 — Video Script
  videoScript: {
    duration: 55,       // seconds
    resolution: '1920x1080',
    fps: 60,
    style: '',
    scenes: [],         // SceneBlueprint[]
    aiVideoPrompt: '',  // Single cinematic AI video generation prompt
  },

  // Phase 7 — Technical Architecture
  tech: {
    framework:  'React 18',
    renderer:   'React Three Fiber',
    helpers:    ['Drei', 'Leva'],
    animation:  ['GSAP', 'Framer Motion'],
    styling:    'Tailwind CSS v3',
    state:      'Zustand',
    build:      'Vite 5',
  },

  // Phase 8 — Component Structure
  components: {
    layout:   [],   // string[]
    sections: [],   // string[]
    threeD:   [],   // string[]
    pages:    [],   // string[]
  },

  // Phase 9 — SEO
  seo: {
    title:       '',
    description: '',
    keywords:    [],
    ogImage:     '',
  },
})

/**
 * Validate that a blueprint has all required top-level keys.
 */
export function validateBlueprint(bp) {
  const required = ['concept', 'palette', 'typography', 'pages', 'videoScript', 'tech', 'components', 'seo']
  return required.every(k => k in bp)
}
