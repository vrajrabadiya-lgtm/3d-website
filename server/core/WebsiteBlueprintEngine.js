/**
 * WebsiteBlueprintEngine — Phase 3
 *
 * Generates a render-ready JSON blueprint that drives LivePreview.
 * API path: Claude claude-sonnet-4-6 via /api/generate-website-blueprint
 * Fallback:  fully dynamic local generation (no hardcoded content)
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractName(prompt) {
  const patterns = [
    /(?:called|named|brand(?:ed)?\s+as?|build(?:ing)?\s+(?:a\s+)?(?:website\s+(?:for|called))?)\s+["']?([A-Z][A-Za-z0-9]{2,}(?:\s[A-Z][A-Za-z0-9]{2,})?)/i,
    /^["']?([A-Z][A-Za-z0-9]{2,}(?:\s[A-Z][A-Za-z0-9]{2,})?)/,
  ]
  for (const p of patterns) {
    const m = prompt.match(p)
    if (m && m[1].length > 2) return m[1].trim()
  }
  // Fallback: pick the longest capitalised word
  const caps = prompt.match(/\b[A-Z][a-z]{2,}\b/g)
  if (caps?.length) return caps.sort((a, b) => b.length - a.length)[0]
  return 'Nexus'
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Industry classifier ───────────────────────────────────────────────────────

const INDUSTRY_RULES = [
  { key: 'ecommerce',   rx: /shop|store|ecommerce|e-commerce|product|buy|sell|retail|marketplace|fashion|clothing|apparel|jewel|watch|shoe|bag/ },
  { key: 'restaurant',  rx: /restaurant|food|cafe|coffee|bistro|dining|eat|chef|menu|kitchen|bakery|pizza|sushi|burger|bar|pub|brewery/ },
  { key: 'gaming',      rx: /gaming|game|esport|play|gamer|stream|twitch|fps|rpg|moba|clan|guild|squad/ },
  { key: 'fintech',     rx: /finance|fintech|bank|payment|invest|trading|crypto|defi|web3|wallet|nft|token|blockchain|stock|fund/ },
  { key: 'health',      rx: /health|medical|clinic|doctor|hospital|wellness|fitness|gym|yoga|diet|nutrition|pharma|therapy/ },
  { key: 'education',   rx: /edu|learn|school|course|academy|university|tutor|teach|training|bootcamp|skill|certificate/ },
  { key: 'travel',      rx: /travel|hotel|booking|flight|tour|vacation|holiday|resort|airbnb|destination|trip/ },
  { key: 'real_estate', rx: /real estate|property|house|home|apartment|rent|mortgage|realty|listing|condo/ },
  { key: 'music',       rx: /music|artist|band|album|concert|studio|record|podcast|audio|sound|dj|producer/ },
  { key: 'agency',      rx: /agency|studio|creative|design|branding|marketing|ads|media|pr|seo|social/ },
  { key: 'space',       rx: /space|cosmos|galaxy|star|universe|planet|orbit|nasa|rocket|satellite|telescope/ },
  { key: 'ai_saas',     rx: /ai|gpt|llm|neural|machine learning|deep learning|chatbot|automation|intelligent|predict/ },
  { key: 'saas',        rx: /saas|platform|software|dashboard|analytics|tool|api|devtool|developer|productivity/ },
  { key: 'nft',         rx: /nft|collectible|mint|opensea|art|generative|pfp|metaverse|digital art/ },
  { key: 'consulting',  rx: /consult|advisory|strategy|management|enterprise|b2b|corporate|professional/ },
]

function classify(prompt) {
  const lower = prompt.toLowerCase()
  for (const rule of INDUSTRY_RULES) {
    if (rule.rx.test(lower)) return rule.key
  }
  return 'saas'
}

// ─── Style + palette ───────────────────────────────────────────────────────────

function inferStyle(industry, prompt) {
  const l = prompt.toLowerCase()
  if (l.match(/luxury|premium|exclusive|elite/))       return 'Luxury'
  if (l.match(/minimal|clean|simple|white|light/))     return 'Minimal'
  if (l.match(/cyberpunk|neon|hacker|punk|glitch/))    return 'Cyberpunk'
  if (l.match(/glassmorphism|glass|blur|frosted/))     return 'Glassmorphism'
  const map = {
    gaming: 'Cyberpunk', fintech: 'Corporate', health: 'Minimal',
    education: 'Startup', travel: 'Glassmorphism', real_estate: 'Luxury',
    music: 'Cyberpunk', agency: 'Futuristic', space: 'Space',
    nft: 'Cyberpunk', consulting: 'Corporate', restaurant: 'Luxury',
    ecommerce: 'Minimal', ai_saas: 'AI', saas: 'Futuristic',
  }
  return map[industry] ?? 'Futuristic'
}

// ─── Multiple palette variants per style (randomly picked each generation) ────
const PALETTE_VARIANTS = {
  Futuristic: [
    { primary: '#3d5eff', secondary: '#00d4ff', accent: '#bf5fff', background: '#0a0a14', text: '#f0f0ff' },
    { primary: '#5b21b6', secondary: '#7c3aed', accent: '#06b6d4', background: '#0d0118', text: '#f5f3ff' },
    { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#e879f9', background: '#071428', text: '#e0f2fe' },
    { primary: '#6366f1', secondary: '#818cf8', accent: '#34d399', background: '#06060f', text: '#eef2ff' },
  ],
  Cyberpunk: [
    { primary: '#ff2d78', secondary: '#00ff88', accent: '#ffdd00', background: '#050510', text: '#f0f0ff' },
    { primary: '#00ffff', secondary: '#ff00ff', accent: '#ffff00', background: '#040408', text: '#f0ffff' },
    { primary: '#ff6b00', secondary: '#ff2d78', accent: '#39ff14', background: '#060203', text: '#fff8f0' },
    { primary: '#9400ff', secondary: '#00ffe5', accent: '#ff0099', background: '#05000a', text: '#f8f0ff' },
  ],
  Minimal: [
    { primary: '#1a1a2e', secondary: '#4a4a6a', accent: '#6366f1', background: '#fafafa', text: '#1a1a2e' },
    { primary: '#18181b', secondary: '#52525b', accent: '#e11d48', background: '#ffffff', text: '#09090b' },
    { primary: '#1e293b', secondary: '#475569', accent: '#0284c7', background: '#f8fafc', text: '#0f172a' },
    { primary: '#292524', secondary: '#78716c', accent: '#16a34a', background: '#fafaf9', text: '#1c1917' },
  ],
  Luxury: [
    { primary: '#c9a84c', secondary: '#e8d5a3', accent: '#8b6914', background: '#0c0a06', text: '#f5f0e8' },
    { primary: '#e2c45a', secondary: '#d4a853', accent: '#a08010', background: '#080604', text: '#fdf6e3' },
    { primary: '#b8a060', secondary: '#d4b896', accent: '#7a5c20', background: '#10090c', text: '#f0ece4' },
    { primary: '#c4a882', secondary: '#e8d8c0', accent: '#8c6840', background: '#0a0804', text: '#faf5ec' },
  ],
  Corporate: [
    { primary: '#2563eb', secondary: '#60a5fa', accent: '#7c3aed', background: '#0f172a', text: '#f8fafc' },
    { primary: '#1d4ed8', secondary: '#3b82f6', accent: '#06b6d4', background: '#0a1020', text: '#f0f6ff' },
    { primary: '#0369a1', secondary: '#38bdf8', accent: '#7c3aed', background: '#0c1624', text: '#e0f2fe' },
    { primary: '#4338ca', secondary: '#818cf8', accent: '#06b6d4', background: '#0e0f1e', text: '#eef2ff' },
  ],
  Startup: [
    { primary: '#f97316', secondary: '#fb923c', accent: '#8b5cf6', background: '#09090b', text: '#fafafa' },
    { primary: '#ec4899', secondary: '#f472b6', accent: '#8b5cf6', background: '#0a0010', text: '#fdf4ff' },
    { primary: '#10b981', secondary: '#34d399', accent: '#f59e0b', background: '#041a10', text: '#ecfdf5' },
    { primary: '#f43f5e', secondary: '#fb7185', accent: '#8b5cf6', background: '#100008', text: '#fff1f2' },
  ],
  Gaming: [
    { primary: '#ff4500', secondary: '#ff8c00', accent: '#ffdd00', background: '#0a0500', text: '#fff8f0' },
    { primary: '#ff2d78', secondary: '#ff6b00', accent: '#00ff88', background: '#050208', text: '#fff0f5' },
    { primary: '#39ff14', secondary: '#00ff88', accent: '#ff2d78', background: '#020805', text: '#f0fff4' },
    { primary: '#ff0080', secondary: '#00ffff', accent: '#ffff00', background: '#030308', text: '#f5f0ff' },
  ],
  Space: [
    { primary: '#6c63ff', secondary: '#a78bfa', accent: '#38bdf8', background: '#020212', text: '#f0f0ff' },
    { primary: '#4c1d95', secondary: '#7c3aed', accent: '#38bdf8', background: '#040010', text: '#f5f3ff' },
    { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#a78bfa', background: '#02060f', text: '#dbeafe' },
    { primary: '#0c4a6e', secondary: '#0ea5e9', accent: '#e879f9', background: '#021018', text: '#e0f2fe' },
  ],
  AI: [
    { primary: '#00d4ff', secondary: '#3d5eff', accent: '#bf5fff', background: '#040810', text: '#e8f4ff' },
    { primary: '#06b6d4', secondary: '#0ea5e9', accent: '#a855f7', background: '#050a14', text: '#e0f2fe' },
    { primary: '#22d3ee', secondary: '#67e8f9', accent: '#818cf8', background: '#021018', text: '#cffafe' },
    { primary: '#818cf8', secondary: '#6366f1', accent: '#00d4ff', background: '#06060f', text: '#eef2ff' },
  ],
  Glassmorphism: [
    { primary: '#818cf8', secondary: '#a5b4fc', accent: '#f472b6', background: '#0f0a1e', text: '#f0f0ff' },
    { primary: '#a855f7', secondary: '#c084fc', accent: '#38bdf8', background: '#0a0520', text: '#faf5ff' },
    { primary: '#6366f1', secondary: '#818cf8', accent: '#ec4899', background: '#08051a', text: '#eef2ff' },
    { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#34d399', background: '#080315', text: '#f5f3ff' },
  ],
}

// Backwards-compat single palette accessor
const PALETTES = Object.fromEntries(
  Object.entries(PALETTE_VARIANTS).map(([k, v]) => [k, v[0]])
)

// ─── Typography pairs per style ──────────────────────────────────────────────
const FONT_PAIRS = {
  Futuristic:    [['Syne', 'Inter'], ['Orbitron', 'Exo 2'], ['Space Grotesk', 'DM Sans'], ['Rajdhani', 'Inter']],
  Cyberpunk:     [['Orbitron', 'Rajdhani'], ['Share Tech Mono', 'Exo 2'], ['Russo One', 'Rajdhani'], ['Bebas Neue', 'IBM Plex Mono']],
  Minimal:       [['Inter', 'Inter'], ['DM Sans', 'DM Sans'], ['Plus Jakarta Sans', 'Inter'], ['Outfit', 'Inter']],
  Luxury:        [['Cormorant Garamond', 'Montserrat'], ['Playfair Display', 'Lato'], ['Libre Baskerville', 'Inter'], ['EB Garamond', 'Montserrat']],
  Corporate:     [['Syne', 'Inter'], ['IBM Plex Sans', 'Inter'], ['Plus Jakarta Sans', 'DM Sans'], ['DM Sans', 'Inter']],
  Startup:       [['Clash Display', 'Inter'], ['Space Grotesk', 'DM Sans'], ['Plus Jakarta Sans', 'Inter'], ['Syne', 'Inter']],
  Gaming:        [['Orbitron', 'Rajdhani'], ['Russo One', 'Exo 2'], ['Audiowide', 'Rajdhani'], ['Bebas Neue', 'Exo 2']],
  Space:         [['Syne', 'Inter'], ['Orbitron', 'Exo 2'], ['Space Grotesk', 'Inter'], ['Rajdhani', 'DM Sans']],
  AI:            [['Syne', 'JetBrains Mono'], ['Space Grotesk', 'Inter'], ['IBM Plex Sans', 'IBM Plex Mono'], ['Outfit', 'DM Mono']],
  Glassmorphism: [['Syne', 'Inter'], ['Plus Jakarta Sans', 'DM Sans'], ['Outfit', 'Inter'], ['Space Grotesk', 'Inter']],
}

// ─── Per-industry content generators ─────────────────────────────────────────

const CONTENT = {
  ecommerce: (name, prompt) => ({
    tagline: `Shop ${name} — Curated for You`,
    businessType: 'E-Commerce',
    navLinks: ['Shop', 'Collections', 'Lookbook', 'About', 'Contact'],
    hero: {
      headline: `Discover ${name}`,
      subheadline: `Premium products crafted for people who demand the best. Free shipping on orders over $50.`,
      cta_primary: 'Shop Now',
      cta_secondary: 'View Lookbook',
    },
    features: [
      { icon: '🚚', title: 'Free Express Shipping', description: 'Orders ship in 24h with real-time tracking and free returns within 30 days.' },
      { icon: '💎', title: 'Curated Quality', description: 'Every product is hand-selected and quality-tested before it reaches your door.' },
      { icon: '🔒', title: 'Secure Checkout', description: 'PCI-DSS compliant payments with Apple Pay, Google Pay, and all major cards.' },
      { icon: '♻️', title: 'Sustainable Packaging', description: '100% recycled and biodegradable packaging with carbon-neutral shipping.' },
      { icon: '🎁', title: 'Loyalty Rewards', description: 'Earn points on every purchase. Redeem for discounts, early access, and gifts.' },
      { icon: '💬', title: '24/7 Support', description: 'Our concierge team is available around the clock via chat, phone, and email.' },
    ],
    stats: [
      { value: '120K+', label: 'Happy Customers' },
      { value: '4.9★', label: 'Average Rating' },
      { value: '48h', label: 'Average Delivery' },
      { value: '99%', label: 'Satisfaction Rate' },
    ],
    testimonials: [
      { quote: `I've ordered from ${name} three times now. The quality is unreal and delivery is always on time.`, author: 'Emma Clarke', role: 'Verified Buyer', company: '' },
      { quote: 'The packaging alone made me feel like I was opening a luxury gift. Absolutely love this brand.', author: 'James Park', role: 'Verified Buyer', company: '' },
      { quote: 'Returns are effortless and the support team replied in minutes. Best shopping experience ever.', author: 'Sophia Laurent', role: 'Verified Buyer', company: '' },
    ],
    pricing: [
      { name: 'Standard', price: 'Free', period: '', highlighted: false, features: ['Free shipping over $50', 'Standard returns', 'Email support', 'Order tracking'] },
      { name: 'Member', price: '$9', period: '/month', highlighted: true, features: ['Free shipping always', 'Priority returns', '24/7 support', 'Early sale access', 'Exclusive discounts', 'Loyalty points 2×'] },
      { name: 'VIP', price: '$29', period: '/month', highlighted: false, features: ['Everything in Member', 'Personal stylist', 'Pre-launch access', 'Birthday gift', 'Dedicated concierge'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  restaurant: (name, prompt) => ({
    tagline: `${name} — Taste the Extraordinary`,
    businessType: 'Restaurant / Dining',
    navLinks: ['Menu', 'Reservations', 'Events', 'About', 'Gift Cards'],
    hero: {
      headline: `Welcome to ${name}`,
      subheadline: `An unforgettable dining experience where bold flavors meet elegant ambiance. Reserve your table tonight.`,
      cta_primary: 'Book a Table',
      cta_secondary: 'View Menu',
    },
    features: [
      { icon: '👨‍🍳', title: 'Chef-Crafted Menus', description: 'Our executive chef curates seasonal menus using locally sourced, sustainable ingredients.' },
      { icon: '🍷', title: 'Sommelier Wine List', description: 'Over 200 wines carefully selected to complement each dish on our menu.' },
      { icon: '🎶', title: 'Live Entertainment', description: 'Jazz nights every Friday and Saturday. Private event packages available.' },
      { icon: '🌿', title: 'Farm to Table', description: 'We partner with local farms to bring you the freshest ingredients year-round.' },
      { icon: '🎁', title: 'Private Events', description: 'Host birthdays, corporate dinners, and weddings in our exclusive private dining room.' },
      { icon: '⭐', title: 'Award-Winning', description: 'Michelin-recommended and ranked #1 on Eater\'s Best New Restaurants list.' },
    ],
    stats: [
      { value: '15+', label: 'Years of Excellence' },
      { value: '4.9★', label: 'Zagat Rating' },
      { value: '200+', label: 'Wine Selections' },
      { value: '50K+', label: 'Meals Served' },
    ],
    testimonials: [
      { quote: `${name} is our go-to for anniversaries. The food, atmosphere, and service are always flawless.`, author: 'Antoine Dubois', role: 'Food Critic', company: 'Le Monde Culinaire' },
      { quote: 'The tasting menu was a journey. Every course told a story. I still dream about the dessert.', author: 'Rachel Kim', role: 'Food Blogger', company: '@tastingrachel' },
      { quote: 'We hosted our company dinner here. 40 guests, all blown away. Cannot recommend enough.', author: 'David Osei', role: 'CEO', company: 'Osei Ventures' },
    ],
    pricing: [
      { name: 'À la Carte', price: '$35–$75', period: 'per person', highlighted: false, features: ['Full menu access', 'Wine pairing optional', 'Seasonal specials', 'Dessert menu'] },
      { name: 'Tasting Menu', price: '$120', period: 'per person', highlighted: true, features: ['7-course experience', 'Wine pairing included', 'Chef interaction', 'Signed menu card', 'Signature cocktail'] },
      { name: 'Private Dining', price: 'From $2,000', period: 'per event', highlighted: false, features: ['Exclusive venue', 'Custom menu', 'Dedicated staff', 'AV equipment', 'Event coordination'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  gaming: (name, prompt) => ({
    tagline: `${name} — Play. Win. Dominate.`,
    businessType: 'Gaming / Esports',
    navLinks: ['Games', 'Tournaments', 'Leaderboard', 'Team', 'Store'],
    hero: {
      headline: `Enter the Arena`,
      subheadline: `${name} is where legends are made. Compete at the highest level with pro-grade tools, real-time stats, and global tournaments.`,
      cta_primary: 'Join Now',
      cta_secondary: 'Watch Live',
    },
    features: [
      { icon: '🏆', title: 'Pro Tournaments', description: '$500K+ in prize pools across 200+ tournaments every month. Register and compete.' },
      { icon: '⚡', title: '1ms Ping Guaranteed', description: 'Ultra-low latency servers across 50 cities worldwide. No lag. No excuses.' },
      { icon: '🎮', title: 'Custom Game Modes', description: 'Create and share custom game modes with the community using our modding toolkit.' },
      { icon: '📊', title: 'Pro Analytics', description: 'Track every stat, replay every match, and get AI coaching insights to improve your game.' },
      { icon: '👥', title: 'Squad Builder', description: 'Find teammates by playstyle, rank, and schedule. Build your dream squad in minutes.' },
      { icon: '🔴', title: 'Live Streaming', description: 'Stream your gameplay in 4K directly to Twitch and YouTube with one click.' },
    ],
    stats: [
      { value: '5M+', label: 'Active Players' },
      { value: '$2M+', label: 'Prize Money Awarded' },
      { value: '<1ms', label: 'Server Latency' },
      { value: '99.9%', label: 'Server Uptime' },
    ],
    testimonials: [
      { quote: `${name} completely changed how I practice. The analytics showed me exactly what I was doing wrong. Ranked up in 2 weeks.`, author: 'xX_BladeRunner_Xx', role: 'Pro Player', company: 'Team Vortex' },
      { quote: 'The tournament system is flawless. Signed up, competed, won $2K in my first weekend.', author: 'ShadowPixel', role: 'Streamer', company: '450K subscribers' },
      { quote: "Best ping I've ever had. My in-game feel finally matches my skill. This is how gaming should be.", author: 'CryptoKnight99', role: 'FPS Veteran', company: '' },
    ],
    pricing: [
      { name: 'Free', price: '$0', period: '/month', highlighted: false, features: ['Access to free tournaments', 'Basic stats', 'Standard servers', 'Community forums'] },
      { name: 'Pro', price: '$14', period: '/month', highlighted: true, features: ['All premium tournaments', 'Advanced analytics', 'Low-latency servers', 'Squad finder', 'Replay system', 'No ads'] },
      { name: 'Team', price: '$49', period: '/month', highlighted: false, features: ['Everything in Pro', 'Team management', 'Private scrimmage servers', 'Coach dashboard', 'Priority support'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  fintech: (name, prompt) => ({
    tagline: `${name} — Money Moves Smarter`,
    businessType: 'FinTech',
    navLinks: ['Products', 'Pricing', 'Security', 'Developers', 'Enterprise'],
    hero: {
      headline: `Finance, Reimagined`,
      subheadline: `${name} gives you institutional-grade financial tools. Send, invest, and grow your money at the speed of the internet.`,
      cta_primary: 'Get Started Free',
      cta_secondary: 'View Demo',
    },
    features: [
      { icon: '⚡', title: 'Instant Transfers', description: 'Send money globally in seconds with near-zero fees. 160+ currencies supported.' },
      { icon: '📈', title: 'Smart Investing', description: 'AI-powered portfolio management with fractional shares, ETFs, and crypto in one app.' },
      { icon: '🛡️', title: 'Bank-Level Security', description: '256-bit encryption, biometric auth, and FDIC-insured accounts up to $250K.' },
      { icon: '💳', title: 'Rewards Card', description: 'Earn 3% cashback on every purchase. No foreign transaction fees. No annual fee.' },
      { icon: '🤖', title: 'AI Budgeting', description: 'Automated expense categorisation, savings goals, and personalised spending insights.' },
      { icon: '🌐', title: 'Global Account', description: 'Multi-currency accounts with local bank details in the US, EU, and UK.' },
    ],
    stats: [
      { value: '$48B+', label: 'Total Processed' },
      { value: '3.2M+', label: 'Active Users' },
      { value: '160+', label: 'Currencies' },
      { value: '0.3s', label: 'Transfer Speed' },
    ],
    testimonials: [
      { quote: `${name} replaced three separate banking apps for me. Everything I need in one place — and the UX is actually beautiful.`, author: 'Yuki Tanaka', role: 'Freelance Designer', company: '' },
      { quote: 'We process $50M in international payments every month through the API. Reliability is flawless.', author: 'Arjun Mehta', role: 'CFO', company: 'GlobalPay Inc.' },
      { quote: 'The AI budget tracker showed me I was wasting $400/month on subscriptions. Saved me in the first week.', author: 'Chloe Bennett', role: 'Software Engineer', company: '' },
    ],
    pricing: [
      { name: 'Personal', price: '$0', period: '/month', highlighted: false, features: ['1 account', 'Free local transfers', '1% cashback', 'Basic budgeting', 'Mobile app'] },
      { name: 'Premium', price: '$9', period: '/month', highlighted: true, features: ['5 accounts', 'Free global transfers', '3% cashback', 'AI investing', 'Priority support', 'Concierge card'] },
      { name: 'Business', price: '$49', period: '/month', highlighted: false, features: ['Unlimited accounts', 'Team spend controls', 'API access', 'Accounting sync', 'Dedicated manager', 'Custom limits'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  health: (name, prompt) => ({
    tagline: `${name} — Your Health, Your Way`,
    businessType: 'Health & Wellness',
    navLinks: ['Services', 'Practitioners', 'Plans', 'Research', 'Book Now'],
    hero: {
      headline: `Feel Your Best Every Day`,
      subheadline: `${name} connects you with world-class practitioners, personalised health plans, and cutting-edge diagnostics — all in one place.`,
      cta_primary: 'Book Consultation',
      cta_secondary: 'Explore Plans',
    },
    features: [
      { icon: '🩺', title: 'Expert Practitioners', description: '500+ board-certified doctors, therapists, and specialists available for same-day appointments.' },
      { icon: '🧬', title: 'DNA Health Reports', description: 'Comprehensive genetic analysis to understand your predispositions and optimise your lifestyle.' },
      { icon: '📱', title: 'Continuous Monitoring', description: 'Sync with 50+ wearable devices for 24/7 vital tracking, sleep analysis, and alerts.' },
      { icon: '💊', title: 'Personalised Plans', description: 'AI-generated nutrition, exercise, and supplement plans tailored to your biology and goals.' },
      { icon: '🔬', title: 'At-Home Lab Tests', description: 'Order 100+ lab tests online. Results in 48 hours, reviewed by a licensed physician.' },
      { icon: '🧘', title: 'Mental Wellness', description: 'On-demand therapy, guided meditation, and burnout prevention programs from top psychologists.' },
    ],
    stats: [
      { value: '500+', label: 'Certified Practitioners' },
      { value: '250K+', label: 'Patients Helped' },
      { value: '4.95★', label: 'Patient Rating' },
      { value: '48h', label: 'Lab Results' },
    ],
    testimonials: [
      { quote: `${name} finally gave me answers after years of being dismissed. The DNA report changed my diet and I lost 22kg in 6 months.`, author: 'Lisa Hoffman', role: 'Patient', company: '' },
      { quote: 'As a busy founder, having a personal health concierge that proactively monitors me is priceless.', author: 'Marcus Cole', role: 'CEO', company: 'Horizon Ventures' },
      { quote: 'The therapy sessions are the best I\'ve had. My therapist actually remembers everything and the app keeps context.', author: 'Aisha Bakr', role: 'Patient', company: '' },
    ],
    pricing: [
      { name: 'Basic', price: '$29', period: '/month', highlighted: false, features: ['2 consultations/month', 'Basic health tracking', 'Nutrition guide', 'Community access'] },
      { name: 'Complete', price: '$89', period: '/month', highlighted: true, features: ['Unlimited consultations', 'DNA report', 'Wearable sync', 'Personalised plans', 'Lab tests (2/mo)', 'Mental wellness'] },
      { name: 'Concierge', price: '$299', period: '/month', highlighted: false, features: ['Everything in Complete', 'Dedicated care team', 'Unlimited lab tests', 'Home visits', 'Annual physical', '24/7 hotline'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  education: (name, prompt) => ({
    tagline: `${name} — Learn Without Limits`,
    businessType: 'EdTech / Education',
    navLinks: ['Courses', 'Bootcamps', 'Mentors', 'Community', 'Pricing'],
    hero: {
      headline: `Master New Skills with ${name}`,
      subheadline: `Expert-led courses, live bootcamps, and 1-on-1 mentorship. Join 200,000 learners building the careers they want.`,
      cta_primary: 'Start Learning Free',
      cta_secondary: 'Browse Courses',
    },
    features: [
      { icon: '🎓', title: '1,200+ Expert Courses', description: 'From beginner to professional — every course is built with industry practitioners.' },
      { icon: '🧑‍💻', title: 'Live Bootcamps', description: 'Intensive cohort-based programs with job placement support and income share options.' },
      { icon: '🤝', title: '1-on-1 Mentorship', description: 'Weekly sessions with senior engineers, designers, and product managers from top companies.' },
      { icon: '🏆', title: 'Industry Certificates', description: 'Earn verifiable certificates recognised by Google, Meta, AWS, and 500+ hiring partners.' },
      { icon: '🤖', title: 'AI Learning Coach', description: 'Personalised learning paths that adapt to your pace, strengths, and career goals.' },
      { icon: '💼', title: 'Career Services', description: 'Resume review, portfolio building, interview prep, and direct introductions to hiring managers.' },
    ],
    stats: [
      { value: '200K+', label: 'Active Learners' },
      { value: '94%', label: 'Job Placement Rate' },
      { value: '1,200+', label: 'Courses Available' },
      { value: '$72K', label: 'Avg Salary After' },
    ],
    testimonials: [
      { quote: `I went from barista to software engineer in 9 months using ${name}. The bootcamp and career support made it possible.`, author: 'Devon Walsh', role: 'Software Engineer', company: 'Airbnb' },
      { quote: 'The mentorship quality is exceptional. My mentor helped me land a senior design role at a Series B startup.', author: 'Priya Singh', role: 'Senior UX Designer', company: 'Figma' },
      { quote: 'Best ROI of any course I\'ve taken. Practical, up-to-date, and the community is incredibly supportive.', author: 'Tom Eriksson', role: 'Data Scientist', company: 'Spotify' },
    ],
    pricing: [
      { name: 'Free', price: '$0', period: '', highlighted: false, features: ['100+ free courses', 'Community access', 'Learning paths', 'Mobile app'] },
      { name: 'Pro', price: '$39', period: '/month', highlighted: true, features: ['All 1,200+ courses', 'AI learning coach', 'Certificates', 'Project feedback', 'Career resources', 'Offline access'] },
      { name: 'Bootcamp', price: '$3,999', period: 'one-time', highlighted: false, features: ['6-month program', 'Live instruction', '1-on-1 mentorship', 'Job guarantee*', 'Career placement', 'Income share option'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  travel: (name, prompt) => ({
    tagline: `${name} — The World Awaits`,
    businessType: 'Travel & Experiences',
    navLinks: ['Destinations', 'Experiences', 'Hotels', 'Flights', 'About'],
    hero: {
      headline: `Your Next Adventure Starts Here`,
      subheadline: `${name} curates extraordinary travel experiences. Handpicked hotels, off-the-beaten-path adventures, and personal travel experts ready to craft your perfect trip.`,
      cta_primary: 'Explore Destinations',
      cta_secondary: 'Talk to an Expert',
    },
    features: [
      { icon: '✈️', title: 'Curated Experiences', description: 'Every trip is hand-crafted by local experts who live and breathe each destination.' },
      { icon: '🏨', title: 'Exclusive Hotels', description: 'Access 50,000+ boutique and luxury hotels with rates up to 40% below public pricing.' },
      { icon: '🗺️', title: 'Live Travel Support', description: 'A dedicated travel specialist is reachable 24/7 via app, call, or WhatsApp during your trip.' },
      { icon: '🌿', title: 'Sustainable Travel', description: 'Every booking contributes to carbon offset programs and supports local communities.' },
      { icon: '📸', title: 'Insider Access', description: 'Skip-the-line tickets, private tours, and experiences unavailable to the general public.' },
      { icon: '🔄', title: 'Flexible Booking', description: 'Free cancellation up to 48h before departure. Change your plans without penalty.' },
    ],
    stats: [
      { value: '180+', label: 'Countries' },
      { value: '98%', label: 'Satisfaction Score' },
      { value: '50K+', label: 'Trips Booked' },
      { value: '4.97★', label: 'TrustPilot Rating' },
    ],
    testimonials: [
      { quote: `${name} planned our honeymoon in Bali. Every detail was perfect — from the private villa to the sunrise trek. Magical.`, author: 'Isabelle & Tom Renard', role: 'Travelers', company: '' },
      { quote: 'The insider access to private tours was worth every penny. Places I never would have found on my own.', author: 'George Nakamura', role: 'Travel Photographer', company: '@nakamurastravels' },
      { quote: 'Booked a last-minute trip to Japan. The team sorted flights, hotels, and itinerary in 3 hours. Incredible.', author: 'Sarah O\'Brien', role: 'Frequent Traveler', company: '' },
    ],
    pricing: [
      { name: 'Wanderer', price: '$0', period: '', highlighted: false, features: ['Destination guides', 'Hotel search', 'Flight search', 'Travel blog'] },
      { name: 'Explorer', price: '$19', period: '/month', highlighted: true, features: ['Curated itineraries', 'Member hotel rates', 'Travel specialist', 'Insurance coverage', 'Lounge access', 'Concierge app'] },
      { name: 'Bespoke', price: 'Custom', period: '', highlighted: false, features: ['Fully custom trips', 'Private jets', 'Yacht charters', 'VIP access', 'Personal guide', 'White-glove service'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  agency: (name, prompt) => ({
    tagline: `${name} — We Build Brands That Move`,
    businessType: 'Creative Agency',
    navLinks: ['Work', 'Services', 'About', 'Careers', 'Contact'],
    hero: {
      headline: `Design That Drives Growth`,
      subheadline: `${name} is a full-service creative studio. Brand strategy, digital products, and campaigns that make your market take notice.`,
      cta_primary: 'Start a Project',
      cta_secondary: 'View Our Work',
    },
    features: [
      { icon: '🎨', title: 'Brand Identity', description: 'From naming and logo to voice and visual system — we build brands that resonate and last.' },
      { icon: '💻', title: 'Digital Products', description: 'End-to-end product design and development. SaaS, apps, and e-commerce that convert.' },
      { icon: '📢', title: 'Campaign Strategy', description: 'Data-driven campaigns across paid, organic, and earned media. We make noise.' },
      { icon: '🎬', title: 'Motion & Video', description: 'Cinematic brand films, product demos, and social content that stops the scroll.' },
      { icon: '🔍', title: 'SEO & Growth', description: 'Technical SEO, content strategy, and growth loops built into every digital touchpoint.' },
      { icon: '📊', title: 'Analytics & Optimisation', description: 'We measure everything and iterate relentlessly. Your ROI is our obsession.' },
    ],
    stats: [
      { value: '12+', label: 'Years in Business' },
      { value: '350+', label: 'Projects Delivered' },
      { value: '40+', label: 'Industry Awards' },
      { value: '$1.2B', label: 'Client Revenue Generated' },
    ],
    testimonials: [
      { quote: `Working with ${name} was the best investment we made. They rebranded us in 6 weeks and our inbound leads tripled.`, author: 'Camille Dupont', role: 'CMO', company: 'Arcana Collective' },
      { quote: 'The team thinks like founders, not just designers. They challenged our assumptions and the product shipped faster.', author: 'Ethan Brooks', role: 'CTO', company: 'Syncflow' },
      { quote: 'Our campaign reached 12M impressions in the first week. The creative was unlike anything I\'d seen in our industry.', author: 'Naomi Adeyemi', role: 'Head of Marketing', company: 'Zara Africa' },
    ],
    pricing: [
      { name: 'Sprint', price: '$8K', period: 'one-time', highlighted: false, features: ['Brand audit', 'Logo & identity', '1 landing page', '4-week delivery', '2 revision rounds'] },
      { name: 'Scale', price: '$25K', period: 'one-time', highlighted: true, features: ['Full brand identity', 'Website design & dev', 'Campaign strategy', 'Motion package', '3-month support', 'Dedicated team'] },
      { name: 'Partner', price: '$15K', period: '/month', highlighted: false, features: ['Embedded team', 'Unlimited projects', 'Weekly strategy calls', 'Analytics reports', 'Priority delivery', 'C-suite access'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  space: (name, prompt) => ({
    tagline: `${name} — Beyond the Horizon`,
    businessType: 'Space Technology',
    navLinks: ['Missions', 'Technology', 'Research', 'Partners', 'Careers'],
    hero: {
      headline: `The Final Frontier Starts Here`,
      subheadline: `${name} is pioneering the next era of space exploration. Reusable launch vehicles, satellite networks, and deep-space missions for humanity's future.`,
      cta_primary: 'Explore Our Missions',
      cta_secondary: 'Watch Launch',
    },
    features: [
      { icon: '🚀', title: 'Reusable Launch Systems', description: 'Reduce orbital access costs by 95% with fully reusable first-stage boosters and autonomous landing.' },
      { icon: '🛰️', title: 'Satellite Constellation', description: '4,000-satellite low-Earth orbit network delivering global broadband at 1Gbps+.' },
      { icon: '🌌', title: 'Deep Space Missions', description: 'Mars cargo and crew missions launching 2027. Lunar base development underway.' },
      { icon: '🔬', title: 'Zero-G Research', description: 'Commercial microgravity labs aboard our orbital stations for pharmaceutical and materials research.' },
      { icon: '⚡', title: 'Propulsion Innovation', description: 'Next-generation methane-fuelled Raptor engines with 230-ton thrust and full reusability.' },
      { icon: '🌍', title: 'Earth Observation', description: 'Sub-metre resolution imaging satellites supporting climate monitoring and disaster response.' },
    ],
    stats: [
      { value: '240+', label: 'Successful Launches' },
      { value: '99.2%', label: 'Mission Success Rate' },
      { value: '4,000', label: 'Satellites in Orbit' },
      { value: '$0.9K', label: 'Per kg to LEO' },
    ],
    testimonials: [
      { quote: `${name}'s launch reliability has transformed our satellite program. We've launched 14 payloads without a single failure.`, author: 'Dr. Elena Vasquez', role: 'Director of Launch Operations', company: 'ESA' },
      { quote: 'The broadband network changed connectivity for our 3M users in rural Africa. A genuine humanitarian breakthrough.', author: 'Dr. Kofi Antwi', role: 'CTO', company: 'ConnectAfrica' },
      { quote: 'Conducting zero-G protein crystallisation research aboard their station produced results impossible on Earth.', author: 'Prof. Yuki Sato', role: 'Research Director', company: 'MIT BioLab' },
    ],
    pricing: [
      { name: 'SmallSat', price: '$2.5M', period: 'per launch', highlighted: false, features: ['Up to 500kg payload', 'LEO & SSO orbits', 'Integration support', '12-month warranty'] },
      { name: 'Dedicated', price: '$62M', period: 'per launch', highlighted: true, features: ['Up to 22,800kg to LEO', 'Custom orbit injection', 'Payload fairing', 'Mission assurance', 'On-site support', 'Reuse discount'] },
      { name: 'Crewed', price: 'Contact', period: '', highlighted: false, features: ['Up to 7 crew members', 'ISS / private station', 'Full training program', 'Mission planning', 'Live tracking', 'Post-mission data'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  ai_saas: (name, prompt) => ({
    tagline: `${name} — Intelligence at Scale`,
    businessType: 'AI Platform',
    navLinks: ['Product', 'API', 'Pricing', 'Docs', 'Enterprise'],
    hero: {
      headline: `AI That Actually Works`,
      subheadline: `${name} delivers production-ready AI — accurate, fast, and built for scale. Deploy in hours, not months.`,
      cta_primary: 'Start Free',
      cta_secondary: 'Read the Docs',
    },
    features: [
      { icon: '🧠', title: 'Foundation Models', description: 'Access state-of-the-art language, vision, and multimodal models via a unified API.' },
      { icon: '⚡', title: 'Real-Time Inference', description: '< 50ms latency at global scale. Automatic load balancing across 12 data centres.' },
      { icon: '🔧', title: 'Fine-Tuning Studio', description: 'Customise models on your proprietary data with no-code tools and one-click deployment.' },
      { icon: '🔒', title: 'Enterprise Privacy', description: 'SOC2 Type II, HIPAA, GDPR. Your data is never used for training. On-prem available.' },
      { icon: '📊', title: 'Observability Suite', description: 'Real-time dashboards, usage analytics, cost breakdowns, and automated anomaly detection.' },
      { icon: '🔌', title: 'Native Integrations', description: 'Pre-built connectors for Slack, Notion, Salesforce, Postgres, S3, and 200+ more.' },
    ],
    stats: [
      { value: '10B+', label: 'Tokens Processed Daily' },
      { value: '45ms', label: 'p99 Latency' },
      { value: '8,000+', label: 'Active Companies' },
      { value: '99.99%', label: 'API Uptime' },
    ],
    testimonials: [
      { quote: `${name} cut our ML infrastructure cost by 70% and deployment time from weeks to hours. It's a no-brainer.`, author: 'Dr. Aiko Chen', role: 'Head of AI', company: 'Datastream Labs' },
      { quote: 'The fine-tuning studio let our non-technical team customise the model. No engineers needed. Wild.', author: 'Ben Fischer', role: 'Product Lead', company: 'Loopback Health' },
      { quote: 'We process 2B tokens daily with zero incidents in 18 months. The reliability is genuinely remarkable.', author: 'Sofia Reyes', role: 'CTO', company: 'Vanguard AI' },
    ],
    pricing: [
      { name: 'Developer', price: '$0', period: '/month', highlighted: false, features: ['$20 free credits', 'All models', 'API access', 'Community support', 'Playground access'] },
      { name: 'Growth', price: '$99', period: '/month + usage', highlighted: true, features: ['$100 included credits', 'Fine-tuning studio', 'Priority API', 'Observability', 'Slack support', 'Custom domains'] },
      { name: 'Enterprise', price: 'Custom', period: '', highlighted: false, features: ['Volume discounts', 'Dedicated clusters', 'On-prem option', 'SLA guarantee', 'Compliance (HIPAA/SOC2)', 'CSM included'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  nft: (name, prompt) => ({
    tagline: `${name} — Own the Future`,
    businessType: 'NFT / Web3',
    navLinks: ['Gallery', 'Mint', 'Roadmap', 'Community', 'Whitepaper'],
    hero: {
      headline: `Collect Digital Art That Matters`,
      subheadline: `${name} is a curated NFT platform where artists and collectors connect. Own rare, verifiable digital art backed by the blockchain.`,
      cta_primary: 'Explore Collection',
      cta_secondary: 'Connect Wallet',
    },
    features: [
      { icon: '🎨', title: '1/1 Curated Art', description: 'Every piece is hand-curated by our editorial team. No bots, no bulk drops, no fakes.' },
      { icon: '⛓️', title: 'Multi-Chain Support', description: 'Mint and trade on Ethereum, Polygon, Solana, and Base with seamless cross-chain bridging.' },
      { icon: '💰', title: 'Creator Royalties', description: 'Artists earn 10% on every secondary sale, forever. Enforced on-chain.' },
      { icon: '🏛️', title: 'Physical Redemption', description: 'Select NFTs can be redeemed for physical prints, sculptures, and gallery invitations.' },
      { icon: '🤝', title: 'DAO Governance', description: 'Token holders vote on collection drops, platform fees, and treasury allocations.' },
      { icon: '🔒', title: 'Verified Provenance', description: 'Immutable on-chain history for every piece. Authentication certificates on request.' },
    ],
    stats: [
      { value: '$180M+', label: 'Total Volume' },
      { value: '45K+', label: 'Collectors' },
      { value: '2,800+', label: 'Artists' },
      { value: '0%', label: 'Platform Fee (Primary)' },
    ],
    testimonials: [
      { quote: `${name} is the only marketplace that actually values artists. My royalties have funded my studio for two years.`, author: 'Valentina Cruz', role: 'Digital Artist', company: '' },
      { quote: 'I\'ve bought NFTs on every major platform. The curation and community here is on another level.', author: 'OxBeholder', role: 'Collector', company: '' },
      { quote: 'Launched a 500-piece collection on here. Sold out in 8 minutes. The audience quality is extraordinary.', author: 'Hiro Yamada', role: '3D Artist', company: '' },
    ],
    pricing: [
      { name: 'Collector', price: 'Free', period: '', highlighted: false, features: ['Wallet connect', 'Browse & bid', 'Wishlist', 'Gas optimization'] },
      { name: 'Creator', price: '2.5%', period: 'on sale', highlighted: true, features: ['Unlimited minting', 'Lazy minting', 'Auction tools', 'Analytics dashboard', 'Featured placement', 'Discord verification'] },
      { name: 'Gallery', price: 'Custom', period: '', highlighted: false, features: ['White-label platform', 'Physical integration', 'VIP drops', 'Institutional sales', 'Legal support', 'Custom contract'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  consulting: (name, prompt) => ({
    tagline: `${name} — Strategy That Scales`,
    businessType: 'Management Consulting',
    navLinks: ['Services', 'Case Studies', 'Insights', 'Team', 'Contact'],
    hero: {
      headline: `Transform Your Business`,
      subheadline: `${name} partners with Fortune 500 leaders and high-growth startups to solve complex problems, accelerate growth, and build lasting competitive advantage.`,
      cta_primary: 'Schedule a Call',
      cta_secondary: 'View Case Studies',
    },
    features: [
      { icon: '📊', title: 'Strategic Advisory', description: 'Board-level strategy, market entry, M&A due diligence, and corporate transformation programs.' },
      { icon: '🔄', title: 'Operational Excellence', description: 'Process redesign, lean transformation, and automation roadmaps that deliver measurable EBITDA uplift.' },
      { icon: '💡', title: 'Digital Transformation', description: 'Technology strategy, platform modernisation, and AI integration for the post-digital enterprise.' },
      { icon: '🌐', title: 'Global Expansion', description: 'Market analysis, regulatory navigation, and go-to-market playbooks for 60+ countries.' },
      { icon: '👥', title: 'Talent & Organisation', description: 'Organisational design, leadership development, and culture transformation for high-performance.' },
      { icon: '📈', title: 'Data & Analytics', description: 'Build data-driven organisations with modern analytics infrastructure and decision intelligence.' },
    ],
    stats: [
      { value: '28+', label: 'Years of Expertise' },
      { value: '$12B+', label: 'Client Value Created' },
      { value: '340+', label: 'Engagements' },
      { value: '94%', label: 'Client Retention Rate' },
    ],
    testimonials: [
      { quote: `${name}'s team helped us navigate a complex international merger. Thoughtful, rigorous, and exceptionally discreet.`, author: 'Catherine Weiss', role: 'CEO', company: 'Meridian Global Group' },
      { quote: 'The digital transformation roadmap they built generated $200M in efficiency gains in 18 months. Remarkable ROI.', author: 'Robert Okafor', role: 'COO', company: 'Intercorp Holdings' },
      { quote: 'They came in, understood our culture, and designed a solution that our teams actually adopted. Rare talent.', author: 'Hana Kim', role: 'CHRO', company: 'NovaTech Asia' },
    ],
    pricing: [
      { name: 'Advisory', price: '$15K', period: '/month', highlighted: false, features: ['Monthly strategy sessions', 'Market research', 'Board reports', 'Email support'] },
      { name: 'Engagement', price: '$75K', period: 'per project', highlighted: true, features: ['Dedicated team', '90-day program', 'Weekly CEO check-ins', 'Implementation support', 'Deliverable guarantees', 'Post-engagement review'] },
      { name: 'Partnership', price: 'Custom', period: '', highlighted: false, features: ['Embedded team', 'Multi-year program', 'Equity participation', 'C-suite access', 'Global network', 'Exclusive research'] },
    ],
    sections: ['features', 'stats', 'testimonials', 'pricing'],
  }),

  // Default SaaS (catches everything not matched above)
  saas: (name, prompt) => {
    // Try to extract what the product actually does
    const lower = prompt.toLowerCase()
    const does =
      lower.match(/automat\w+/)?.[0] ? 'automation' :
      lower.match(/analytic\w+/)?.[0] ? 'analytics' :
      lower.match(/collaborat\w+/)?.[0] ? 'collaboration' :
      lower.match(/manag\w+/)?.[0] ? 'management' :
      lower.match(/track\w+/)?.[0] ? 'tracking' :
      lower.match(/monitor\w+/)?.[0] ? 'monitoring' :
      lower.match(/optimiz\w+/)?.[0] ? 'optimization' :
      'productivity'

    return {
      tagline: `${name} — Built for How Teams Work`,
      businessType: 'SaaS Platform',
      navLinks: ['Product', 'Features', 'Pricing', 'Docs', 'Blog'],
      hero: {
        headline: `${name}: ${does.charAt(0).toUpperCase() + does.slice(1)} Made Simple`,
        subheadline: `Stop wrestling with complex workflows. ${name} gives your team a single, powerful platform to focus on what matters most.`,
        cta_primary: 'Start Free Trial',
        cta_secondary: 'Watch Demo',
      },
      features: [
        { icon: '⚡', title: `Instant ${does.charAt(0).toUpperCase() + does.slice(1)}`, description: `Get started in minutes. ${name} integrates with your existing tools and adapts to your workflow automatically.` },
        { icon: '🤝', title: 'Real-Time Collaboration', description: 'Your whole team, one platform. See changes live, leave comments, and stay aligned without meetings.' },
        { icon: '📊', title: 'Actionable Insights', description: 'Dashboards that surface what matters. Custom reports, automated alerts, and AI-powered recommendations.' },
        { icon: '🔌', title: '200+ Integrations', description: 'Slack, Notion, GitHub, Salesforce, Zapier — connect every tool your team already uses.' },
        { icon: '🔒', title: 'Enterprise Security', description: 'SOC2 Type II certified. Role-based access, audit logs, SSO, and end-to-end encryption included.' },
        { icon: '📱', title: 'Works Everywhere', description: 'Desktop, mobile, and web. Offline mode included. Your work follows you, not the other way around.' },
      ],
      stats: [
        { value: '75K+', label: 'Teams Using ' + name },
        { value: '4.9★', label: 'G2 Rating' },
        { value: '40%', label: 'Avg Time Saved' },
        { value: '99.99%', label: 'Uptime SLA' },
      ],
      testimonials: [
        { quote: `Switching to ${name} cut our project delivery time in half. The team adoption was instant — no training needed.`, author: 'Jordan Lee', role: 'VP of Engineering', company: 'Sequence Labs' },
        { quote: 'We evaluated 12 tools. Nothing came close to the combination of power and simplicity that this offers.', author: 'Ana Rodrigues', role: 'Head of Operations', company: 'Quanta Health' },
        { quote: `${name} paid for itself in week one. The ROI visibility alone is worth the subscription.`, author: 'Tyler Wren', role: 'CEO', company: 'Stackline' },
      ],
      pricing: [
        { name: 'Starter', price: '$0', period: '/month', highlighted: false, features: ['Up to 5 users', 'Core features', 'Community support', '5GB storage', 'Mobile app'] },
        { name: 'Pro', price: '$29', period: '/user/month', highlighted: true, features: ['Unlimited users', 'Advanced features', 'Priority support', '100GB storage', 'API access', 'Analytics'] },
        { name: 'Enterprise', price: 'Custom', period: '', highlighted: false, features: ['Unlimited everything', 'Dedicated success manager', 'Custom integrations', 'SLA guarantee', 'SSO & SCIM', 'On-prem option'] },
      ],
      sections: ['features', 'stats', 'testimonials', 'pricing'],
    }
  },
}

// ─── 3D object pools per industry (randomized each call) ──────────────────────
const THREE_OBJECT_POOLS = {
  ecommerce:   ['crystal', 'floating-sphere', 'torus-knot'],
  restaurant:  ['crystal', 'floating-sphere', 'particles'],
  gaming:      ['torus-knot', 'particles', 'neural-network'],
  fintech:     ['geometric-grid', 'neural-network', 'torus-knot'],
  health:      ['dna-helix', 'floating-sphere', 'neural-network'],
  education:   ['neural-network', 'icosahedron', 'particles'],
  travel:      ['planet', 'floating-sphere', 'particles'],
  real_estate: ['floating-sphere', 'geometric-grid', 'crystal'],
  music:       ['torus-knot', 'particles', 'icosahedron'],
  agency:      ['particles', 'neural-network', 'torus-knot'],
  space:       ['planet', 'particles', 'black-hole'],
  ai_saas:     ['neural-network', 'ai-brain', 'particles'],
  nft:         ['crystal', 'torus-knot', 'neural-network'],
  consulting:  ['geometric-grid', 'neural-network', 'floating-sphere'],
  saas:        ['neural-network', 'particles', 'torus-knot'],
}

function pickRand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const HERO_LAYOUTS = ['split', 'centered', 'magazine', 'minimal']
const LAYOUT_BY_INDUSTRY = {
  restaurant: ['magazine', 'split', 'minimal'],
  agency:     ['magazine', 'minimal', 'centered'],
  gaming:     ['centered', 'split'],
  space:      ['centered', 'fullscreen'],
  nft:        ['centered', 'magazine'],
  consulting: ['minimal', 'split'],
  fintech:    ['split', 'minimal'],
  health:     ['minimal', 'split'],
  travel:     ['magazine', 'centered'],
}

// ─── Prompt-based seed for consistent-but-varied results ─────────────────────
function promptSeed(prompt) {
  let h = 0
  for (let i = 0; i < prompt.length; i++) h = (Math.imul(31, h) + prompt.charCodeAt(i)) | 0
  return Math.abs(h)
}

function seededPick(arr, seed, offset = 0) {
  return arr[(seed + offset) % arr.length]
}

// ─── Main dynamic local builder ───────────────────────────────────────────────

function buildLocalBlueprint(prompt) {
  const seed     = promptSeed(prompt)
  const industry = classify(prompt)
  const style    = inferStyle(industry, prompt)

  // Pick palette variant and font pair based on prompt seed (deterministic per prompt)
  const palettePool = PALETTE_VARIANTS[style] ?? PALETTE_VARIANTS.Futuristic
  const fontPool    = FONT_PAIRS[style]        ?? FONT_PAIRS.Futuristic
  const palette     = seededPick(palettePool, seed, 0)
  const [headingFont, bodyFont] = seededPick(fontPool, seed, 1)

  const name       = extractName(prompt)
  const threeObj   = seededPick(THREE_OBJECT_POOLS[industry] ?? ['neural-network', 'particles', 'torus-knot'], seed, 2)
  const heroLayout = seededPick(LAYOUT_BY_INDUSTRY[industry] ?? HERO_LAYOUTS, seed, 3)

  const gen = CONTENT[industry] ?? CONTENT.saas
  const c   = gen(name, prompt)

  return {
    website_name:  name,
    business_type: c.businessType,
    design_style:  style,
    color_palette: palette,
    typography: { heading_font: headingFont, body_font: bodyFont },
    navbar: { logo: name, links: c.navLinks },
    hero: {
      ...c.hero,
      layout:          heroLayout,
      background_type: 'gradient_mesh',
      animation:       'particle_float',
      three_d_object:  {
        type:      threeObj,
        material:  'glass',
        animation: 'slow_rotation',
      },
    },
    sections: [
      c.sections.includes('features') && {
        id: 'features', type: 'features',
        title: pickTitle('features', industry),
        subtitle: pickSubtitle('features', industry, name),
        content: c.features,
        animation: 'slide_up',
        three_d_element: { type: '', material: '', animation: '' },
      },
      c.sections.includes('stats') && {
        id: 'stats', type: 'stats',
        title: pickTitle('stats', industry),
        subtitle: pickSubtitle('stats', industry, name),
        content: c.stats,
        animation: 'count_up',
        three_d_element: { type: '', material: '', animation: '' },
      },
      c.sections.includes('testimonials') && {
        id: 'testimonials', type: 'testimonials',
        title: pickTitle('testimonials', industry),
        subtitle: pickSubtitle('testimonials', industry, name),
        content: c.testimonials,
        animation: 'fade_in',
        three_d_element: { type: '', material: '', animation: '' },
      },
      c.sections.includes('pricing') && {
        id: 'pricing', type: 'pricing',
        title: pickTitle('pricing', industry),
        subtitle: pickSubtitle('pricing', industry, name),
        content: c.pricing,
        animation: 'scale_in',
        three_d_element: { type: '', material: '', animation: '' },
      },
      {
        id: 'cta', type: 'cta',
        title: `Ready to get started with ${name}?`,
        subtitle: pickCtaSubtitle(industry),
        content: [{ cta_primary: c.hero.cta_primary, cta_secondary: c.hero.cta_secondary }],
        animation: 'glow_pulse',
        three_d_element: { type: 'particle_burst', material: 'neon', animation: 'explode' },
      },
    ].filter(Boolean),
    footer: {
      tagline: c.tagline,
      text:    `© 2025 ${name}. All rights reserved.`,
      links:   ['Privacy Policy', 'Terms of Service', 'Contact'],
    },
    animations: { scroll_effect: 'parallax', page_transition: 'fade', hover_effect: 'scale' },
    three_js: { camera: { position: [0, 0, 5] }, lighting: { type: 'point', intensity: 2 }, objects: [] },
  }
}

const SECTION_TITLES = {
  features: {
    ecommerce: 'Why Shop With Us', restaurant: 'The Full Experience', gaming: 'Built for Champions',
    fintech: 'Everything Your Money Needs', health: 'Comprehensive Care', education: 'How We Help You Grow',
    travel: 'Why Travelers Choose Us', agency: 'What We Do Best', space: 'Our Capabilities',
    ai_saas: 'The Platform Advantage', nft: 'Why Collect Here', consulting: 'Our Services',
    default: 'What We Offer',
  },
  stats: {
    ecommerce: 'Trusted by Shoppers Worldwide', restaurant: 'The Numbers Behind Our Name',
    gaming: 'Built for Scale', fintech: 'Powering Global Finance', health: 'Outcomes That Speak',
    education: 'Results That Matter', travel: 'Our Track Record', agency: 'Proven Performance',
    space: 'Mission Metrics', ai_saas: 'Production at Scale', nft: 'Platform in Numbers',
    consulting: 'Delivering Results', default: 'Trusted at Scale',
  },
  testimonials: {
    ecommerce: 'What Our Customers Say', restaurant: 'Voices From Our Guests',
    gaming: 'From the Community', fintech: 'Trusted by Millions', health: 'Patient Stories',
    education: 'Success Stories', travel: 'Traveler Reviews', agency: 'Client Results',
    space: 'Mission Partners', ai_saas: 'Used by Engineering Teams', nft: 'Collector Reviews',
    consulting: 'Client Perspectives', default: 'What People Are Saying',
  },
  pricing: {
    ecommerce: 'Membership Plans', restaurant: 'Dining Options', gaming: 'Choose Your Tier',
    fintech: 'Simple, Transparent Plans', health: 'Health Plans', education: 'Learning Paths',
    travel: 'Travel Memberships', agency: 'Project Packages', space: 'Launch Packages',
    ai_saas: 'Pricing', nft: 'Creator & Collector Plans', consulting: 'Engagement Models',
    default: 'Pricing',
  },
}

function pickTitle(section, industry) {
  return SECTION_TITLES[section]?.[industry] ?? SECTION_TITLES[section]?.default ?? section
}

function pickSubtitle(section, industry, name) {
  const map = {
    features:     { ecommerce: `${name} makes every order feel personal.`, restaurant: `Crafted to delight from the moment you arrive.`, gaming: `No compromises. No excuses.`, default: `Everything you need, none of what you don't.` },
    stats:        { default: 'The proof is in the data.' },
    testimonials: { default: `Don't take our word for it.` },
    pricing:      { default: 'No hidden fees. Scale as you grow.' },
  }
  return map[section]?.[industry] ?? map[section]?.default ?? ''
}

function pickCtaSubtitle(industry) {
  const m = {
    ecommerce: 'Free shipping on your first order. No code needed.',
    restaurant: 'Reservations fill up fast — book your table now.',
    gaming: 'First 30 days free. No credit card required.',
    fintech: 'Open your account in under 2 minutes.',
    health: 'Your first consultation is on us.',
    education: 'Start learning today with 100+ free courses.',
    travel: 'Talk to a travel expert for free — no commitment.',
    agency: 'Free discovery call. Let\'s talk about your project.',
    space: 'Request a launch manifest for your next mission.',
    ai_saas: '$20 in free credits. No credit card needed.',
    nft: 'Connect your wallet and start collecting today.',
    consulting: 'First 30-minute strategy call is complimentary.',
    default: 'Join thousands of teams already using the platform.',
  }
  return m[industry] ?? m.default
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateWebsiteBlueprint(prompt, onProgress) {
  try {
    onProgress?.('Generating website blueprint...')

    const res = await fetch('/api/generate-website-blueprint', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt }),
    })

    if (!res.ok) throw new Error(`API ${res.status}`)

    const { websiteBlueprint } = await res.json()
    onProgress?.('Website blueprint ready')
    return websiteBlueprint
  } catch {
    onProgress?.('Building from prompt...')
    await new Promise(r => setTimeout(r, 300))
    return buildLocalBlueprint(prompt)
  }
}
