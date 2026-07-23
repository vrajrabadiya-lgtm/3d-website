/**
 * CodeGenerator — Phase 5 (local fallback)
 *
 * Generates complete, runnable React + Tailwind + React Three Fiber code
 * driven entirely by the blueprint data. Every generation produces:
 *
 *   1. fileTree       — project file structure
 *   2. appJSX         — App.jsx router skeleton with real brand/routes
 *   3. heroJSX        — Hero.jsx with layout from websiteBlueprint.hero.layout
 *   4. sceneJSX       — Cinematic3DScene.jsx with custom 3D object inline
 *   5. sampleSection  — First features section with actual content & industry layout
 *   6. installCmd     — npm install command
 *
 * Rules enforced here (not by AI):
 *   - No TODO comments
 *   - Real text from websiteBlueprint (never placeholder)
 *   - Layout archetype switches based on hero.layout + business_type
 *   - 3D object is built from hero.three_d_object.type using real geometry
 *   - Section layout is industry-specific (never generic SaaS grid unless it's SaaS)
 *   - Same UI structure is never repeated across hero layouts
 *
 * When blueprint.creative_concept.layout_archetype matches Layout-A..J,
 * MasterLayoutEngine is used for heroJSX, sceneJSX, and sampleSection,
 * producing structurally unique code per archetype.
 */

import { generateFromBlueprint as masterGenerate } from './MasterLayoutEngine.js'

// ─── Data extractors ─────────────────────────────────────────────────────────

function getWB(bp) {
  return bp.websiteBlueprint ?? {}
}

function getPalette(bp) {
  const w = getWB(bp)
  const cp = w.color_palette
  if (cp && typeof cp === 'object' && !Array.isArray(cp)) return cp
  return bp.palette ?? {
    primary: '#3d5eff', secondary: '#00d4ff',
    accent: '#bf5fff', background: '#0a0a14', text: '#f0f0ff',
  }
}

function getSiteName(bp) {
  return getWB(bp).website_name ?? bp.concept?.websiteName ?? 'Nexus'
}

function getTagline(bp) {
  return getWB(bp).footer?.tagline ?? bp.concept?.tagline ?? `The Future of ${getSiteName(bp)}`
}

function getBusinessType(bp) {
  return (getWB(bp).business_type ?? bp.concept?.businessType ?? 'Technology').toLowerCase()
}

function getDesignStyle(bp) {
  return getWB(bp).design_style ?? bp.concept?.designStyle ?? 'Futuristic'
}

function getHeroLayout(bp) {
  return getWB(bp).hero?.layout ?? inferHeroLayout(getBusinessType(bp))
}

function inferHeroLayout(bt) {
  if (/restaurant|food|dining|caf|luxury|fashion|music|hotel/.test(bt)) return 'magazine'
  if (/gaming|esport|space|nft|web3|cosmos/.test(bt))                   return 'centered'
  if (/health|medical|edu|consult|advisory|real.estate/.test(bt))       return 'minimal'
  return 'split'
}

function getHeroContent(bp) {
  const w = getWB(bp)
  return {
    headline:      w.hero?.headline     ?? `Welcome to ${getSiteName(bp)}`,
    subheadline:   w.hero?.subheadline  ?? getTagline(bp),
    cta_primary:   w.hero?.cta_primary  ?? 'Get Started',
    cta_secondary: w.hero?.cta_secondary ?? 'Learn More',
  }
}

function get3DObjectType(bp) {
  const fromWB = getWB(bp).hero?.three_d_object?.type
  if (fromWB && fromWB !== '') return fromWB
  const threeD = (bp.components?.threeD ?? [])
    .filter(c => !['ParticleField', 'CameraRig', 'Bloom'].includes(c))
  return threeD[0] ?? 'floating-sphere'
}

function getNavLinks(bp) {
  return getWB(bp).navbar?.links ?? bp.pages?.map(p => p.name) ?? ['Home', 'About', 'Pricing', 'Contact']
}

function getFirstFeaturesSection(bp) {
  const sections = getWB(bp).sections ?? []
  return sections.find(s => s.type === 'features' || s.id === 'features') ?? null
}

function getFeaturesContent(bp) {
  const sec = getFirstFeaturesSection(bp)
  return {
    title:    sec?.title ?? 'What We Offer',
    subtitle: sec?.subtitle ?? '',
    items:    Array.isArray(sec?.content) ? sec.content : [],
  }
}

function getBrandBadge(bp) {
  const style = getDesignStyle(bp)
  const bt    = getBusinessType(bp)
  if (/restaurant|dining/.test(bt))   return 'Award-Winning Dining'
  if (/gaming|esport/.test(bt))       return 'Compete · Win · Dominate'
  if (/space|cosmos/.test(bt))        return 'Pioneering Space Technology'
  if (/health|medical/.test(bt))      return 'Trusted Healthcare'
  if (/education|learn/.test(bt))     return 'Learn Without Limits'
  if (/travel/.test(bt))              return 'The World Awaits'
  if (/agency|studio/.test(bt))       return 'Creative Excellence'
  if (/fintech|finance|bank/.test(bt)) return 'Financial Intelligence'
  if (/nft|web3/.test(bt))            return 'Own the Future'
  if (style === 'AI' || /ai platform/.test(bt)) return 'AI-Powered Platform'
  return `${style} Technology`
}

// ─── Features section layout selector ────────────────────────────────────────

function getFeaturesLayout(bp) {
  const bt = getBusinessType(bp)
  if (/restaurant|food|dining|caf|luxury|fashion|music|agency|studio|creative/.test(bt)) return 'editorial'
  if (/gaming|esport|nft|web3|cyberpunk/.test(bt))                                       return 'neon-grid'
  if (/health|medical|wellness|fitness|education|edu|consult|advisory/.test(bt))         return 'steplist'
  if (/fintech|finance|bank|payment|ai.platform|ai.saas/.test(bt))                       return 'stat-grid'
  if (/travel|hotel|ecommerce|shop|retail/.test(bt))                                     return 'card-scroll'
  if (/space|cosmos|galaxy/.test(bt))                                                    return 'space-grid'
  return 'feature-grid'
}

// ─── File tree ────────────────────────────────────────────────────────────────

export function buildFileTree(bp) {
  const name  = getSiteName(bp)
  const pages = (bp.pages ?? [{ name: 'Home' }, { name: 'About' }, { name: 'Pricing' }])
  const bt    = getBusinessType(bp)

  const sectionNames =
    bt.includes('restaurant') ? ['Menu', 'Reservations', 'Events'] :
    bt.includes('ecommerce')  ? ['Shop', 'Collections', 'Checkout'] :
    bt.includes('gaming')     ? ['Leaderboard', 'Tournaments', 'Arena'] :
    ['Features', 'Testimonials', 'Pricing']

  return [
    `# ${name} — Generated by Getartifact`,
    ``,
    `src/`,
    `├── main.jsx`,
    `├── App.jsx`,
    `├── index.css`,
    `├── components/`,
    `│   ├── layout/`,
    `│   │   ├── Navbar.jsx`,
    `│   │   └── Footer.jsx`,
    `│   ├── sections/`,
    ...sectionNames.map((s, i) => `│   │   ${i < sectionNames.length - 1 ? '├' : '└'}── ${s}Section.jsx`),
    `│   └── ui/`,
    `│       ├── Button.jsx`,
    `│       └── Badge.jsx`,
    `├── 3d/`,
    `│   ├── Cinematic3DScene.jsx`,
    `│   └── objects/`,
    `│       └── CustomObject.jsx`,
    `├── pages/`,
    ...pages.map((p, i) => `│   ${i < pages.length - 1 ? '├' : '└'}── ${p.name}Page.jsx`),
    `└── hooks/`,
    `    └── useScrollReveal.js`,
  ].join('\n')
}

// ─── App.jsx ──────────────────────────────────────────────────────────────────

export function generateAppJSX(bp) {
  const name   = getSiteName(bp)
  const pal    = getPalette(bp)
  const pages  = (bp.pages ?? [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])
  const style  = getDesignStyle(bp)
  const font   = getWB(bp).typography?.heading_font ?? (style === 'Luxury' ? 'Playfair Display' : 'Syne')

  const imports = pages
    .map(p => `import ${p.name}Page from './pages/${p.name}Page'`)
    .join('\n')

  const routes = pages
    .map(p => `        <Route path="${p.path ?? `/${p.name.toLowerCase()}`}" element={<${p.name}Page />} />`)
    .join('\n')

  return `import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
${imports}

/**
 * ${name}
 * Design style: ${style}
 * Generated by Getartifact — https://getartifact.dev
 */
export default function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen"
        style={{ background: '${pal.background}', color: '${pal.text}', fontFamily: 'Inter, sans-serif' }}
      >
        <Navbar
          brand="${name}"
          links={${JSON.stringify(getNavLinks(bp))}}
          primaryColor="${pal.primary}"
        />
        <main>
          <Routes>
${routes}
          </Routes>
        </main>
        <Footer
          brand="${name}"
          tagline="${getTagline(bp)}"
          links={['Privacy Policy', 'Terms of Service', 'Contact']}
        />
      </div>
    </BrowserRouter>
  )
}`
}

// ─── Custom 3D Object Code ────────────────────────────────────────────────────

function generate3DObjectCode(objectType, pal) {
  const pri = pal.primary   ?? '#3d5eff'
  const sec = pal.secondary ?? '#00d4ff'
  const acc = pal.accent    ?? '#bf5fff'

  switch (objectType) {

    case 'crystal':
      return `
function Crystal() {
  const outerRef = useRef()
  const innerRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    outerRef.current.rotation.y = t * 0.35
    outerRef.current.rotation.x = Math.sin(t * 0.22) * 0.18
    innerRef.current.rotation.y = -t * 0.55
    innerRef.current.rotation.x = Math.cos(t * 0.18) * 0.22
  })

  return (
    <group>
      <mesh ref={outerRef}>
        <octahedronGeometry args={[1.4, 0]} />
        <meshPhysicalMaterial
          color="${pri}"
          metalness={0.05}
          roughness={0}
          transmission={0.92}
          ior={2.4}
          thickness={0.6}
          envMapIntensity={2.5}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={innerRef} scale={0.58}>
        <octahedronGeometry args={[1.4, 1]} />
        <meshPhysicalMaterial
          color="${sec}"
          emissive="${sec}"
          emissiveIntensity={0.9}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color="${pri}" distance={4} />
    </group>
  )
}`

    case 'neural-network':
      return `
const NN_NODES = Array.from({ length: 16 }, () => ({
  pos: [
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 2.5,
  ],
}))

function NeuralNetwork() {
  const groupRef = useRef()
  const nodeRefs = useRef(NN_NODES.map(() => createRef()))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.16
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.12
    nodeRefs.current.forEach((ref, i) => {
      if (ref.current) {
        ref.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2.4 + i * 0.9) * 0.4
      }
    })
  })

  return (
    <group ref={groupRef}>
      {NN_NODES.map((node, i) => (
        <mesh key={i} ref={nodeRefs.current[i]} position={node.pos}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="${sec}"
            emissive="${sec}"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
      {NN_NODES.flatMap((a, i) =>
        NN_NODES.slice(i + 1, i + 3).map((b, j) => {
          const pts = [new THREE.Vector3(...a.pos), new THREE.Vector3(...b.pos)]
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          return (
            <line key={i + '-' + j} geometry={geo}>
              <lineBasicMaterial color="${pri}" transparent opacity={0.3} />
            </line>
          )
        })
      )}
    </group>
  )
}`

    case 'planet':
      return `
function Planet() {
  const bodyRef  = useRef()
  const ringRef  = useRef()
  const glowRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    bodyRef.current.rotation.y  = t * 0.1
    ringRef.current.rotation.x  = 1.15 + Math.sin(t * 0.08) * 0.04
    ringRef.current.rotation.z  = t * 0.05
    glowRef.current.rotation.y  = -t * 0.06
  })

  return (
    <group>
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.65}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.56, 64, 64]} />
        <meshStandardMaterial
          color="${sec}"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          emissive="${sec}"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[1.15, 0, 0]}>
        <ringGeometry args={[2.1, 2.95, 80]} />
        <meshBasicMaterial
          color="${acc}"
          transparent
          opacity={0.38}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}`

    case 'torus-knot':
      return `
function TorusKnot() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    meshRef.current.rotation.x = t * 0.21
    meshRef.current.rotation.y = t * 0.32
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.0, 0.32, 160, 16, 2, 3]} />
      <meshPhysicalMaterial
        color="${pri}"
        emissive="${acc}"
        emissiveIntensity={0.28}
        metalness={0.85}
        roughness={0.12}
        envMapIntensity={1.6}
      />
    </mesh>
  )
}`

    case 'dna-helix':
      return `
const DNA_STRAND_POINTS = 80
const DNA_STRAND_1 = Array.from({ length: DNA_STRAND_POINTS }, (_, i) => {
  const t = (i / DNA_STRAND_POINTS) * 4 * Math.PI * 2
  return new THREE.Vector3(Math.cos(t) * 0.9, (i / DNA_STRAND_POINTS) * 5.5 - 2.75, Math.sin(t) * 0.9)
})
const DNA_STRAND_2 = Array.from({ length: DNA_STRAND_POINTS }, (_, i) => {
  const t = (i / DNA_STRAND_POINTS) * 4 * Math.PI * 2 + Math.PI
  return new THREE.Vector3(Math.cos(t) * 0.9, (i / DNA_STRAND_POINTS) * 5.5 - 2.75, Math.sin(t) * 0.9)
})
const DNA_GEO_1 = new THREE.BufferGeometry().setFromPoints(DNA_STRAND_1)
const DNA_GEO_2 = new THREE.BufferGeometry().setFromPoints(DNA_STRAND_2)

function DNAHelix() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.elapsedTime * 0.28
  })

  return (
    <group ref={groupRef}>
      <line geometry={DNA_GEO_1}>
        <lineBasicMaterial color="${pri}" linewidth={2} />
      </line>
      <line geometry={DNA_GEO_2}>
        <lineBasicMaterial color="${sec}" linewidth={2} />
      </line>
      {Array.from({ length: 14 }, (_, i) => {
        const t  = (i / 14) * 4 * Math.PI * 2
        const y  = (i / 14) * 5.5 - 2.75
        const p1 = [Math.cos(t) * 0.9, y, Math.sin(t) * 0.9]
        const p2 = [Math.cos(t + Math.PI) * 0.9, y, Math.sin(t + Math.PI) * 0.9]
        const rg = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...p1), new THREE.Vector3(...p2),
        ])
        return (
          <group key={i}>
            <mesh position={p1}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="${pri}" emissive="${pri}" emissiveIntensity={0.9} />
            </mesh>
            <mesh position={p2}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="${sec}" emissive="${sec}" emissiveIntensity={0.9} />
            </mesh>
            <line geometry={rg}>
              <lineBasicMaterial color="${acc}" transparent opacity={0.55} />
            </line>
          </group>
        )
      })}
    </group>
  )
}`

    case 'geometric-grid':
      return `
const GRID_POSITIONS = Array.from({ length: 9 }, (_, i) => [
  ((i % 3) - 1) * 1.25,
  0,
  (Math.floor(i / 3) - 1) * 1.25,
])

function GeometricGrid() {
  const groupRef = useRef()
  const boxRefs  = useRef(GRID_POSITIONS.map(() => createRef()))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.14
    boxRefs.current.forEach((ref, i) => {
      if (!ref.current) return
      ref.current.position.y     = Math.sin(t * 1.1 + i * 0.75) * 0.45
      ref.current.rotation.x     = t * 0.38 + i * 0.31
      ref.current.rotation.z     = t * 0.27 + i * 0.22
      ref.current.material.emissiveIntensity = 0.15 + Math.sin(t * 1.5 + i) * 0.12
    })
  })

  return (
    <group ref={groupRef}>
      {GRID_POSITIONS.map((pos, i) => (
        <mesh key={i} ref={boxRefs.current[i]} position={pos}>
          <boxGeometry args={[0.52, 0.52, 0.52]} />
          <meshPhysicalMaterial
            color="${pri}"
            emissive="${pri}"
            emissiveIntensity={0.18}
            metalness={0.75}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}`

    case 'icosahedron':
      return `
function Icosahedron() {
  const outerRef = useRef()
  const innerRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    outerRef.current.rotation.y = t * 0.18
    outerRef.current.rotation.x = Math.sin(t * 0.13) * 0.28
    innerRef.current.rotation.y = -t * 0.32
    innerRef.current.rotation.z = t * 0.09
  })

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.12}
          metalness={0.55}
          roughness={0.22}
          wireframe
        />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshPhysicalMaterial
          color="${sec}"
          transmission={0.88}
          ior={1.85}
          roughness={0}
          metalness={0.08}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  )
}`

    case 'black-hole':
      return `
function BlackHole() {
  const diskRef  = useRef()
  const disk2Ref = useRef()
  const coreRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    diskRef.current.rotation.z  = t * 0.55
    disk2Ref.current.rotation.z = -t * 0.38
    coreRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2.5) * 0.4
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="${acc}"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.5, 80]} />
        <meshBasicMaterial
          color="${pri}"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={disk2Ref} rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
        <ringGeometry args={[0.9, 1.8, 80]} />
        <meshBasicMaterial
          color="${acc}"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}`

    case 'floating-sphere':
    default:
      return `
function FloatingSphere() {
  const sphereRef = useRef()
  const ring1Ref  = useRef()
  const ring2Ref  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    sphereRef.current.position.y = Math.sin(t * 0.78) * 0.28
    ring1Ref.current.rotation.z  = t * 0.42
    ring2Ref.current.rotation.x  = t * 0.3
    ring2Ref.current.rotation.z  = -t * 0.18
  })

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshPhysicalMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.18}
          metalness={0.28}
          roughness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.72, 1.78, 64]} />
        <meshBasicMaterial color="${sec}" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.5, 0]}>
        <ringGeometry args={[2.05, 2.09, 64]} />
        <meshBasicMaterial color="${acc}" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}`
  }
}

// ─── 3D Scene (Cinematic3DScene + custom object inline) ───────────────────────

export function generateThreeSceneComponent(bp) {
  const pal        = getPalette(bp)
  const objectType = get3DObjectType(bp)
  const objCode    = generate3DObjectCode(objectType, pal)
  const bg         = pal.background ?? '#0a0a14'
  const pri        = pal.primary    ?? '#3d5eff'
  const sec        = pal.secondary  ?? '#00d4ff'
  const acc        = pal.accent     ?? '#bf5fff'

  const componentName =
    objectType === 'crystal'         ? 'Crystal' :
    objectType === 'neural-network'  ? 'NeuralNetwork' :
    objectType === 'planet'          ? 'Planet' :
    objectType === 'torus-knot'      ? 'TorusKnot' :
    objectType === 'dna-helix'       ? 'DNAHelix' :
    objectType === 'geometric-grid'  ? 'GeometricGrid' :
    objectType === 'icosahedron'     ? 'Icosahedron' :
    objectType === 'black-hole'      ? 'BlackHole' :
    'FloatingSphere'

  return `import { useRef, useMemo, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Stars, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Custom 3D Object: ${componentName} ──────────────────────────────────────
${objCode}

// ─── Ambient particle field ───────────────────────────────────────────────────
function AmbientParticles({ count = 700 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    return arr
  }, [count])

  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.035
    ref.current.rotation.x = clock.elapsedTime * 0.018
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="${pri}"
        size={0.028}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export default function Cinematic3DScene() {
  return (
    <>
      <color attach="background" args={['${bg}']} />

      {/* Lighting rig */}
      <ambientLight intensity={0.22} />
      <pointLight position={[8, 8, 8]}   intensity={3.2} color="${pri}" decay={2} />
      <pointLight position={[-8, -5, -6]} intensity={1.8} color="${acc}" decay={2} />
      <spotLight
        position={[0, 14, 5]}
        angle={0.38}
        penumbra={1}
        intensity={4.5}
        color="${sec}"
        castShadow
      />

      {/* Deep-space starfield */}
      <Stars radius={90} depth={60} count={2200} factor={3.8} fade speed={0.7} />

      {/* Main subject — floats gently */}
      <Float speed={1.75} rotationIntensity={0.38} floatIntensity={1.15}>
        <${componentName} />
      </Float>

      {/* Background particles */}
      <AmbientParticles count={700} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.48}
          luminanceSmoothing={0.82}
          intensity={1.45}
        />
      </EffectComposer>
    </>
  )
}`
}

// ─── Hero Component (layout-aware) ───────────────────────────────────────────

export function generateHeroComponent(bp) {
  const layout = getHeroLayout(bp)
  const pal    = getPalette(bp)
  const hero   = getHeroContent(bp)
  const name   = getSiteName(bp)
  const badge  = getBrandBadge(bp)
  const bg     = pal.background ?? '#0a0a14'
  const pri    = pal.primary    ?? '#3d5eff'
  const sec    = pal.secondary  ?? '#00d4ff'
  const acc    = pal.accent     ?? '#bf5fff'
  const text   = pal.text       ?? '#f0f0ff'

  if (layout === 'split') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* ── Left: content column ───────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-10 lg:px-20 py-36 z-10">
        <motion.div
          className="mb-8 inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ background: '${pri}22', border: '1px solid ${pri}55', color: '${sec}' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '${sec}' }} />
          ${badge}
        </motion.div>

        <motion.h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          ${hero.headline}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl mb-10 max-w-xl"
          style={{ color: '${text}99' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
        >
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.03]"
            style={{ background: '${pri}', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
            style={{ border: '1px solid ${text}30', color: '${text}99' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* ── Right: 3D canvas ────────────────────────────────────────────── */}
      <div className="relative min-h-[55vh] lg:min-h-screen">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 58 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Cinematic3DScene />
            </Suspense>
          </Canvas>
        </div>
        {/* Fade to bg on left edge */}
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none"
          style={{ background: 'linear-gradient(to right, ${bg}, transparent)' }}
        />
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
      />
    </section>
  )
}`
  }

  if (layout === 'centered') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed 3D canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 55 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 15%, ${bg}ee 72%)' }}
      />

      {/* Centered content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6 py-32">
        <motion.div
          className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ background: '${acc}18', border: '1px solid ${acc}44', color: '${acc}' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          ${badge}
        </motion.div>

        <motion.h1
          className="font-extrabold leading-none mb-8"
          style={{ fontSize: 'clamp(3.5rem, 7vw, 7rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          ${hero.headline}
        </motion.h1>

        <motion.p
          className="text-xl lg:text-2xl mb-12 mx-auto max-w-2xl"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-5 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <button
            className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, ${pri}, ${acc})', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-80"
            style={{ background: '${text}12', border: '1px solid ${text}22', color: '${text}cc' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
      />
    </section>
  )
}`
  }

  if (layout === 'magazine') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen grid grid-cols-12 overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* ── Left editorial column — 7 cols ──────────────────────────── */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-end pb-20 pl-10 lg:pl-20 pr-8 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-5 font-medium"
            style={{ color: '${sec}80' }}
          >
            ${badge}
          </p>
        </motion.div>

        <motion.h1
          className="font-black leading-[0.88] mb-8"
          style={{ fontSize: 'clamp(4rem, 8vw, 9rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          ${hero.headline.split(' ').slice(0, Math.ceil(hero.headline.split(' ').length / 2)).join(' ')}
          <span style={{ color: '${pri}' }}>
            {' '}${hero.headline.split(' ').slice(Math.ceil(hero.headline.split(' ').length / 2)).join(' ')}
          </span>
        </motion.h1>

        <motion.p
          className="text-lg max-w-xl mb-10"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.div
          className="flex gap-4 items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{ background: '${pri}', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:opacity-70"
            style={{ color: '${text}99' }}
          >
            ${hero.cta_secondary} →
          </button>
        </motion.div>

        {/* Horizontal rule */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: '${text}12' }}
        />
      </div>

      {/* ── Right 3D column — 5 cols ─────────────────────────────────── */}
      <div className="hidden lg:block col-span-5 relative min-h-screen">
        {/* Left gradient bleed */}
        <div
          className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, ${bg}, transparent)' }}
        />
        <Canvas camera={{ position: [0, 0, 5.2], fov: 60 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
        />
      </div>
    </section>
  )
}`
  }

  // layout === 'minimal' (default fallback)
  return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(${text} 1px, transparent 1px), linear-gradient(90deg, ${text} 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* 3D accent — top right quadrant */}
      <div className="absolute top-0 right-0 w-[48vw] h-[60vh] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 58 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        {/* Bleed edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, ${bg} 0%, transparent 25%, transparent 75%, ${bg} 100%), linear-gradient(to bottom, transparent 60%, ${bg} 100%)',
          }}
        />
      </div>

      {/* Content — left, vertically centered */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center pl-12 lg:pl-24 pr-8 max-w-3xl">
        <motion.span
          className="inline-block text-xs uppercase tracking-[0.28em] mb-6 font-medium"
          style={{ color: '${pri}' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          ${badge}
        </motion.span>

        <motion.h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.6rem, 4.5vw, 5rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          ${hero.headline}
        </motion.h1>

        <motion.p
          className="text-lg mb-10 max-w-lg"
          style={{ color: '${text}65' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button
            className="px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
            style={{ background: '${pri}', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-70"
            style={{ color: '${text}80' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>
    </section>
  )
}`
}

// ─── Section Component (industry-aware, content-driven) ───────────────────────

export function generateSectionComponent(bp) {
  const pal     = getPalette(bp)
  const content = getFeaturesContent(bp)
  const featLayout = getFeaturesLayout(bp)
  const bg      = pal.background ?? '#0a0a14'
  const pri     = pal.primary    ?? '#3d5eff'
  const sec     = pal.secondary  ?? '#00d4ff'
  const acc     = pal.accent     ?? '#bf5fff'
  const text    = pal.text       ?? '#f0f0ff'

  const title    = content.title.replace(/'/g, "\\'")
  const subtitle = content.subtitle.replace(/'/g, "\\'")

  const itemsCode = content.items.slice(0, 6).map((f, i) => ({
    icon:  f.icon  ?? '◆',
    title: (f.title ?? `Feature ${i + 1}`).replace(/'/g, "\\'"),
    desc:  (f.description ?? '').replace(/'/g, "\\'"),
  }))

  if (featLayout === 'editorial') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 overflow-hidden" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          {${JSON.stringify(subtitle)} && (
            <p className="text-lg" style={{ color: '${text}60' }}>${subtitle}</p>
          )}
        </motion.div>

        {/* Alternating editorial rows */}
        <div>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className={'flex items-center gap-14 py-14 ' + (i < FEATURES.length - 1 ? 'border-b' : '')}
              style={{ borderColor: '${text}0f', flexDirection: i % 2 === 1 ? 'row-reverse' : 'row' }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1 }}
            >
              <div className="flex-1">
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3
                  className="text-2xl font-semibold mb-3"
                  style={{ color: '${text}' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: '${text}65', lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
              <div
                className="flex-shrink-0 w-56 h-56 rounded-2xl flex items-center justify-center"
                style={{
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg, ${pri}22, ${acc}18)'
                    : 'linear-gradient(135deg, ${sec}22, ${pri}18)',
                  border: '1px solid ${text}0c',
                }}
              >
                <span style={{ fontSize: '5rem' }}>{feature.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'neon-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-extrabold mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}55' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl relative overflow-hidden group"
              style={{
                background: '${text}06',
                border: '1px solid ${pri}28',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {/* Neon glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ boxShadow: 'inset 0 0 30px ${pri}18' }}
              />
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                {feature.desc}
              </p>
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle at 100% 0%, ${pri}, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'steplist') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left: heading */}
          <motion.div
            className="lg:sticky lg:top-28"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="font-bold leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', color: '${text}' }}
            >
              ${title}
            </h2>
            <p className="text-lg" style={{ color: '${text}60' }}>${subtitle}</p>
            <div className="mt-10 h-1 w-16 rounded-full" style={{ background: '${pri}' }} />
          </motion.div>

          {/* Right: numbered list */}
          <div className="space-y-0">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                className={'flex gap-8 py-8 ' + (i < FEATURES.length - 1 ? 'border-b' : '')}
                style={{ borderColor: '${text}10' }}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.09 }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '${pri}20', color: '${pri}', border: '1px solid ${pri}40' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: '${text}' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'stat-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        {/* 2-column stat-style features */}
        <div className="grid md:grid-cols-2 gap-px" style={{ background: '${text}10' }}>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-8"
              style={{ background: '${bg}' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: '${pri}16' }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: '${text}' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'card-scroll') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="px-8 mb-12"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold mb-3"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        {/* Horizontal-scroll card row */}
        <div className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid ${text}12' }}
              initial={{ opacity: 0, y: 35 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Image area placeholder */}
              <div
                className="h-44 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, ${pri}22 0%, ${acc}18 100%)',
                }}
              >
                <span style={{ fontSize: '4rem' }}>{feature.icon}</span>
              </div>
              <div className="p-6" style={{ background: '${text}05' }}>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: '${text}' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'space-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-32" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div
            className="inline-block text-xs uppercase tracking-widest mb-5 px-4 py-1.5 rounded-full"
            style={{ background: '${pri}18', color: '${sec}', border: '1px solid ${pri}40' }}
          >
            Capabilities
          </div>
          <h2
            className="font-extrabold mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-2xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(145deg, ${text}07 0%, ${text}03 100%)',
                border: '1px solid ${text}0e',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.09 }}
            >
              <div className="text-4xl mb-5">{feature.icon}</div>
              <h3
                className="font-semibold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                {feature.desc}
              </p>
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, ${pri}, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  // 'feature-grid' — standard SaaS 3-col (only default / actual SaaS)
  return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}65' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-2xl"
              style={{
                background: '${text}06',
                border: '1px solid ${text}0f',
              }}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: '${pri}18' }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
}

// ─── Master assembler ─────────────────────────────────────────────────────────

/**
 * Route hero/scene/section generation through MasterLayoutEngine when the
 * blueprint specifies a Layout-A through Layout-J archetype (from the Master
 * Prompt spec). Falls back to the legacy generators for older blueprints.
 */
function resolveComponents(bp) {
  const archetype = bp?.creative_concept?.layout_archetype ?? ''
  const isMasterLayout = /^Layout-[A-J]/i.test(archetype)

  if (isMasterLayout) {
    // Wrap blueprint to match MasterLayoutEngine's expected shape
    const wrappedBP = {
      creative_concept: bp.creative_concept,
      design_system: bp.design_system ?? bp.websiteBlueprint?.design_system,
      hero: bp.hero ?? bp.websiteBlueprint?.hero,
      sections: bp.sections ?? bp.websiteBlueprint?.sections ?? [],
      cinematic_3d_scene: bp.cinematic_3d_scene ?? bp.websiteBlueprint?.cinematic_3d_scene,
    }
    return masterGenerate(wrappedBP)
  }

  // Legacy path
  return {
    heroJSX:       generateHeroComponent(bp),
    sceneJSX:      generateThreeSceneComponent(bp),
    sampleSection: generateSectionComponent(bp),
  }
}

export function generateAllCode(blueprint) {
  const bp = blueprint ?? {}
  const { heroJSX, sceneJSX, sampleSection } = resolveComponents(bp)

  return {
    fileTree:      buildFileTree(bp),
    appJSX:        generateAppJSX(bp),
    heroJSX,
    sceneJSX,
    sampleSection,
    installCmd:    'npm install framer-motion @react-three/fiber @react-three/drei @react-three/postprocessing three react-router-dom',
    envSetup:      'cp .env.example .env\n# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
  }
}
