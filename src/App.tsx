import { useMemo, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, Check, ChevronDown,
  Compass, Gamepad2, Globe2, Gem, Heart, Menu, Search, ShieldCheck,
  Sparkles, Swords, Users, X, Zap,
} from 'lucide-react'

type Locale = 'en' | 'fa'
type Section = 'home' | 'servers' | 'mods' | 'explore' | 'live' | 'community' | 'leaderboard'
type ExploreKind = 'All' | 'Maps' | 'Shaders' | 'Resource packs' | 'Builds'

const copy = {
  en: {
    eyebrow: 'A COMMUNITY BEYOND THE ORDINARY',
    titleA: 'Your next world',
    titleB: 'starts here.',
    subtitle: 'Find extraordinary servers, discover trusted mods, and meet the builders shaping the Minecraft universe.',
    explore: 'Explore the universe', browse: 'Browse servers', online: 'LIVE STATUS NOT CONNECTED',
    nav: ['Home', 'Servers', 'Mods', 'Explore', 'Live', 'Community', 'Leaderboard'],
    signal: 'BUILT FOR THE BLOCK-BY-BLOCK',
    worlds: 'Worlds worth getting lost in',
    worldsSub: 'Handpicked starting points for your next adventure.',
    servers: 'Find your next server',
    serversSub: 'Explore communities by play style, edition, and vibe.',
    mods: 'Upgrade your world',
    modsSub: 'Discover add-ons with source and compatibility details.',
    community: 'Made better together',
    communitySub: 'Meet players, follow their work, and build your circle.',
    viewAll: 'View all', featured: 'FEATURED DESTINATIONS', curated: 'CURATED DISCOVERY',
    java: 'JAVA EDITION', bedrock: 'BEDROCK', survival: 'SURVIVAL', creative: 'CREATIVE',
    adventure: 'ADVENTURE', minigames: 'MINIGAMES', trusted: 'SOURCE-FIRST PICKS',
    trustSub: 'Every listing should show where it comes from. No fake download buttons, ratings, or live counts.',
    members: 'COMMUNITY', account: 'Account features are not connected yet',
    accountSub: 'Authentication will be enabled after secure backend configuration.',
    signIn: 'Sign-in coming soon', footer: 'A community project for the love of Minecraft.',
    legal: 'Independent fan project. Not affiliated with Mojang or Microsoft.',
    search: 'Search worlds, mods, servers…', all: 'All', noResults: 'No matching items. Try another search.',
    status: 'Status provider not connected', soon: 'Planned', detail: 'Details coming soon',
    footerExplore: 'EXPLORE', footerCommunity: 'COMMUNITY', footerNote: 'Made for curious players.',
  },
  fa: {
    eyebrow: 'جامعه‌ای فراتر از معمول',
    titleA: 'دنیای بعدی تو',
    titleB: 'از اینجا شروع می‌شود.',
    subtitle: 'سرورهای خاص را پیدا کن، مودهای معتبر را بشناس و با سازندگان دنیای ماینکرفت آشنا شو.',
    explore: 'گشت‌وگذار در دنیاها', browse: 'دیدن سرورها', online: 'وضعیت زنده متصل نیست',
    nav: ['خانه', 'سرورها', 'مودها', 'اکتشاف', 'پخش زنده', 'جامعه', 'رتبه‌بندی'],
    signal: 'ساخته‌شده برای ماجراجویی بلوک‌به‌بلوک',
    worlds: 'دنیاهایی برای کشف‌کردن',
    worldsSub: 'چند نقطه شروع برای ماجراجویی بعدی تو.',
    servers: 'سرور بعدی‌ات را پیدا کن',
    serversSub: 'جامعه‌ها را بر اساس سبک بازی و نسخه بررسی کن.',
    mods: 'دنیایت را ارتقا بده',
    modsSub: 'افزونه‌ها را همراه با منبع و سازگاری بررسی کن.',
    community: 'کنار هم بهتر می‌سازیم',
    communitySub: 'بازیکن‌ها را بشناس و سازندگان مورد علاقه‌ات را دنبال کن.',
    viewAll: 'مشاهده همه', featured: 'مقصدهای منتخب', curated: 'اکتشاف گزینش‌شده',
    java: 'نسخه جاوا', bedrock: 'بدراک', survival: 'بقا', creative: 'خلاقانه',
    adventure: 'ماجراجویی', minigames: 'مینی‌گیم', trusted: 'منبع در اولویت',
    trustSub: 'هر مورد باید منبع مشخص داشته باشد؛ بدون دکمه دانلود، امتیاز یا آمار زنده ساختگی.',
    members: 'جامعه', account: 'امکانات حساب هنوز متصل نشده‌اند',
    accountSub: 'ورود پس از تنظیم امن سرویس پشتیبان فعال خواهد شد.',
    signIn: 'ورود به‌زودی', footer: 'پروژه‌ای اجتماعی برای عشق به ماینکرفت.',
    legal: 'پروژه مستقل هواداری؛ وابسته به Mojang یا Microsoft نیست.',
    search: 'جست‌وجوی دنیا، مود و سرور…', all: 'همه', noResults: 'موردی پیدا نشد؛ عبارت دیگری را امتحان کن.',
    status: 'سرویس وضعیت متصل نیست', soon: 'در برنامه', detail: 'جزئیات به‌زودی',
    footerExplore: 'اکتشاف', footerCommunity: 'جامعه', footerNote: 'برای بازیکنان کنجکاو.',
  },
} as const

const destinations = [
  { id: 1, kind: 'Maps', name: 'The Lost Citadel', sub: 'Adventure map · source to be verified', tag: 'ADVENTURE', color: 'violet', icon: Compass },
  { id: 2, kind: 'Shaders', name: 'Softlight Worlds', sub: 'Shader pack · compatibility pending', tag: 'VISUALS', color: 'blue', icon: Sparkles },
  { id: 3, kind: 'Builds', name: 'Obsidian Observatory', sub: 'Build inspiration · creator credit pending', tag: 'BUILD', color: 'pink', icon: Blocks },
  { id: 4, kind: 'Resource packs', name: 'Pixel Reforged', sub: 'Resource pack · license to be verified', tag: 'TEXTURES', color: 'green', icon: Gem },
]

const serverTypes = [
  { name: 'Survival realms', desc: 'Long-term worlds, player economies, and shared stories.', icon: Swords, tag: 'SURVIVAL' },
  { name: 'Creative studios', desc: 'Build freely, collaborate, and bring ambitious ideas to life.', icon: Blocks, tag: 'CREATIVE' },
  { name: 'Mini-game hubs', desc: 'Quick rounds, friendly competition, and new challenges.', icon: Gamepad2, tag: 'MINIGAMES' },
]

function Brand() {
  return <a className="brand" href="#home" aria-label="MineKage home">
    <span className="brand-mark"><Gem size={22} strokeWidth={1.8} /></span>
    <span className="brand-word">MINE<span>KAGE</span><small>FIND YOUR NEXT WORLD</small></span>
  </a>
}

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [section, setSection] = useState<Section>('home')
  const [search, setSearch] = useState('')
  const [exploreKind, setExploreKind] = useState<ExploreKind>('All')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountNotice, setAccountNotice] = useState(false)
  const t = copy[locale]
  const rtl = locale === 'fa'
  const navKeys: Section[] = ['home', 'servers', 'mods', 'explore', 'live', 'community', 'leaderboard']
  const kinds: ExploreKind[] = ['All', 'Maps', 'Shaders', 'Resource packs', 'Builds']

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
        <nav className={mobileOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          {navKeys.map((key, i) => <button key={key} className={section === key ? 'nav-link active' : 'nav-link'} onClick={() => goTo(key)}>{t.nav[i]}</button>)}
        </nav>
        <div className="top-actions">
          <button className="language-switch" onClick={() => setLocale(rtl ? 'en' : 'fa')} aria-label="Switch language"><Globe2 size={16} /><span>{rtl ? 'EN' : 'فا'}</span></button>
          <button className="button button-small button-quiet account-button" onClick={() => setAccountNotice(true)}>{t.signIn}<ArrowUpRight size={15} /></button>
          <button className="mobile-menu" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
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
          <div className="art-caption"><span className="caption-line" /><span>DIMENSION 01</span><span className="caption-dot" /></div>
          <div className="floating-label label-top"><Sparkles size={13} /> NEW WORLDS AWAIT</div>
          <div className="floating-label label-bottom"><span className="mini-square" /> MADE FOR EXPLORERS</div>
        </div>
        <div className="hero-bottom"><span>01 / DISCOVER</span><span className="bottom-rule" /><span>CRAFTED FOR CURIOSITY</span><span className="bottom-cross">✳</span></div>
      </section>

      <section className="trust-strip section-wrap" aria-label="Site principles">
        <div><ShieldCheck size={17} /><span>{t.trusted}</span></div>
        <div><Zap size={17} /><span>LIGHTWEIGHT BY DESIGN</span></div>
        <div><Globe2 size={17} /><span>BUILT FOR BOTH EDITIONS</span></div>
      </section>

      <section className="section-wrap content-section" id="explore">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" />{t.curated}</div><h2>{t.worlds}</h2><p>{t.worldsSub}</p></div>
          <button className="text-link" onClick={() => { setExploreKind('All'); setSearch('') }}>{t.viewAll}<ArrowUpRight size={16} /></button>
        </div>
        <div className="discovery-toolbar">
          <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} aria-label={t.search} /><kbd>⌘ K</kbd></div>
          <div className="filter-pills" aria-label="Filter destination type">
            {kinds.map((kind) => <button key={kind} className={exploreKind === kind ? 'filter-pill selected' : 'filter-pill'} onClick={() => setExploreKind(kind)}>{kind === 'All' ? t.all : kind}</button>)}
          </div>
        </div>
        <div className="destination-grid">
          {filteredDestinations.map((item, index) => {
            const Icon = item.icon
            return <article className={'destination-card card-' + item.color} key={item.id}>
              <div className="destination-art">
                <div className="art-grid" /><div className="landscape-back" /><div className="landscape-front" />
                <div className="destination-glyph"><Icon size={38} strokeWidth={1.25} /></div>
                <span className="destination-index">0{index + 1}</span><span className="destination-tag">{item.tag}</span>
              </div>
              <div className="destination-info"><div><h3>{item.name}</h3><p>{item.sub}</p></div><button className="round-arrow" onClick={() => setAccountNotice(true)} aria-label={t.detail}><ArrowUpRight size={17} /></button></div>
            </article>
          })}
          {filteredDestinations.length === 0 && <div className="empty-state"><Search size={24} /><p>{t.noResults}</p></div>}
        </div>
        <div className="section-note"><span className="note-mark">i</span><p>{t.trustSub}</p></div>
      </section>

      <section className="server-section" id="servers">
        <div className="section-wrap content-section">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-dot" />{t.featured}</div><h2>{t.servers}</h2><p>{t.serversSub}</p></div><span className="status-pill"><span className="status-dot" />{t.status}</span></div>
          <div className="server-grid">{serverTypes.map((server, i) => {
            const Icon = server.icon
            return <article className="server-card" key={server.name}><div className="server-card-top"><span className="server-icon"><Icon size={21} /></span><span className="server-number">0{i + 1}</span></div><span className="server-tag">{server.tag}</span><h3>{locale === 'fa' ? [ 'سرورهای بقا', 'کارگاه‌های خلاقیت', 'مجموعه مینی‌گیم' ][i] : server.name}</h3><p>{locale === 'fa' ? ['دنیاهای طولانی‌مدت، اقتصاد بازیکنان و داستان‌های مشترک.','آزادانه بساز، همکاری کن و ایده‌های بزرگ را اجرا کن.','دورهای سریع، رقابت دوستانه و چالش‌های تازه.'][i] : server.desc}</p><div className="server-card-bottom"><span><span className="status-dot muted" />{t.status}</span><button className="icon-link" onClick={() => setAccountNotice(true)} aria-label={t.detail}><ArrowUpRight size={17} /></button></div></article>
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
        <article className="mini-panel" id="live"><span className="mini-panel-icon"><Gamepad2 size={20} /></span><span className="mini-panel-label">LIVE / CREATORS</span><h3>{locale === 'fa' ? 'سازندگان را کشف کن' : 'Discover creators'}</h3><p>{locale === 'fa' ? 'وقتی منبع معتبر متصل شد، پخش‌های تأییدشده نمایش داده می‌شوند.' : 'Verified streams will appear when a trusted source is configured.'}</p><span className="coming-tag">{t.soon}</span></article>
        <article className="mini-panel" id="leaderboard"><span className="mini-panel-icon"><Zap size={20} /></span><span className="mini-panel-label">LEADERBOARD / REAL DATA</span><h3>{locale === 'fa' ? 'پیشرفت واقعی' : 'Progress that counts'}</h3><p>{locale === 'fa' ? 'رتبه‌بندی پس از انتخاب معیار و اتصال داده واقعی فعال می‌شود.' : 'Rankings wait for a real metric and verified data source.'}</p><span className="coming-tag">{t.soon}</span></article>
      </section>

      <section className="section-wrap account-callout">
        <div className="account-shield"><Heart size={24} /></div><div className="account-copy"><h2>{t.account}</h2><p>{t.accountSub}</p></div><button className="button button-outline" onClick={() => setAccountNotice(true)}>{t.signIn}<ArrowUpRight size={16} /></button>
      </section>
    </main>

    <footer className="footer"><div className="section-wrap footer-main"><div className="footer-brand"><Brand /><p>{t.footer}</p></div><div className="footer-links"><div><span>{t.footerExplore}</span><button onClick={() => goTo('servers')}>{t.nav[1]}</button><button onClick={() => goTo('mods')}>{t.nav[2]}</button><button onClick={() => goTo('explore')}>{t.nav[3]}</button></div><div><span>{t.footerCommunity}</span><button onClick={() => goTo('community')}>{t.nav[5]}</button><button onClick={() => goTo('leaderboard')}>{t.nav[6]}</button><button onClick={() => setAccountNotice(true)}>{t.signIn}</button></div></div></div><div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} MINEKAGE</span><span>{t.legal}</span><span>{t.footerNote}</span></div></footer>

    {accountNotice && <div className="modal-backdrop" role="presentation" onClick={() => setAccountNotice(false)}><div className="notice-modal" role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setAccountNotice(false)} aria-label="Close"><X size={19} /></button><span className="modal-icon"><ShieldCheck size={24} /></span><h2 id="notice-title">{t.account}</h2><p>{t.accountSub}</p><div className="modal-status"><span className="status-dot muted" />{t.soon}</div><button className="button button-primary modal-done" onClick={() => setAccountNotice(false)}><Check size={16} /> OK</button></div></div>}
  </div>
}

export default App
