/**
 * AIArchitect — Phase 1 & 2
 *
 * Analyzes the raw user prompt and extracts:
 *   - Business type, audience, brand personality
 *   - Design style preference
 *   - Color mood
 *   - Required pages & features
 *   - 3D element suggestions
 *
 * Output is an "intent object" consumed by BlueprintGenerator.
 */

import { DESIGN_STYLES } from '../templates/blueprintSchema.js'

// ─── Keyword → style mapping ──────────────────────────────────────────────────
const STYLE_SIGNALS = {
  Futuristic:    ['ai', 'tech', 'neural', 'robot', 'automation', 'future', 'cyber', 'digital', 'smart'],
  Cyberpunk:     ['cyberpunk', 'neon', 'hacker', 'dystopian', 'glitch', 'punk'],
  Minimal:       ['minimal', 'clean', 'simple', 'white', 'elegant', 'zen', 'light'],
  Luxury:        ['luxury', 'premium', 'high-end', 'exclusive', 'diamond', 'gold', 'elite', 'vip'],
  Corporate:     ['enterprise', 'corporate', 'b2b', 'finance', 'legal', 'consulting', 'firm'],
  Startup:       ['startup', 'saas', 'app', 'product', 'launch', 'mvp', 'growth'],
  Gaming:        ['gaming', 'game', 'esports', 'play', 'gamer', 'stream', 'twitch'],
  Space:         ['space', 'cosmos', 'galaxy', 'star', 'universe', 'planet', 'orbit', 'nasa', 'rocket'],
  AI:            ['ai', 'gpt', 'llm', 'machine learning', 'deep learning', 'neural', 'chatbot'],
  Glassmorphism: ['glass', 'blur', 'frosted', 'transparent', 'ethereal', 'dream'],
  Neumorphism:   ['soft', 'neumorphism', 'clay', 'pastel', 'gentle', 'rounded'],
}

// ─── Keyword → color palette mapping ─────────────────────────────────────────
const COLOR_MOODS = {
  dark_blue:   { primary: '#3d5eff', secondary: '#00d4ff', accent: '#bf5fff', background: '#0a0a14' },
  neon_cyber:  { primary: '#ff2d78', secondary: '#00ff88', accent: '#ffdd00', background: '#050510' },
  luxury_gold: { primary: '#c9a84c', secondary: '#e8d5a3', accent: '#8b6914', background: '#0c0a06' },
  space_deep:  { primary: '#6c63ff', secondary: '#a78bfa', accent: '#38bdf8', background: '#020212' },
  gaming_fire: { primary: '#ff4500', secondary: '#ff8c00', accent: '#ffdd00', background: '#0a0500' },
  eco_green:   { primary: '#00c853', secondary: '#69f0ae', accent: '#00bcd4', background: '#040d06' },
  corporate:   { primary: '#2563eb', secondary: '#60a5fa', accent: '#7c3aed', background: '#0f172a' },
  minimal:     { primary: '#1a1a2e', secondary: '#4a4a6a', accent: '#6366f1', background: '#fafafa' },
}

// ─── 3D element suggestions per style ─────────────────────────────────────────
const THREE_SUGGESTIONS = {
  Futuristic:    ['neural-network', 'geometric-grid', 'particle-field'],
  Cyberpunk:     ['torus-knot', 'particle-field', 'geometric-grid'],
  Minimal:       ['floating-sphere', 'icosahedron', 'particle-field'],
  Luxury:        ['crystal', 'floating-sphere', 'icosahedron'],
  Corporate:     ['geometric-grid', 'octahedron', 'particle-field'],
  Startup:       ['torus-knot', 'particle-field', 'icosahedron'],
  Gaming:        ['torus-knot', 'particle-field', 'black-hole'],
  Space:         ['planet', 'black-hole', 'particle-field'],
  AI:            ['ai-brain', 'neural-network', 'particle-field'],
  Glassmorphism: ['crystal', 'floating-sphere', 'icosahedron'],
  Neumorphism:   ['floating-sphere', 'octahedron', 'crystal'],
}

/**
 * Infer design style from prompt keywords (returns best match).
 */
function inferStyle(text) {
  const lower = text.toLowerCase()
  let best = { style: 'Futuristic', score: 0 }

  for (const [style, signals] of Object.entries(STYLE_SIGNALS)) {
    const score = signals.filter(s => lower.includes(s)).length
    if (score > best.score) best = { style, score }
  }

  return best.style
}

/**
 * Infer color palette from style + prompt keywords.
 */
function inferPalette(style, text) {
  const lower = text.toLowerCase()
  if (lower.includes('gold') || lower.includes('luxury'))        return COLOR_MOODS.luxury_gold
  if (style === 'Space')                                          return COLOR_MOODS.space_deep
  if (style === 'Gaming')                                         return COLOR_MOODS.gaming_fire
  if (style === 'Minimal')                                        return COLOR_MOODS.minimal
  if (lower.includes('eco') || lower.includes('green'))          return COLOR_MOODS.eco_green
  if (style === 'Corporate')                                      return COLOR_MOODS.corporate
  if (style === 'Cyberpunk')                                      return COLOR_MOODS.neon_cyber
  return COLOR_MOODS.dark_blue
}

/**
 * Extract a website name from the prompt.
 * Looks for "called X" / "named X" / "for X" patterns first, else takes first 2 words.
 */
function extractName(text) {
  const patterns = [
    /(?:called|named|for|brand)\s+["']?([A-Z][A-Za-z0-9\s]{1,30})["']?/i,
    /^([A-Z][A-Za-z0-9]+(?:\s[A-Z][A-Za-z0-9]+)?)/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }
  return 'NeoBrand'
}

/**
 * Detect which pages are needed from prompt.
 */
function detectPages(text) {
  const lower = text.toLowerCase()
  const pages = ['Home']
  if (lower.match(/about|team|story/))         pages.push('About')
  if (lower.match(/service|solution|offer/))   pages.push('Services')
  if (lower.match(/product|showcase|portfolio/))pages.push('Products')
  if (lower.match(/pric|plan|tier/))           pages.push('Pricing')
  if (lower.match(/blog|article|news/))        pages.push('Blog')
  if (lower.match(/contact|reach|touch/))      pages.push('Contact')
  if (pages.length < 3) pages.push('Services', 'Contact')
  return [...new Set(pages)]
}

/**
 * Main entry point — Phase 1 analysis.
 * @param {string} prompt  Raw user prompt
 * @returns {object}       Intent object
 */
export function analyzePrompt(prompt) {
  const style       = inferStyle(prompt)
  const palette     = inferPalette(style, prompt)
  const websiteName = extractName(prompt)
  const pages       = detectPages(prompt)

  return {
    prompt,
    websiteName,
    style,
    palette,
    pages,
    threeObjects: THREE_SUGGESTIONS[style] || THREE_SUGGESTIONS.Futuristic,
    brandPersonality: deriveBrandPersonality(style),
  }
}

function deriveBrandPersonality(style) {
  const map = {
    Futuristic:    ['innovative', 'bold', 'cutting-edge'],
    Cyberpunk:     ['rebellious', 'dark', 'disruptive'],
    Minimal:       ['clean', 'focused', 'elegant'],
    Luxury:        ['exclusive', 'refined', 'prestigious'],
    Corporate:     ['trustworthy', 'professional', 'reliable'],
    Startup:       ['agile', 'energetic', 'growth-driven'],
    Gaming:        ['exciting', 'competitive', 'immersive'],
    Space:         ['visionary', 'limitless', 'exploratory'],
    AI:            ['intelligent', 'adaptive', 'powerful'],
    Glassmorphism: ['modern', 'transparent', 'fluid'],
    Neumorphism:   ['soft', 'tactile', 'approachable'],
  }
  return map[style] || ['modern', 'creative']
}
