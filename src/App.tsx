import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, Check,
  Compass, Eye, Gem, Gamepad2, Globe2, Heart, Menu, Search, ShieldCheck,
  Sparkles, Swords, Users, X, Zap,
} from 'lucide-react'

type Locale = 'en' | 'fa'
type Section = 'home' | 'servers' | 'mods' | 'explore' | 'live' | 'community' | 'leaderboard'
type ExploreKind = 'All' | 'Mods' | 'Shaders' | 'Resource packs' | 'Modpacks' | 'Data packs' | 'Maps' | 'Plugins'
type LiveProject = { project_id: string; slug: string; title: string; description: string; project_type: string; downloads: number; icon_url?: string; author: string; versions: string[]; categories: string[] }
type JavaVersion = string
type ModLoader = 'all' | 'fabric' | 'forge' | 'neoforge' | 'quilt'

const copy = {
  en: {
    eyebrow: 'THE PORTAL IS OPEN — STEP INTO THE UNKNOWN',
    titleA: 'Every great story',
    titleB: 'begins with a block.',
    subtitle: '“One more world.” Find your next server, power up your game, and meet the people building what comes next.',
    explore: 'Explore the universe', browse: 'Browse servers', online: 'LIVE STATUS NOT CONNECTED',
    nav: ['Home', 'Servers', 'Mods', 'Explore', 'Live', 'Community', 'Leaderboard'],
    signal: 'YOUR ADVENTURE. YOUR RULES. YOUR WORLD.',
    worlds: 'Tools worth adding to your world',
    worldsSub: 'Browse real projects and open their official pages before installing.',
    servers: 'Find your next server',
    serversSub: 'Explore communities by play style, edition, and vibe.',
    mods: 'Upgrade your world',
    modsSub: 'Discover add-ons with source and compatibility details.',
    community: 'Made better together',
    communitySub: 'Meet players, follow their work, and build your circle.',
    viewAll: 'View all', featured: 'FEATURED DESTINATIONS', curated: 'CURATED DISCOVERY',
    java: 'JAVA EDITION', bedrock: 'BEDROCK', survival: 'SURVIVAL', creative: 'CREATIVE',
    adventure: 'ADVENTURE', minigames: 'MINIGAMES', trusted: 'SOURCE-FIRST PICKS',
    trustSub: 'Curated links are starting points, not compatibility guarantees. Check each official project page for supported versions, loaders, dependencies, and installation notes. No fake download buttons, ratings, or live counts.',
    members: 'COMMUNITY', account: 'Account features need backend setup',
    accountSub: 'Sign-in, profiles, and friendships need a configured authentication provider and database before they can work.',
    signIn: 'Account setup required', footer: 'A community project for the love of Minecraft.',
    legal: 'Independent fan project. Not affiliated with Mojang or Microsoft.',
    search: 'Search worlds, mods, servers…', all: 'All', noResults: 'No matching items. Try another search.',
    status: 'Status provider not connected', soon: 'Backend setup required', detail: 'Browse server directory',
    footerExplore: 'EXPLORE', footerCommunity: 'COMMUNITY', footerNote: 'Your next story is waiting.', liveCatalog: 'LIVE MODRINTH CATALOGUE', liveCatalogSub: 'Search community projects by type and Minecraft Java version.', loadingProjects: 'Loading projects…', loadError: 'The live catalogue could not load. Use the official catalogue link below.', liveCount: 'LIVE RESULTS', retry: 'Try again', downloads: 'downloads', compatibilityHint: 'Compatibility tip: filter by Minecraft version and, for mods, by loader. Before installing, open the project page and check its supported versions, dependencies, and installation notes.', installGuide: 'Read the installation guide',
  },
  fa: {
    eyebrow: 'دروازه باز است؛ قدم به ناشناخته بگذار',
    titleA: 'هر داستان بزرگی',
    titleB: 'با یک بلوک شروع می‌شود.',
    subtitle: '«فقط یک دنیای دیگر…» سرور بعدی‌ات را پیدا کن، بازی‌ات را ارتقا بده و با سازندگان دنیاهای تازه آشنا شو.',
    explore: 'گشت‌وگذار در دنیاها', browse: 'دیدن سرورها', online: 'وضعیت زنده متصل نیست',
    nav: ['خانه', 'سرورها', 'مودها', 'اکتشاف', 'پخش زنده', 'جامعه', 'رتبه‌بندی'],
    signal: 'ماجراجویی تو؛ قوانین تو؛ دنیای تو.',
    worlds: 'ابزارهایی برای دنیای تو',
    worldsSub: 'پروژه‌های واقعی را ببین و پیش از نصب، صفحه رسمی آن‌ها را بررسی کن.',
    servers: 'سرور بعدی‌ات را پیدا کن',
    serversSub: 'جامعه‌ها را بر اساس سبک بازی و نسخه بررسی کن.',
    mods: 'دنیایت را ارتقا بده',
    modsSub: 'افزونه‌ها را همراه با منبع و سازگاری بررسی کن.',
    community: 'کنار هم بهتر می‌سازیم',
    communitySub: 'بازیکن‌ها را بشناس و سازندگان مورد علاقه‌ات را دنبال کن.',
    viewAll: 'مشاهده همه', featured: 'مقصدهای منتخب', curated: 'اکتشاف گزینش‌شده',
    java: 'نسخه جاوا', bedrock: 'بدراک', survival: 'بقا', creative: 'خلاقانه',
    adventure: 'ماجراجویی', minigames: 'مینی‌گیم', trusted: 'منبع در اولویت',
    trustSub: 'پیوندهای منتخب فقط نقطه شروع‌اند و سازگاری را تضمین نمی‌کنند. نسخه‌های پشتیبانی‌شده، لودر، وابستگی‌ها و راهنمای نصب را در صفحه رسمی هر پروژه بررسی کن؛ بدون دکمه دانلود، امتیاز یا آمار زنده ساختگی.',
    members: 'جامعه', account: 'امکانات حساب به تنظیم سرویس پشتیبان نیاز دارند',
    accountSub: 'ورود، پروفایل و دوستی‌ها پس از اتصال امن سرویس احراز هویت و پایگاه داده فعال می‌شوند.',
    signIn: 'نیازمند تنظیم حساب', footer: 'پروژه‌ای اجتماعی برای عشق به ماینکرفت.',
    legal: 'پروژه مستقل هواداری؛ وابسته به Mojang یا Microsoft نیست.',
    search: 'جست‌وجوی دنیا، مود و سرور…', all: 'همه', noResults: 'موردی پیدا نشد؛ عبارت دیگری را امتحان کن.',
    status: 'سرویس وضعیت متصل نیست', soon: 'نیازمند راه‌اندازی سرویس پشتیبان', detail: 'مشاهده فهرست سرورها',
    footerExplore: 'اکتشاف', footerCommunity: 'جامعه', footerNote: 'داستان بعدی‌ات منتظر توست.', liveCatalog: 'کاتالوگ زنده مودرینث', liveCatalogSub: 'پروژه‌های جامعه را بر اساس نوع و نسخه جاوا جست‌وجو کن.', loadingProjects: 'در حال دریافت پروژه‌ها…', loadError: 'کاتالوگ زنده بارگذاری نشد؛ از پیوند کاتالوگ رسمی پایین استفاده کن.', liveCount: 'نتایج زنده', retry: 'تلاش دوباره', downloads: 'بار دانلود', compatibilityHint: 'نکته سازگاری: نسخه ماینکرفت را فیلتر کن و برای مودها لودر را هم انتخاب کن. پیش از نصب، نسخه‌های پشتیبانی‌شده، وابستگی‌ها و راهنمای نصب را در صفحه رسمی پروژه بررسی کن.', installGuide: 'راهنمای نصب و رفع مشکل',
  },
} as const

const destinations = [
  { id: 1, kind: 'Mods', name: 'Sodium', sub: 'Rendering optimisation · Fabric/Quilt project', tag: 'PERFORMANCE', color: 'violet', icon: Sparkles, url: 'https://modrinth.com/mod/sodium' },
  { id: 2, kind: 'Mods', name: 'Lithium', sub: 'Game logic optimisation · Fabric project', tag: 'PERFORMANCE', color: 'blue', icon: Zap, url: 'https://modrinth.com/mod/lithium' },
  { id: 3, kind: 'Mods', name: 'FerriteCore', sub: 'Memory optimisation · check loader and version', tag: 'MEMORY', color: 'pink', icon: Gem, url: 'https://modrinth.com/mod/ferrite-core' },
  { id: 4, kind: 'Mods', name: 'Iris Shaders', sub: 'Shader support for compatible Minecraft setups', tag: 'GRAPHICS', color: 'green', icon: Sparkles, url: 'https://modrinth.com/mod/iris' },
  { id: 5, kind: 'Mods', name: 'Xaero’s Minimap', sub: 'Minimap and waypoint navigation', tag: 'MAP', color: 'blue', icon: Compass, url: 'https://modrinth.com/mod/xaeros-minimap' },
  { id: 6, kind: 'Mods', name: 'Jade', sub: 'Information overlay for blocks and entities', tag: 'UTILITY', color: 'pink', icon: Search, url: 'https://modrinth.com/mod/jade' },
  { id: 7, kind: 'Shaders', name: 'Complementary Reimagined', sub: 'Popular shader pack · check GPU and version support', tag: 'SHADERS', color: 'violet', icon: Sparkles, url: 'https://modrinth.com/shader/complementary-reimagined' },
  { id: 8, kind: 'Shaders', name: 'BSL Shaders', sub: 'Atmospheric lighting and visual effects', tag: 'SHADERS', color: 'blue', icon: Gem, url: 'https://modrinth.com/shader/bsl-shaders' },
  { id: 9, kind: 'Shaders', name: 'MakeUp Ultra Fast', sub: 'Performance-focused shader options', tag: 'SHADERS', color: 'green', icon: Zap, url: 'https://modrinth.com/shader/makeup-ultra-fast-shaders' },
  { id: 10, kind: 'Resource packs', name: 'Faithful 32x', sub: 'Higher-resolution textures with a familiar style', tag: 'TEXTURES', color: 'pink', icon: Blocks, url: 'https://modrinth.com/resourcepack/faithful-32x' },
  { id: 11, kind: 'Resource packs', name: 'Bare Bones', sub: 'Clean, simplified textures', tag: 'TEXTURES', color: 'blue', icon: Blocks, url: 'https://modrinth.com/resourcepack/bare-bones' },
  { id: 12, kind: 'Resource packs', name: 'Fresh Animations', sub: 'Entity animation pack · requires compatible setup', tag: 'ANIMATIONS', color: 'violet', icon: Sparkles, url: 'https://modrinth.com/resourcepack/fresh-animations' },
  { id: 13, kind: 'Modpacks', name: 'Modrinth Modpacks', sub: 'Browse curated packs and check required loaders', tag: 'MODPACKS', color: 'green', icon: Gem, url: 'https://modrinth.com/modpacks' },
  { id: 14, kind: 'Data packs', name: 'Modrinth Data Packs', sub: 'World features and gameplay tweaks', tag: 'DATA PACKS', color: 'pink', icon: Blocks, url: 'https://modrinth.com/datapacks' },
  { id: 15, kind: 'Maps', name: 'Modrinth Worlds', sub: 'Community maps and adventure worlds', tag: 'WORLDS', color: 'blue', icon: Compass, url: 'https://modrinth.com/worlds' },
  { id: 16, kind: 'Plugins', name: 'Modrinth Plugins', sub: 'Server add-ons · confirm Paper/loader compatibility', tag: 'SERVERS', color: 'violet', icon: Gamepad2, url: 'https://modrinth.com/plugins' },
  { id: 17, kind: 'Mods', name: 'Explore all mods', sub: 'Search projects by Minecraft version, loader and category', tag: 'CATALOGUE', color: 'green', icon: Compass, url: 'https://modrinth.com/mods' },
  { id: 18, kind: 'Mods', name: 'Fabric API', sub: 'Common library required by many Fabric mods', tag: 'LIBRARY', color: 'blue', icon: Blocks, url: 'https://modrinth.com/mod/fabric-api' },
  { id: 19, kind: 'Mods', name: 'Mod Menu', sub: 'View and manage installed Fabric mods in-game', tag: 'UTILITY', color: 'violet', icon: Menu, url: 'https://modrinth.com/mod/modmenu' },
  { id: 20, kind: 'Mods', name: 'Entity Culling', sub: 'Skip rendering hidden entities to help performance', tag: 'PERFORMANCE', color: 'green', icon: Zap, url: 'https://modrinth.com/mod/entityculling' },
  { id: 21, kind: 'Mods', name: 'AppleSkin', sub: 'Show food and saturation information', tag: 'UTILITY', color: 'pink', icon: Heart, url: 'https://modrinth.com/mod/appleskin' },
  { id: 22, kind: 'Mods', name: 'EMI', sub: 'Recipe and item lookup for compatible modded worlds', tag: 'UTILITY', color: 'blue', icon: Search, url: 'https://modrinth.com/mod/emi' },
  { id: 23, kind: 'Mods', name: 'Waystones', sub: 'Placeable travel points for supported modded worlds', tag: 'EXPLORATION', color: 'violet', icon: Compass, url: 'https://modrinth.com/mod/waystones' },
  { id: 24, kind: 'Mods', name: 'Create', sub: 'Mechanical contraptions and automation gameplay', tag: 'GAMEPLAY', color: 'green', icon: Blocks, url: 'https://modrinth.com/mod/create' },
  { id: 25, kind: 'Mods', name: 'Distant Horizons', sub: 'Extended-distance terrain rendering; check system needs', tag: 'GRAPHICS', color: 'pink', icon: Sparkles, url: 'https://modrinth.com/mod/distanthorizons' },
  { id: 26, kind: 'Resource packs', name: 'Stay True', sub: 'Vanilla-inspired texture refresh', tag: 'TEXTURES', color: 'green', icon: Blocks, url: 'https://modrinth.com/resourcepack/stay-true' },
  { id: 27, kind: 'Resource packs', name: 'Visual Enchantments', sub: 'Clearer visual distinctions for enchanted gear', tag: 'VISUALS', color: 'violet', icon: Sparkles, url: 'https://modrinth.com/resourcepack/visual-enchantments' },
  { id: 28, kind: 'Shaders', name: 'Photon', sub: 'Atmospheric shader pack; check GPU and loader support', tag: 'SHADERS', color: 'blue', icon: Sparkles, url: 'https://modrinth.com/shader/photon-shader' },
  { id: 29, kind: 'Shaders', name: 'Sildur’s Vibrant Shaders', sub: 'Lighting and color options across supported setups', tag: 'SHADERS', color: 'pink', icon: Gem, url: 'https://modrinth.com/shader/sildurs-vibrant-shaders' },
  { id: 30, kind: 'Mods', name: 'JEI (Just Enough Items)', sub: 'Browse items and recipes in supported modded setups', tag: 'UTILITY', color: 'blue', icon: Search, url: 'https://modrinth.com/mod/jei' },
  { id: 31, kind: 'Mods', name: 'Xaero’s World Map', sub: 'Full-screen map companion for compatible Minecraft versions', tag: 'MAP', color: 'violet', icon: Compass, url: 'https://modrinth.com/mod/xaeros-world-map' },
  { id: 32, kind: 'Mods', name: 'Simple Voice Chat', sub: 'Proximity voice chat; server setup and permissions may be required', tag: 'MULTIPLAYER', color: 'green', icon: Users, url: 'https://modrinth.com/plugin/simple-voice-chat' },
  { id: 33, kind: 'Mods', name: 'Litematica', sub: 'Schematic planning tools for supported client setups', tag: 'BUILDING', color: 'pink', icon: Blocks, url: 'https://modrinth.com/mod/litematica' },
  { id: 34, kind: 'Shaders', name: 'Bliss Shaders', sub: 'Atmospheric visuals; check hardware and version requirements', tag: 'SHADERS', color: 'violet', icon: Sparkles, url: 'https://modrinth.com/shader/bliss-shader' },
  { id: 35, kind: 'Resource packs', name: 'Patrix', sub: 'Detailed visual style with version and resolution requirements', tag: 'TEXTURES', color: 'blue', icon: Blocks, url: 'https://modrinth.com/resourcepack/patrix' },
  { id: 36, kind: 'Data packs', name: 'Terralith', sub: 'Overhauled Overworld terrain generation; review world setup notes', tag: 'WORLDGEN', color: 'green', icon: Compass, url: 'https://modrinth.com/datapack/terralith' },
  { id: 37, kind: 'Mods', name: 'ReplayMod', sub: 'Record and replay gameplay on supported Minecraft versions', tag: 'CREATION', color: 'pink', icon: Gamepad2, url: 'https://modrinth.com/mod/replaymod' },
  { id: 38, kind: 'Resource packs', name: 'Vanilla Tweaks', sub: 'Choose small vanilla-style resource and data pack tweaks', tag: 'CUSTOMIZATION', color: 'violet', icon: Blocks, url: 'https://vanillatweaks.net/' },
]

const serverTypes = [
  { name: 'Survival realms', desc: 'Long-term worlds, player economies, and shared stories.', icon: Swords, tag: 'SURVIVAL' },
  { name: 'Creative studios', desc: 'Build freely, collaborate, and bring ambitious ideas to life.', icon: Blocks, tag: 'CREATIVE' },
  { name: 'Mini-game hubs', desc: 'Quick rounds, friendly competition, and new challenges.', icon: Gamepad2, tag: 'MINIGAMES' },
]

function Brand() {
  return <a className="brand" href="#home" aria-label="MineKage home">
    <span className="brand-mark"><Eye size={22} strokeWidth={1.8} aria-hidden="true" /></span>
    <span className="brand-word">MINE<span>KAGE</span><small>FIND YOUR NEXT WORLD</small></span>
  </a>
}

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [section, setSection] = useState<Section>('home')
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [exploreKind, setExploreKind] = useState<ExploreKind>('All')
  const [javaVersion, setJavaVersion] = useState<JavaVersion>('all')
  const [javaVersions, setJavaVersions] = useState<string[]>([])
  const [modLoader, setModLoader] = useState<ModLoader>('all')
  const [liveProjects, setLiveProjects] = useState<LiveProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState(false)
  const [catalogueRetry, setCatalogueRetry] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountNotice, setAccountNotice] = useState(false)
  const accountOpenerRef = useRef<HTMLElement | null>(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)
  const t = copy[locale]
  const rtl = locale === 'fa'

  useEffect(() => {
    const handleShortcuts = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setAccountNotice(false)
      }
    }
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [])
  useEffect(() => {
    if (!accountNotice) return
    modalCloseRef.current?.focus()
    return () => accountOpenerRef.current?.focus()
  }, [accountNotice])

  const navKeys: Section[] = ['home', 'servers', 'mods', 'explore', 'live', 'community', 'leaderboard']
  const kinds: ExploreKind[] = ['All', 'Mods', 'Shaders', 'Resource packs', 'Modpacks', 'Data packs', 'Maps', 'Plugins']
  const modrinthSearchUrl = `https://modrinth.com/${({ All: 'discover', Mods: 'mods', Shaders: 'shaders', 'Resource packs': 'resourcepacks', Modpacks: 'modpacks', 'Data packs': 'datapacks', Maps: 'worlds', Plugins: 'plugins' } as Record<ExploreKind, string>)[exploreKind]}${javaVersion === 'all' ? '' : `?g=${encodeURIComponent(javaVersion)}`}`

  useEffect(() => {
    const controller = new AbortController()
    fetch('https://api.modrinth.com/v2/tag/game_version', { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Version list request failed'); return response.json() })
      .then((data: { version?: string; version_type?: string }[]) => {
        const releases = data.filter((item) => item.version && item.version_type === 'release').map((item) => item.version as string)
        setJavaVersions(Array.from(new Set(releases)))
      })
      .catch((error: unknown) => { if (!(error instanceof Error && error.name === 'AbortError')) setJavaVersions(['26.3', '26.2', '26.1.2', '26.1.1', '26.1', '1.21.11', '1.21.10', '1.21.8', '1.21.4', '1.21.1', '1.21', '1.20.4', '1.20.1', '1.19.4', '1.19.2', '1.18.2', '1.16.5', '1.12.2', '1.8.9']) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const projectType = ({ Mods: 'mod', Shaders: 'shader', 'Resource packs': 'resourcepack', Modpacks: 'modpack', 'Data packs': 'datapack', Maps: 'world', Plugins: 'plugin' } as Partial<Record<ExploreKind, string>>)[exploreKind]
    const facets: string[][] = []
    if (projectType) facets.push(['project_type:' + projectType])
    if (javaVersion !== 'all') facets.push(['versions:' + javaVersion])
    if (exploreKind === 'Mods' && modLoader !== 'all') facets.push(['categories:' + modLoader])
    const params = new URLSearchParams({ query: search.trim(), facets: JSON.stringify(facets), limit: '12', index: 'relevance' })
    setProjectsLoading(true)
    setProjectsError(false)
    fetch('https://api.modrinth.com/v2/search?' + params.toString(), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Catalogue request failed'); return response.json() })
      .then((data: { hits?: LiveProject[] }) => setLiveProjects(Array.isArray(data.hits) ? data.hits : []))
      .catch((error: unknown) => { if (error instanceof Error && error.name === 'AbortError') return; setProjectsError(true); setLiveProjects([]) })
      .finally(() => { if (!controller.signal.aborted) setProjectsLoading(false) })
    return () => controller.abort()
  }, [exploreKind, javaVersion, modLoader, search, catalogueRetry])
  const filteredDestinations = useMemo(() => destinations.filter((item) => {
    const matchKind = exploreKind === 'All' || item.kind === exploreKind
    const q = search.trim().toLowerCase()
    return matchKind && (!q || (item.name + ' ' + item.kind + ' ' + item.sub).toLowerCase().includes(q))
  }), [exploreKind, search])

  const goTo = (key: Section) => {
    setSection(key)
    setMobileOpen(false)
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <div className={rtl ? 'app rtl' : 'app'} dir={rtl ? 'rtl' : 'ltr'}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <nav id="primary-navigation" className={mobileOpen ? 'main-nav open' : 'main-nav'} aria-label={rtl ? 'پیمایش اصلی' : 'Main navigation'}>
          {navKeys.map((key, i) => <button key={key} className={section === key ? 'nav-link active' : 'nav-link'} onClick={() => { goTo(key); setMobileOpen(false) }}>{t.nav[i]}</button>)}
        </nav>
        <div className="top-actions">
          <button className="language-switch" onClick={() => setLocale(rtl ? 'en' : 'fa')} aria-label={rtl ? 'تغییر زبان به انگلیسی' : 'Switch language to Persian'}><Globe2 size={16} aria-hidden="true" /><span>{rtl ? 'EN' : 'فا'}</span></button>
          <button className="button button-small button-quiet account-button" onClick={(event) => { accountOpenerRef.current = event.currentTarget; setAccountNotice(true) }}>{t.signIn}<ArrowUpRight size={15} /></button>
          <button className="mobile-menu" aria-label={mobileOpen ? (rtl ? 'بستن منو' : 'Close menu') : (rtl ? 'باز کردن منو' : 'Open menu')} aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
    </header>

    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</div>
          <h1>{t.titleA}<br /><span>{t.titleB}</span></h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <div className="hero-ctas">
            <button className="button button-primary" onClick={() => goTo('explore')}>{t.explore}<ArrowRight size={17} /></button>
            <button className="button button-outline" onClick={() => goTo('servers')}>{t.browse}<ArrowDownRight size={17} /></button>
          </div>
          <div className="hero-proof"><span className="proof-icon"><ShieldCheck size={17} /></span><span>{t.signal}</span><span className="proof-line" /></div>
        </div>
        <div className="hero-art" aria-label="Abstract crystalline End-inspired portal illustration">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-orbit orbit-three" />
          <div className="portal-glow" />
          <div className="crystal crystal-main"><i /><b /><em /></div>
          <div className="crystal crystal-small crystal-left"><i /><b /><em /></div>
          <div className="crystal crystal-small crystal-right"><i /><b /><em /></div>
          <div className="crystal crystal-tiny crystal-top"><i /><b /><em /></div>
          <div className="art-scanline" />
          <div className="art-caption"><span className="caption-line" /><span>{locale === 'fa' ? 'بُعد ۰۱ · دروازه ناشناخته' : 'DIMENSION 01 · THE UNKNOWN'}</span><span className="caption-dot" /></div>
          <div className="floating-label label-top"><Sparkles size={13} /> {locale === 'fa' ? 'دنیاهای تازه صدایت می‌زنند…' : '“A NEW WORLD CALLS…”'}</div>
          <div className="floating-label label-bottom"><span className="mini-square" /> {locale === 'fa' ? 'جرئت ورود داری؟' : '“BRAVE ENOUGH TO ENTER?”'}</div>
        </div>
        <div className="hero-bottom"><span>{locale === 'fa' ? '۰۱ / کشف کن' : '01 / ENTER THE UNKNOWN'}</span><span className="bottom-rule" /><span>{locale === 'fa' ? 'کنجکاوی، آغاز ماجراست' : 'CURIOSITY OPENS WORLDS'}</span><span className="bottom-cross">✳</span></div>
      </section>

      <section className="trust-strip section-wrap" aria-label="Site principles">
        <div><ShieldCheck size={17} /><span>{t.trusted}</span></div>
        <div><Zap size={17} /><span>{locale === 'fa' ? 'سبک و سریع؛ بی‌وقفه ماجراجویی کن' : 'LIGHT ON LOAD. BIG ON ADVENTURE.'}</span></div>
        <div><Globe2 size={17} /><span>{locale === 'fa' ? 'جاوا یا بدراک؟ راهت را انتخاب کن' : 'JAVA OR BEDROCK? CHOOSE YOUR PATH.'}</span></div>
      </section>

      <section className="section-wrap content-section" id="explore">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" />{t.curated}</div><h2>{t.worlds}</h2><p>{t.worldsSub}</p></div>
          <button className="text-link" onClick={() => { setExploreKind('All'); setSearch('') }}>{t.viewAll}<ArrowUpRight size={16} /></button>
        </div>
        <div className="discovery-toolbar">
          <div className="search-box"><Search size={17} /><input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} aria-label={t.search} /><kbd>Ctrl/⌘ K</kbd></div>
          <div className="filter-pills" aria-label="Filter destination type">
            {kinds.map((kind) => <button key={kind} className={exploreKind === kind ? 'filter-pill selected' : 'filter-pill'} aria-pressed={exploreKind === kind} onClick={() => setExploreKind(kind)}>{kind === 'All' ? t.all : locale === 'fa' ? ({ Mods: 'مودها', Shaders: 'شیدرها', 'Resource packs': 'ریسورس‌پک‌ها', Modpacks: 'مودپک‌ها', 'Data packs': 'دیتاپک‌ها', Maps: 'نقشه‌ها', Plugins: 'پلاگین‌ها' }[kind] ?? kind) : kind}</button>)}
          </div>
          {exploreKind === 'Mods' && <div className="version-tools"><label htmlFor="mod-loader">{locale === 'fa' ? 'لودر مود' : 'MOD LOADER'}</label><select id="mod-loader" value={modLoader} onChange={(e) => setModLoader(e.target.value as ModLoader)}>{(['all', 'fabric', 'forge', 'neoforge', 'quilt'] as ModLoader[]).map((loader) => <option key={loader} value={loader}>{loader === 'all' ? (locale === 'fa' ? 'همه لودرها' : 'All loaders') : loader[0].toUpperCase() + loader.slice(1)}</option>)}</select></div>}
          <div className="version-tools"><label htmlFor="java-version">{locale === 'fa' ? 'نسخه جاوا' : 'JAVA VERSION'}</label><select id="java-version" value={javaVersion} onChange={(e) => setJavaVersion(e.target.value as JavaVersion)}>{['all', ...javaVersions].map((version) => <option key={version} value={version}>{version === 'all' ? (locale === 'fa' ? 'همه نسخه‌ها' : 'All versions') : version}</option>)}</select><a className="button button-outline version-browse" href={modrinthSearchUrl} target="_blank" rel="noreferrer">{locale === 'fa' ? 'جست‌وجوی همه پروژه‌ها' : 'Browse all projects'}<ArrowUpRight size={15} /></a></div>
        </div>
        <p className="catalogue-compatibility-hint" role="note">{t.compatibilityHint} <a className="text-link install-guide-link" href="https://github.com/mmatinghaffari1390-create/MineKage/blob/fix/initial-migration-syntax/docs/INSTALLING_MINECRAFT_CONTENT.md" target="_blank" rel="noreferrer">{t.installGuide}<ArrowUpRight size={15} /></a></p>
        <div className="destination-grid">
          {filteredDestinations.map((item, index) => {
            const Icon = item.icon
            return <article className={'destination-card card-' + item.color} key={item.id}>
              <div className="destination-art">
                <div className="art-grid" /><div className="landscape-back" /><div className="landscape-front" />
                <div className="destination-glyph"><Icon size={38} strokeWidth={1.25} /></div>
                <span className="destination-index">0{index + 1}</span><span className="destination-tag">{item.tag}</span>
              </div>
              <div className="destination-info"><div><h3>{item.name}</h3><p>{item.sub}</p></div><a className="round-arrow" href={item.url} target="_blank" rel="noreferrer" aria-label={locale === 'fa' ? `باز کردن صفحه رسمی ${item.name}` : `Open official page for ${item.name}`}><ArrowUpRight size={17} /></a></div>
            </article>
          })}
          {filteredDestinations.length === 0 && <div className="empty-state"><Search size={24} /><p>{t.noResults}</p></div>}
        </div>
        <div className="section-note"><span className="note-mark">i</span><p>{t.trustSub}</p></div>
        <div className="live-catalogue">
          <div className="live-catalogue-heading"><div><div className="eyebrow"><span className="eyebrow-dot" />{t.liveCatalog}</div><h3>{t.liveCatalogSub}</h3></div><span className="live-catalogue-count" aria-live="polite" aria-atomic="true">{projectsLoading ? t.loadingProjects : liveProjects.length + ' ' + t.liveCount}</span></div>
          {projectsError ? <div className="catalogue-message" role="alert" aria-live="assertive">{t.loadError} <button className="button button-outline" onClick={() => setCatalogueRetry((attempt) => attempt + 1)}>{t.retry}</button></div> : projectsLoading ? <div className="catalogue-message" role="status" aria-live="polite">{t.loadingProjects}</div> : liveProjects.length === 0 ? <div className="catalogue-message" role="status" aria-live="polite">{t.noResults}</div> : <div className="live-project-grid">
            {liveProjects.map((project) => <a className="live-project-card" href={'https://modrinth.com/project/' + project.slug} target="_blank" rel="noreferrer" key={project.project_id}>
              <div className="live-project-top">{project.icon_url ? <img src={project.icon_url} alt="" loading="lazy" /> : <span className="live-project-fallback"><Blocks size={20} /></span>}<span className="live-project-type">{locale === 'fa' ? ({ mod: 'مود', shader: 'شیدر', resourcepack: 'بسته منابع', modpack: 'مودپک', datapack: 'بسته داده', world: 'نقشه', plugin: 'افزونه' } as Record<string, string>)[project.project_type] || project.project_type : project.project_type}</span></div>
              <h4>{project.title}</h4><p>{project.description}</p>{project.categories?.length > 0 && <div className="project-tags" aria-label={locale === 'fa' ? 'دسته‌ها و لودرهای سازگار' : 'Categories and compatible loaders'}>{project.categories.slice(0, 4).map((category) => <span key={category}>{category.replace(/_/g, ' ')}</span>)}</div>}{project.versions?.length > 0 && <div className="project-tags project-versions" aria-label={locale === 'fa' ? 'نسخه‌های بازی پشتیبانی‌شده' : 'Supported Minecraft versions'}>{project.versions.slice(0, 4).map((version) => <span key={version}>{version}</span>)}{project.versions.length > 4 && <span>+{project.versions.length - 4}</span>}</div>}<div className="live-project-meta"><span>{project.author}</span><span>{new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(project.downloads)} {t.downloads}</span></div>
            </a>)}
          </div>}
          <a className="text-link live-catalogue-link" href={modrinthSearchUrl} target="_blank" rel="noreferrer">{locale === 'fa' ? 'باز کردن کاتالوگ رسمی مودرینث' : 'Open the official Modrinth catalogue'}<ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="server-section" id="servers">
        <div className="section-wrap content-section">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-dot" />{t.featured}</div><h2>{t.servers}</h2><p>{t.serversSub}</p></div><span className="status-pill"><span className="status-dot" />{t.status}</span></div>
          <div className="server-grid">{serverTypes.map((server, i) => {
            const Icon = server.icon
            return <article className="server-card" key={server.name}><div className="server-card-top"><span className="server-icon"><Icon size={21} /></span><span className="server-number">0{i + 1}</span></div><span className="server-tag">{server.tag}</span><h3>{locale === 'fa' ? [ 'سرورهای بقا', 'کارگاه‌های خلاقیت', 'مجموعه مینی‌گیم' ][i] : server.name}</h3><p>{locale === 'fa' ? ['دنیاهای طولانی‌مدت، اقتصاد بازیکنان و داستان‌های مشترک.','آزادانه بساز، همکاری کن و ایده‌های بزرگ را اجرا کن.','دورهای سریع، رقابت دوستانه و چالش‌های تازه.'][i] : server.desc}</p><div className="server-card-bottom"><span><span className="status-dot muted" />{t.status}</span><a className="icon-link" href="https://minecraftservers.org/" target="_blank" rel="noopener noreferrer" aria-label={t.detail} title={t.detail}><ArrowUpRight size={17} /></a></div></article>
          })}</div>
        </div>
      </section>

      <section className="section-wrap content-section mods-section" id="mods">
        <div className="mods-panel"><div className="mods-orb"><Blocks size={38} strokeWidth={1.2} /><span className="orb-ring" /><span className="orb-ring ring-two" /></div><div className="mods-copy"><div className="eyebrow"><span className="eyebrow-dot" />{t.trusted}</div><h2>{t.mods}</h2><p>{t.modsSub}</p><div className="mod-tags"><span>FABRIC</span><span>FORGE</span><span>NEOFORGE</span><span>VERSION CHECKS</span></div></div><button className="button button-primary" onClick={() => goTo('explore')}>{t.viewAll}<ArrowRight size={16} /></button></div>
      </section>

      <section className="section-wrap content-section community-section" id="community">
        <div className="community-panel"><div className="community-art"><div className="community-ring ring-a" /><div className="community-ring ring-b" /><div className="community-emblem"><Users size={34} /></div><span className="community-spark spark-a">✦</span><span className="community-spark spark-b">✧</span></div><div className="community-copy"><div className="eyebrow"><span className="eyebrow-dot" />{t.members}</div><h2>{t.community}</h2><p>{t.communitySub}</p><button className="button button-outline" onClick={() => setAccountNotice(true)}>{t.signIn}<ArrowUpRight size={16} /></button></div></div>
      </section>

      <section className="section-wrap mini-sections">
        <article className="mini-panel" id="live"><span className="mini-panel-icon"><Gamepad2 size={20} /></span><span className="mini-panel-label">LIVE / CREATORS</span><h3>{locale === 'fa' ? 'سازندگان را کشف کن' : 'Discover creators'}</h3><p>{locale === 'fa' ? 'تا زمان اتصال کانال رسمی MineKage، می‌توانی پخش‌های زنده ماینکرفت را در یوتیوب ببینی.' : 'Until an official MineKage channel is connected, browse Minecraft live streams on YouTube.'}</p><a className="button button-outline" href="https://www.youtube.com/live" target="_blank" rel="noopener noreferrer">{locale === 'fa' ? 'مشاهده پخش‌های زنده' : 'Browse live streams'}<ArrowUpRight size={16} /></a></article>
        <article className="mini-panel leaderboard-panel" id="leaderboard">
          <div className="leaderboard-heading"><div><span className="mini-panel-label">LEADERBOARD / COMMUNITY</span><h3>{locale === 'fa' ? 'رده‌بندی بازیکنان' : 'Community leaderboard'}</h3><p>{locale === 'fa' ? 'جدول رتبه‌بندی آماده است؛ رتبه‌ها پس از اتصال داده معتبر بازیکنان نمایش داده می‌شوند.' : 'The leaderboard is ready; player rankings will appear once verified player data is connected.'}</p></div><span className="mini-panel-icon"><Zap size={20} /></span></div>
          <div className="leaderboard-preview">
            <div className="leaderboard-row leaderboard-header"><span>{locale === 'fa' ? 'رتبه' : 'RANK'}</span><span>{locale === 'fa' ? 'بازیکن' : 'PLAYER'}</span><span>{locale === 'fa' ? 'وضعیت' : 'STATUS'}</span></div>
            <div className="leaderboard-empty"><span className="leaderboard-empty-icon"><Users size={20} /></span><div><strong>{locale === 'fa' ? 'داده بازیکنان هنوز متصل نیست' : 'Player data is not connected yet'}</strong><small>{locale === 'fa' ? 'برای جلوگیری از آمار ساختگی، تا اتصال منبع معتبر رتبه‌ای نمایش داده نمی‌شود.' : 'To avoid fabricated stats, rankings stay empty until a verified source is connected.'}</small></div><span className="data-waiting">{locale === 'fa' ? 'در انتظار داده' : 'AWAITING DATA'}</span></div>
          </div>
        </article>
      </section>

      <section className="section-wrap account-callout">
        <div className="account-shield"><Heart size={24} /></div><div className="account-copy"><h2>{t.account}</h2><p>{t.accountSub}</p></div><button className="button button-outline" onClick={() => setAccountNotice(true)}>{t.signIn}<ArrowUpRight size={16} /></button>
      </section>
    </main>

    <footer className="footer"><div className="section-wrap footer-main"><div className="footer-brand"><Brand /><p>{t.footer}</p></div><div className="footer-links"><div><span>{t.footerExplore}</span><button onClick={() => goTo('servers')}>{t.nav[1]}</button><button onClick={() => goTo('mods')}>{t.nav[2]}</button><button onClick={() => goTo('explore')}>{t.nav[3]}</button></div><div><span>{t.footerCommunity}</span><button onClick={() => goTo('community')}>{t.nav[5]}</button><button onClick={() => goTo('leaderboard')}>{t.nav[6]}</button><button onClick={(event) => { accountOpenerRef.current = event.currentTarget; setAccountNotice(true) }}>{t.signIn}</button></div></div></div><div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} MINEKAGE</span><span>{t.legal}</span><span>{t.footerNote}</span></div></footer>

    {accountNotice && <div className="modal-backdrop" role="presentation" onClick={() => setAccountNotice(false)}><div className="notice-modal" role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={(e) => e.stopPropagation()}><button ref={modalCloseRef} className="modal-close" onClick={() => setAccountNotice(false)} aria-label={rtl ? 'بستن پنجره' : 'Close dialog'}><X size={19} aria-hidden="true" /></button><span className="modal-icon"><ShieldCheck size={24} /></span><h2 id="notice-title">{t.account}</h2><p>{t.accountSub}</p><div className="modal-status"><span className="status-dot muted" />{t.soon}</div><button className="button button-primary modal-done" onClick={() => setAccountNotice(false)}><Check size={16} aria-hidden="true" /> {rtl ? 'باشه' : 'OK'}</button></div></div>}
  </div>
}

export default App
