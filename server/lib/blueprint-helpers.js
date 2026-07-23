export const INDUSTRY_RULES = [
  { key: 'ecommerce', rx: /shop|store|ecommerce|e-commerce|buy|sell|product|retail|marketplace|cart/i },
  { key: 'restaurant', rx: /restaurant|food|cafe|coffee|bistro|bakery|pizza|sushi|cuisine|dining|eat|chef/i },
  { key: 'gaming', rx: /game|gaming|esport|play|gamer|rpg|fps|mmorpg|studio|indie|steam/i },
  { key: 'fintech', rx: /finance|fintech|bank|invest|crypto|defi|trading|payment|wallet|wealth|fund/i },
  { key: 'health', rx: /health|medical|clinic|doctor|fitness|wellness|gym|yoga|therapy|hospital|pharma/i },
  { key: 'education', rx: /education|school|course|learn|academy|tutor|university|college|training|teach/i },
  { key: 'travel', rx: /travel|hotel|tour|flight|adventure|vacation|resort|booking|trip|destination/i },
  { key: 'real_estate', rx: /real.?estate|property|home|house|apartment|realty|realtor|listing|mortgage/i },
  { key: 'music', rx: /music|band|album|artist|record|concert|sound|studio|dj|label|spotify/i },
  { key: 'agency', rx: /agency|creative|design|brand|marketing|advertising|digital|studio|branding/i },
  { key: 'space', rx: /space|galaxy|nasa|rocket|satellite|astronomy|cosmos|planet|sci.?fi|star.?ship/i },
  { key: 'ai_saas', rx: /ai |artificial intelligence|machine learning|ml |neural|gpt|llm|chatbot|automation/i },
  { key: 'nft', rx: /nft|web3|blockchain|token|mint|metaverse|opensea|dao|solana|eth|polygon/i },
  { key: 'consulting', rx: /consult|advisory|strategy|management|professional|law|legal|audit|enterprise/i },
  { key: 'saas', rx: /saas|software|platform|tool|app|dashboard|api|developer|b2b|startup|product/i },
]

export const DESIGN_STYLES = [
  'Cyberpunk', 'Brutalist', 'Minimal Luxury', 'Editorial', 'Organic Nature',
  'Scandinavian', 'Japanese Zen', 'Neo Futurism', 'Space Tech', 'Gaming',
  'Retro Futurism', 'Dark Premium', 'Glassmorphism', 'Claymorphism',
  'Swiss Design', 'Industrial', 'Magazine', 'Luxury Fashion', 'Architectural',
  'Creative Studio', 'Modern Startup', 'Vibrant Gradient', 'Abstract Geometry',
]

export const INDUSTRY_STYLES = {
  ecommerce: ['Minimal Luxury', 'Editorial', 'Claymorphism', 'Modern Startup'],
  restaurant: ['Luxury Fashion', 'Organic Nature', 'Magazine', 'Japanese Zen'],
  gaming: ['Cyberpunk', 'Gaming', 'Neo Futurism', 'Dark Premium'],
  fintech: ['Swiss Design', 'Dark Premium', 'Architectural', 'Glassmorphism'],
  health: ['Scandinavian', 'Organic Nature', 'Minimal Luxury', 'Japanese Zen'],
  education: ['Modern Startup', 'Editorial', 'Vibrant Gradient', 'Claymorphism'],
  travel: ['Luxury Fashion', 'Magazine', 'Organic Nature', 'Vibrant Gradient'],
  real_estate: ['Architectural', 'Minimal Luxury', 'Industrial', 'Swiss Design'],
  music: ['Cyberpunk', 'Glassmorphism', 'Dark Premium', 'Abstract Geometry'],
  agency: ['Creative Studio', 'Brutalist', 'Editorial', 'Abstract Geometry'],
  space: ['Space Tech', 'Neo Futurism', 'Cyberpunk', 'Dark Premium'],
  ai_saas: ['Neo Futurism', 'Glassmorphism', 'Dark Premium', 'Abstract Geometry'],
  nft: ['Cyberpunk', 'Abstract Geometry', 'Neo Futurism', 'Industrial'],
  consulting: ['Swiss Design', 'Architectural', 'Editorial', 'Dark Premium'],
  saas: ['Modern Startup', 'Glassmorphism', 'Neo Futurism', 'Swiss Design'],
}

export const THREE_D_OBJECTS = [
  'floating-sphere', 'torus-knot', 'icosahedron', 'octahedron',
  'ai-brain', 'particle-field', 'planet', 'crystal', 'dna-helix',
  'neural-network', 'geometric-grid', 'black-hole',
]

export const INDUSTRY_THREE_D = {
  ecommerce: ['floating-sphere', 'crystal', 'icosahedron', 'octahedron'],
  restaurant: ['crystal', 'floating-sphere', 'geometric-grid'],
  gaming: ['torus-knot', 'icosahedron', 'neural-network', 'black-hole'],
  fintech: ['geometric-grid', 'neural-network', 'octahedron', 'torus-knot'],
  health: ['dna-helix', 'floating-sphere', 'icosahedron', 'crystal'],
  education: ['icosahedron', 'neural-network', 'ai-brain', 'geometric-grid'],
  travel: ['planet', 'floating-sphere', 'crystal', 'torus-knot'],
  real_estate: ['octahedron', 'geometric-grid', 'crystal', 'floating-sphere'],
  music: ['torus-knot', 'particle-field', 'geometric-grid', 'icosahedron'],
  agency: ['particle-field', 'torus-knot', 'neural-network', 'floating-sphere'],
  space: ['black-hole', 'planet', 'particle-field', 'torus-knot'],
  ai_saas: ['neural-network', 'ai-brain', 'particle-field', 'geometric-grid'],
  nft: ['icosahedron', 'torus-knot', 'crystal', 'neural-network'],
  consulting: ['geometric-grid', 'octahedron', 'neural-network', 'floating-sphere'],
  saas: ['ai-brain', 'neural-network', 'particle-field', 'geometric-grid'],
}

export const LAYOUTS = [
  'Layout-A: Fullscreen 3D scene occupies the entire viewport. Floating navbar overlaid on top. Content text and CTAs appear over the 3D scene with glassmorphism panels.',
  'Layout-B: Exact 50/50 vertical split. Left = bold typography headline + CTA stack. Right = interactive 3D scene or gallery. Zero hero padding — content starts edge-to-edge.',
  'Layout-C: No traditional hero. Page opens with oversized editorial typography across a full-width grid. Sections are asymmetric editorial blocks. Mixed column widths. Images break the grid.',
  'Layout-D: Bento grid homepage. Multiple differently-sized interactive cards fill the viewport. Each card contains a 3D mini-scene, stat, or feature. No traditional hero section.',
  'Layout-E: Huge whitespace. Single centred headline at 96-128px. Subtitle below. One primary CTA. 3D object floats below the fold. Every section is a full-page breathable moment.',
  'Layout-F: Dark dashboard interface. Left sidebar navigation. Right content area split into floating panel widgets. 3D data visualization widgets. Stats and live counters in panels.',
  'Layout-G: Horizontal scrolling timeline. Each panel is a chapter of the brand story. Progress indicator at top. 3D objects transform between chapters. Pinned vertical sections within.',
  'Layout-H: Full-page scroll storytelling. Every scroll snap changes the ENTIRE screen layout and color. Section 1 = hero. Section 2 = problem. Section 3 = solution. Dramatic transitions.',
  'Layout-I: Circular navigation menu in the center. Content orbits around the center. Clicking a nav item rotates the wheel to reveal that section. 3D scene is the rotating hub.',
  'Layout-J: Zoomable, pannable canvas interface. Elements float at different depths. Users can drag to explore. Clusters of related content. Like Miro or Figma but for a landing page.',
]

export const COLOR_PALETTES = {
  ecommerce: [{ bg: '#0d0d0d', primary: '#ff6b35', secondary: '#ffd166', accent: '#f8f8f2', text: '#ffffff' }, { bg: '#fafaf8', primary: '#1a1a2e', secondary: '#e94560', accent: '#0f3460', text: '#1a1a1a' }, { bg: '#12111a', primary: '#c9b99a', secondary: '#8b7355', accent: '#f5f0e8', text: '#f0ece3' }],
  restaurant: [{ bg: '#1a0a00', primary: '#ff4500', secondary: '#ff8c00', accent: '#ffd700', text: '#fff8f0' }, { bg: '#0d1b0d', primary: '#4caf50', secondary: '#81c784', accent: '#fff9c4', text: '#f1f8e9' }, { bg: '#1c1410', primary: '#d4a574', secondary: '#8b6914', accent: '#f5e6d3', text: '#faf0e6' }],
  gaming: [{ bg: '#080012', primary: '#bf5fff', secondary: '#00fff7', accent: '#ff3864', text: '#e0d0ff' }, { bg: '#0a0a0a', primary: '#00ff41', secondary: '#008f11', accent: '#39ff14', text: '#00ff41' }, { bg: '#0d0221', primary: '#ff6b6b', secondary: '#feca57', accent: '#48dbfb', text: '#ffffff' }],
  fintech: [{ bg: '#060818', primary: '#00d2ff', secondary: '#3a7bd5', accent: '#7efff5', text: '#e8f4fd' }, { bg: '#0a0a0a', primary: '#ffd700', secondary: '#ff8c00', accent: '#fff3cd', text: '#ffffff' }, { bg: '#f8f9fa', primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460', text: '#212529' }],
  health: [{ bg: '#f0f7ff', primary: '#0066cc', secondary: '#00a8a8', accent: '#e8f4ff', text: '#1a1a2e' }, { bg: '#0d1b12', primary: '#00c853', secondary: '#69f0ae', accent: '#b9f6ca', text: '#e8f5e9' }, { bg: '#fafafa', primary: '#5c6bc0', secondary: '#7e57c2', accent: '#ede7f6', text: '#212121' }],
  education: [{ bg: '#1a1033', primary: '#7c4dff', secondary: '#ffab00', accent: '#e040fb', text: '#f3e5f5' }, { bg: '#fff8e1', primary: '#f57c00', secondary: '#ff8f00', accent: '#fff3e0', text: '#212121' }, { bg: '#0d1b2a', primary: '#00b4d8', secondary: '#0077b6', accent: '#90e0ef', text: '#caf0f8' }],
  travel: [{ bg: '#000d1a', primary: '#00b4d8', secondary: '#f77f00', accent: '#90e0ef', text: '#caf0f8' }, { bg: '#1a0a2e', primary: '#ff6b9d', secondary: '#c44dff', accent: '#ffd6ff', text: '#fff0ff' }, { bg: '#f5f0e8', primary: '#2d6a4f', secondary: '#40916c', accent: '#d8f3dc', text: '#1b4332' }],
  real_estate: [{ bg: '#0f0f0f', primary: '#c9a96e', secondary: '#8b7355', accent: '#f5f0e8', text: '#ffffff' }, { bg: '#f8f8f6', primary: '#2c3e50', secondary: '#34495e', accent: '#ecf0f1', text: '#2c3e50' }, { bg: '#111827', primary: '#6366f1', secondary: '#818cf8', accent: '#e0e7ff', text: '#f0f4ff' }],
  music: [{ bg: '#0a0010', primary: '#ff006e', secondary: '#8338ec', accent: '#fb5607', text: '#ffbe0b' }, { bg: '#0d0d0d', primary: '#39ff14', secondary: '#00ff9f', accent: '#ccff00', text: '#f0fff0' }, { bg: '#1a0a1e', primary: '#ff79c6', secondary: '#bd93f9', accent: '#f8f8f2', text: '#f8f8f2' }],
  agency: [{ bg: '#0a0a0a', primary: '#ff4444', secondary: '#ffffff', accent: '#ffff00', text: '#ffffff' }, { bg: '#f5f5f0', primary: '#000000', secondary: '#333333', accent: '#ff3300', text: '#000000' }, { bg: '#1a1a2e', primary: '#e94560', secondary: '#0f3460', accent: '#533483', text: '#eaeaea' }],
  space: [{ bg: '#000005', primary: '#7b2fff', secondary: '#00d4ff', accent: '#bf5fff', text: '#e0d6ff' }, { bg: '#020818', primary: '#00cfff', secondary: '#005fcc', accent: '#0affef', text: '#d0f0ff' }, { bg: '#000000', primary: '#ff8c00', secondary: '#ff4500', accent: '#ffd700', text: '#fff8f0' }],
  ai_saas: [{ bg: '#050510', primary: '#3d5eff', secondary: '#00d4ff', accent: '#bf5fff', text: '#e8eeff' }, { bg: '#0a0a0a', primary: '#00ff9f', secondary: '#00b4d8', accent: '#7efff5', text: '#e0fff0' }, { bg: '#f8f9ff', primary: '#4f46e5', secondary: '#7c3aed', accent: '#ddd6fe', text: '#1e1b4b' }],
  nft: [{ bg: '#080010', primary: '#00ff9f', secondary: '#7b2fff', accent: '#ff006e', text: '#00ff9f' }, { bg: '#0d0d0d', primary: '#ff3cac', secondary: '#784ba0', accent: '#2b86c5', text: '#ffffff' }, { bg: '#000000', primary: '#fcee0a', secondary: '#ff6600', accent: '#00ffff', text: '#ffffff' }],
  consulting: [{ bg: '#f8f8f6', primary: '#1a1a1a', secondary: '#444444', accent: '#c9a96e', text: '#1a1a1a' }, { bg: '#111111', primary: '#c9a96e', secondary: '#8b7355', accent: '#f5f0e8', text: '#ffffff' }, { bg: '#0d1b3e', primary: '#4a9eff', secondary: '#1e5fa8', accent: '#b8d4ff', text: '#e8f0ff' }],
  saas: [{ bg: '#050505', primary: '#6366f1', secondary: '#8b5cf6', accent: '#22d3ee', text: '#f0f0ff' }, { bg: '#f0fdf4', primary: '#059669', secondary: '#10b981', accent: '#d1fae5', text: '#065f46' }, { bg: '#0f172a', primary: '#f472b6', secondary: '#ec4899', accent: '#fce7f3', text: '#fdf4ff' }],
}

export const ANIMATION_STYLES = [
  'smooth-fade-up', 'magnetic-hover', '3d-tilt-cards', 'parallax-depth',
  'morphing-blobs', 'particle-burst', 'cursor-follower', 'split-text-reveal',
  'image-clip-reveal', 'stagger-cascade', 'elastic-spring', 'glitch-effect',
]

export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export function classifyIndustry(prompt) {
  for (const { key, rx } of INDUSTRY_RULES) {
    if (rx.test(prompt)) return key
  }
  return 'saas'
}

export function getVariation(industry) {
  const stylePool = INDUSTRY_STYLES[industry] ?? DESIGN_STYLES
  const threePool = INDUSTRY_THREE_D[industry] ?? THREE_D_OBJECTS
  const palPool = COLOR_PALETTES[industry] ?? COLOR_PALETTES.saas

  const style = pick(stylePool)
  const threeDObj = pick(threePool)
  const layout = pick(LAYOUTS)
  const animation = pick(ANIMATION_STYLES)
  const palette = pick(palPool)
  const threeDObj2 = pick(threePool.filter(o => o !== threeDObj) || threePool)

  return { style, threeDObj, threeDObj2, layout, animation, palette }
}
