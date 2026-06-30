const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-opus-4.8';
const crypto = require('crypto');

const DESIGN_VARIANTS = [
    {
        name: 'executive teal',
        palette: { primary: '#0f766e', secondary: '#f8fafc', accent: '#f97316', ink: '#111827' },
        mood: 'clean enterprise SaaS with crisp analytics panels',
    },
    {
        name: 'signal blue',
        palette: { primary: '#2563eb', secondary: '#f8fafc', accent: '#10b981', ink: '#0f172a' },
        mood: 'modern B2B product with trustworthy data visualization',
    },
    {
        name: 'graphite lime',
        palette: { primary: '#18181b', secondary: '#f4f4f5', accent: '#84cc16', ink: '#09090b' },
        mood: 'premium operations console with sharp contrast',
    },
    {
        name: 'ruby cloud',
        palette: { primary: '#be123c', secondary: '#fff7ed', accent: '#7c3aed', ink: '#1f2937' },
        mood: 'bold growth platform with editorial polish',
    },
    {
        name: 'indigo gold',
        palette: { primary: '#4338ca', secondary: '#f8fafc', accent: '#eab308', ink: '#111827' },
        mood: 'ambitious startup command center with investor-grade UI',
    },
];

const DOMAIN_PROFILES = {
    clothing: {
        keywords: ['clothing', 'fashion', 'apparel', 'streetwear', 'hoodie', 't-shirt', 'tee', 'shirt', 'sneaker', 'boutique', 'garment', 'wear', 'brand drop'],
        label: 'Clothing',
        eyebrow: 'Fashion label',
        nav: ['Collection', 'Lookbook', 'Drops'],
        productHeading: 'Shop the first drop.',
        platformHeading: 'A brand world built around product, fit, and culture.',
        campaignHeading: 'Instagram creatives ready for the next drop.',
        heroPanelTitle: 'New collection',
        heroPanelItems: ['Oversized hoodie', 'Heavyweight tee', 'Logo cap'],
        logoMotif: 'hanger, garment tag, stitched monogram',
        products: [
            { suffix: 'Signature Hoodie', price: '$89', value: 'Premium fleece hoodie with embroidered logo, oversized fit, and drop-ready colorway.', itemType: 'hoodie' },
            { suffix: 'Heavyweight Tee', price: '$42', value: 'Structured cotton tee with front chest mark and oversized back graphic.', itemType: 'tee' },
            { suffix: 'Logo Cap', price: '$34', value: 'Six-panel cap with stitched brand mark and adjustable strap.', itemType: 'cap' },
            { suffix: 'Everyday Tote', price: '$28', value: 'Canvas tote with bold campaign artwork for daily carry and launch merch.', itemType: 'tote' },
            { suffix: 'Drop Jacket', price: '$128', value: 'Lightweight statement jacket with contrast panels and limited-run detailing.', itemType: 'jacket' },
        ],
        hashtags: ['#streetwear', '#fashionbrand', '#newdrop', '#ootd'],
    },
    food: {
        keywords: ['restaurant', 'food', 'cafe', 'coffee', 'bakery', 'meal', 'kitchen', 'delivery', 'dining'],
        label: 'Food',
        eyebrow: 'Food brand',
        nav: ['Menu', 'Story', 'Order'],
        productHeading: 'Signature menu items.',
        platformHeading: 'A flavorful brand system for hungry customers.',
        campaignHeading: 'Post-ready food campaign creatives.',
        heroPanelTitle: 'Today\'s specials',
        heroPanelItems: ['Signature plate', 'Chef special', 'Fresh drink'],
        logoMotif: 'plate, steam, chef mark',
        products: [
            { suffix: 'Signature Bowl', price: '$14', value: 'Hero menu item built for dine-in, pickup, and social photography.', itemType: 'bowl' },
            { suffix: 'Chef Special', price: '$18', value: 'High-margin featured dish with bold flavor and premium plating.', itemType: 'plate' },
            { suffix: 'Fresh Drink', price: '$7', value: 'Branded beverage designed for repeat orders and visual appeal.', itemType: 'drink' },
            { suffix: 'Tasting Box', price: '$24', value: 'Curated sampler for first-time customers and delivery campaigns.', itemType: 'box' },
            { suffix: 'Party Pack', price: '$59', value: 'Group-size offer for events, offices, and weekend gatherings.', itemType: 'pack' },
        ],
        hashtags: ['#foodie', '#freshmenu', '#localfood', '#dining'],
    },
    fitness: {
        keywords: ['fitness', 'gym', 'workout', 'training', 'yoga', 'wellness', 'coach', 'sports'],
        label: 'Fitness',
        eyebrow: 'Fitness brand',
        nav: ['Programs', 'Results', 'Join'],
        productHeading: 'Programs and membership offers.',
        platformHeading: 'A performance brand for consistent progress.',
        campaignHeading: 'Motivational social creatives.',
        heroPanelTitle: 'Training plan',
        heroPanelItems: ['Strength block', 'Mobility day', 'Coach check-in'],
        logoMotif: 'motion mark, strength symbol',
        products: [
            { suffix: 'Starter Plan', price: '$39/mo', value: 'Beginner training plan with weekly structure and habit tracking.', itemType: 'plan' },
            { suffix: 'Strength Program', price: '$89/mo', value: 'Progressive strength plan with guided workouts and performance metrics.', itemType: 'strength' },
            { suffix: 'Nutrition Add-on', price: '$49/mo', value: 'Meal guidance, macro targets, and weekly accountability.', itemType: 'nutrition' },
            { suffix: 'Group Class Pass', price: '$99/mo', value: 'Flexible access to high-energy classes and community workouts.', itemType: 'class' },
            { suffix: 'Elite Coaching', price: 'Custom', value: 'Personalized coaching with form review, testing, and custom programming.', itemType: 'coach' },
        ],
        hashtags: ['#fitness', '#training', '#wellness', '#workout'],
    },
    default: {
        keywords: [],
        label: 'SaaS',
        eyebrow: 'Company platform',
        nav: ['Platform', 'Products', 'Campaigns'],
        productHeading: 'Five launch-ready products.',
        platformHeading: 'Everything a serious company needs to launch with confidence.',
        campaignHeading: 'Campaign angles ready for paid, organic, and outbound channels.',
        heroPanelTitle: 'Launch readiness',
        heroPanelItems: ['Brand system approved', 'Campaigns queued', 'Database ready'],
        logoMotif: 'abstract growth mark',
        products: [
            { suffix: 'Core', price: '$29/mo', value: 'Essential workspace for validating the idea and collecting leads.', itemType: 'core' },
            { suffix: 'Flow', price: '$79/mo', value: 'Workflow automation, dashboards, and team collaboration for active operators.', itemType: 'flow' },
            { suffix: 'Growth', price: '$149/mo', value: 'Campaign planning, CRM capture, reporting, and conversion experiments.', itemType: 'growth' },
            { suffix: 'Data', price: '$249/mo', value: 'Database-backed insights, customer segments, and executive scorecards.', itemType: 'data' },
            { suffix: 'Enterprise', price: 'Custom', value: 'Custom onboarding, security, integrations, and high-touch launch support.', itemType: 'enterprise' },
        ],
        hashtags: ['#startup', '#saas', '#growth', '#launch'],
    },
};

function slugify(value) {
    return String(value || 'startup')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64) || 'startup';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function svgToDataUrl(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeDesignVariant() {
    const seed = crypto.randomBytes(8).toString('hex');
    const index = parseInt(seed.slice(0, 2), 16) % DESIGN_VARIANTS.length;
    return {
        ...DESIGN_VARIANTS[index],
        seed,
        angle: 110 + (parseInt(seed.slice(2, 4), 16) % 80),
    };
}

function detectDomain(project) {
    const text = [
        project?.name,
        project?.category,
        project?.tagline,
        project?.description,
    ].filter(Boolean).join(' ').toLowerCase();

    for (const [key, profile] of Object.entries(DOMAIN_PROFILES)) {
        if (key === 'default') continue;
        if (profile.keywords.some((keyword) => text.includes(keyword))) {
            return { key, ...profile };
        }
    }
    return { key: 'default', ...DOMAIN_PROFILES.default };
}

function domainProducts(brand) {
    const profile = brand.domainProfile || DOMAIN_PROFILES.default;
    return profile.products.map((product) => ({
        name: `${brand.websiteName} ${product.suffix}`,
        price: product.price,
        value: product.value,
        itemType: product.itemType,
        productImagePrompt: `${profile.label} product image for ${brand.websiteName} ${product.suffix}: ${product.value}`,
    }));
}

function makeLogoSvg(name, palette, variant = {}, domainProfile = DOMAIN_PROFILES.default) {
    const initials = String(name || 'AI')
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AI';
    const primary = palette?.primary || '#14b8a6';
    const secondary = palette?.secondary || '#f8fafc';
    const accent = palette?.accent || '#f97316';
    const angle = variant.angle || 135;

    if (domainProfile.key === 'clothing') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeHtml(name)} clothing logo"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1" gradientTransform="rotate(${angle})"><stop stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="512" height="512" rx="88" fill="url(#g)"/><path d="M256 122c0-28 24-50 54-50 24 0 44 14 52 34" fill="none" stroke="${secondary}" stroke-width="24" stroke-linecap="round"/><path d="M256 148 128 238c-16 11-8 36 12 36h232c20 0 28-25 12-36L256 148Z" fill="none" stroke="${secondary}" stroke-width="24" stroke-linejoin="round"/><path d="M152 286h208l-26 118H178l-26-118Z" fill="${secondary}" opacity=".9"/><path d="M206 286c8 28 28 44 50 44s42-16 50-44" fill="none" stroke="${primary}" stroke-width="18" stroke-linecap="round"/><text x="256" y="396" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900" fill="${primary}">${escapeHtml(initials)}</text></svg>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeHtml(name)} logo"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1" gradientTransform="rotate(${angle})"><stop stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="512" height="512" rx="${72 + (angle % 42)}" fill="url(#g)"/><path d="M96 338c44-136 132-204 264-204 30 0 56 7 78 20-45 14-78 42-99 83-43 83-111 117-243 101Z" fill="${secondary}" opacity=".2"/><path d="M150 356c34-88 88-132 162-132 44 0 78 14 102 43-31-3-58 7-81 31-45 48-93 67-183 58Z" fill="${secondary}" opacity=".88"/><circle cx="375" cy="137" r="46" fill="${secondary}" opacity=".92"/><text x="256" y="305" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="112" font-weight="850" fill="${primary}">${escapeHtml(initials)}</text></svg>`;
}

function makeProductImageSvg(product, brand, index) {
    const palette = brand.palette || {};
    const primary = palette.primary || '#0f766e';
    const secondary = palette.secondary || '#f8fafc';
    const accent = palette.accent || '#f97316';
    const title = escapeHtml(product.name || `Product ${index + 1}`);
    const value = escapeHtml(product.value || 'Product concept');
    const y = 80 + index * 6;

    if (brand.domainProfile?.key === 'clothing') {
        const item = product.itemType || ['hoodie', 'tee', 'cap', 'tote', 'jacket'][index % 5];
        const apparel = {
            hoodie: `<path d="M418 250c20-78 74-122 182-122s162 44 182 122l88 42-62 138-66-28v230H458V402l-66 28-62-138 88-42Z" fill="${primary}"/><path d="M526 146c14 42 42 64 74 64s60-22 74-64" fill="none" stroke="${secondary}" stroke-width="28" stroke-linecap="round"/><path d="M520 306h160v210H520z" fill="${secondary}" opacity=".18"/><text x="600" y="432" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="${secondary}">${escapeHtml((brand.websiteName || 'DB').slice(0, 2).toUpperCase())}</text>`,
            tee: `<path d="M382 230 502 158h196l120 72 62 116-104 62-38-62v286H462V346l-38 62-104-62 62-116Z" fill="${primary}"/><path d="M520 158c12 44 44 70 80 70s68-26 80-70" fill="${secondary}" opacity=".88"/><text x="600" y="424" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="70" font-weight="900" fill="${secondary}">${escapeHtml((brand.websiteName || 'DB').slice(0, 2).toUpperCase())}</text>`,
            cap: `<path d="M310 432c48-116 150-178 300-178 122 0 212 48 270 146-148-28-286-18-414 30-62 23-114 24-156 2Z" fill="${primary}"/><path d="M292 440c156 24 316 10 480-42 70-22 126-22 168 0-70 66-170 104-300 114-138 11-254-13-348-72Z" fill="${accent}"/><text x="604" y="381" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="60" font-weight="900" fill="${secondary}">${escapeHtml((brand.websiteName || 'DB').slice(0, 2).toUpperCase())}</text>`,
            tote: `<rect x="392" y="244" width="416" height="390" rx="34" fill="${primary}"/><path d="M500 272c0-76 40-118 100-118s100 42 100 118" fill="none" stroke="${accent}" stroke-width="28" stroke-linecap="round"/><text x="600" y="470" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900" fill="${secondary}">${escapeHtml((brand.websiteName || 'DB').slice(0, 2).toUpperCase())}</text>`,
            jacket: `<path d="M430 180h130l40 76 40-76h130l84 104-70 76-40-42v316H456V318l-40 42-70-76 84-104Z" fill="${primary}"/><path d="M600 256v378" stroke="${secondary}" stroke-width="18" opacity=".8"/><path d="M510 346h70M620 346h70" stroke="${accent}" stroke-width="18" stroke-linecap="round"/><text x="600" y="498" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900" fill="${secondary}">${escapeHtml((brand.websiteName || 'DB').slice(0, 2).toUpperCase())}</text>`,
        }[item] || '';

        return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${title} clothing product image"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${secondary}"/><stop offset="1" stop-color="${accent}" stop-opacity=".22"/></linearGradient></defs><rect width="1200" height="800" rx="54" fill="url(#bg)"/><rect x="70" y="70" width="1060" height="660" rx="44" fill="#fff" opacity=".78"/><text x="104" y="142" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800" fill="${primary}">DROP 0${index + 1}</text>${apparel}<text x="104" y="642" font-family="Inter, Arial, sans-serif" font-size="50" font-weight="900" fill="#111827">${title}</text><text x="104" y="694" font-family="Inter, Arial, sans-serif" font-size="24" fill="#5b6472">${value.slice(0, 86)}</text></svg>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${title} product image"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${secondary}"/><stop offset="1" stop-color="${primary}" stop-opacity=".18"/></linearGradient><linearGradient id="card" x1="0" x2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="1200" height="800" rx="54" fill="url(#bg)"/><rect x="96" y="${y}" width="1008" height="640" rx="42" fill="#fff" opacity=".94"/><rect x="140" y="${y + 44}" width="254" height="552" rx="30" fill="${primary}"/><circle cx="190" cy="${y + 96}" r="18" fill="${accent}"/><rect x="176" y="${y + 150}" width="150" height="18" rx="9" fill="#fff" opacity=".86"/><rect x="176" y="${y + 188}" width="96" height="12" rx="6" fill="#fff" opacity=".5"/><rect x="444" y="${y + 70}" width="430" height="42" rx="21" fill="${primary}" opacity=".16"/><text x="444" y="${y + 186}" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="850" fill="#111827">${title}</text><text x="444" y="${y + 246}" font-family="Inter, Arial, sans-serif" font-size="26" fill="#5b6472">${value.slice(0, 74)}</text><rect x="444" y="${y + 330}" width="180" height="28" rx="14" fill="${accent}"/><rect x="444" y="${y + 390}" width="540" height="24" rx="12" fill="#e5e7eb"/><rect x="444" y="${y + 438}" width="460" height="24" rx="12" fill="#e5e7eb"/><rect x="444" y="${y + 486}" width="320" height="24" rx="12" fill="#e5e7eb"/><path d="M874 ${y + 536}c61-130 134-175 218-137-53 22-76 67-104 107-25 35-59 47-114 30Z" fill="url(#card)" opacity=".9"/></svg>`;
}

function makeInstagramPosterSvg(ad, brand, index) {
    const palette = brand.palette || {};
    const primary = palette.primary || '#0f766e';
    const secondary = palette.secondary || '#f8fafc';
    const accent = palette.accent || '#f97316';
    const headline = escapeHtml(ad.headline || brand.tagline || 'Launch smarter');
    const body = escapeHtml(ad.body || brand.positioning || '');
    const cta = escapeHtml(ad.cta || 'Try it now');
    const name = escapeHtml(brand.websiteName || 'Startup');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img" aria-label="${headline} Instagram post"><defs><linearGradient id="posterBg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${primary}"/><stop offset=".58" stop-color="#111827"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#posterBg)"/><circle cx="${170 + index * 28}" cy="170" r="118" fill="${secondary}" opacity=".12"/><circle cx="915" cy="910" r="180" fill="${accent}" opacity=".22"/><rect x="74" y="74" width="932" height="932" rx="58" fill="none" stroke="${secondary}" stroke-opacity=".24" stroke-width="2"/><text x="108" y="158" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="${secondary}">${name}</text><text x="108" y="420" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="900" fill="${secondary}">${headline.slice(0, 22)}</text><text x="108" y="510" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="900" fill="${secondary}">${headline.slice(22, 44)}</text><foreignObject x="108" y="590" width="760" height="180"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:38px;line-height:1.28;color:${secondary};opacity:.82">${body.slice(0, 120)}</div></foreignObject><rect x="108" y="848" width="310" height="92" rx="46" fill="${secondary}"/><text x="263" y="907" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="850" fill="${primary}">${cta.slice(0, 18)}</text><text x="108" y="980" font-family="Inter, Arial, sans-serif" font-size="24" fill="${secondary}" opacity=".72">1080 x 1080 ready-to-post creative</text></svg>`;
}

function withGeneratedProductImages(products, brand) {
    return products.map((product, index) => {
        const imageSvg = product.imageSvg || makeProductImageSvg(product, brand, index);
        return {
            ...product,
            imageSvg,
            imageDataUrl: product.imageDataUrl || svgToDataUrl(imageSvg),
        };
    });
}

function withGeneratedInstagramPosts(marketing, brand) {
    const ads = Array.isArray(marketing.ads) ? marketing.ads : [];
    const hashtags = brand.domainProfile?.hashtags || DOMAIN_PROFILES.default.hashtags;
    const instagramPosts = Array.isArray(marketing.instagramPosts) && marketing.instagramPosts.length
        ? marketing.instagramPosts
        : ads.map((ad, index) => ({
            channel: 'Instagram',
            headline: ad.headline,
            body: ad.body,
            cta: ad.cta,
            caption: `${ad.headline}\n\n${ad.body}\n\n${hashtags.join(' ')}`,
            size: '1080x1080',
            sourceAd: ad.channel,
            index,
        }));

    const postsWithImages = instagramPosts.map((post, index) => {
            const posterSvg = post.posterSvg || makeInstagramPosterSvg(post, brand, index);
            return {
                ...post,
                posterSvg,
                posterDataUrl: post.posterDataUrl || svgToDataUrl(posterSvg),
                size: post.size || '1080x1080',
            };
        });

    return {
        ...marketing,
        ads: ads.map((ad, index) => ({
            ...ad,
            posterDataUrl: ad.posterDataUrl || postsWithImages[index % postsWithImages.length]?.posterDataUrl || '',
        })),
        instagramPosts: postsWithImages,
    };
}

function buildWebsiteFiles(project, brand, website, products, marketing, seo, launch, scale) {
    const appName = brand.websiteName || project.name;
    const slug = slugify(appName);
    const palette = brand.palette || {};
    const domain = brand.domainProfile || DOMAIN_PROFILES.default;
    const sections = Array.isArray(website.sections) ? website.sections : [];
    const productList = Array.isArray(products) ? products : [];
    const ads = Array.isArray(marketing?.ads) ? marketing.ads : [];
    const metrics = Array.isArray(scale?.metrics) ? scale.metrics : [];

    const sectionHtml = sections.map((section, index) => `
            <article class="feature-card">
                <span class="feature-index">0${index + 1}</span>
                <h3>${escapeHtml(section.title)}</h3>
                <p>${escapeHtml(section.body)}</p>
            </article>`).join('');

    const productHtml = productList.map((product) => `
            <article class="pricing-card">
                ${product.imageDataUrl ? `<img class="product-image" src="${product.imageDataUrl}" alt="${escapeHtml(product.name)} product preview">` : ''}
                <div>
                    <p class="eyebrow">${escapeHtml(product.name)}</p>
                    <h3>${escapeHtml(product.price)}</h3>
                    <p>${escapeHtml(product.value)}</p>
                </div>
                <button type="button">Choose plan</button>
            </article>`).join('');

    const adHtml = ads.map((ad) => `
            <article class="campaign-card">
                ${ad.posterDataUrl ? `<img class="poster-thumb" src="${ad.posterDataUrl}" alt="${escapeHtml(ad.headline)} Instagram poster">` : ''}
                <span>${escapeHtml(ad.channel)}</span>
                <h3>${escapeHtml(ad.headline)}</h3>
                <p>${escapeHtml(ad.body)}</p>
                <button type="button">${escapeHtml(ad.cta || website.cta)}</button>
            </article>`).join('');

    const metricHtml = metrics.map((metric) => `<li>${escapeHtml(metric)}</li>`).join('');
    const primary = palette.primary || '#0f766e';
    const secondary = palette.secondary || '#f8fafc';
    const accent = palette.accent || '#f97316';
    const ink = palette.ink || '#111827';

    const indexHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(seo?.title || `${appName} | ${brand.tagline}`)}</title>
    <meta name="description" content="${escapeHtml(seo?.description || website.subheadline)}">
    <meta name="theme-color" content="${primary}">
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <header class="site-header">
        <a class="brand" href="#top" aria-label="${escapeHtml(appName)} home">
            <span class="brand-mark">${escapeHtml(appName.slice(0, 2).toUpperCase())}</span>
            <span>${escapeHtml(appName)}</span>
        </a>
        <nav>
            <a href="#platform">${escapeHtml(domain.nav[0])}</a>
            <a href="#pricing">${escapeHtml(domain.nav[1])}</a>
            <a href="#campaigns">${escapeHtml(domain.nav[2])}</a>
        </nav>
        <a class="header-cta" href="#demo">Book demo</a>
    </header>

    <main id="top">
        <section class="hero">
            <div class="hero-copy">
                <p class="eyebrow">${escapeHtml(domain.eyebrow)}</p>
                <h1>${escapeHtml(website.headline)}</h1>
                <p>${escapeHtml(website.subheadline)}</p>
                <div class="hero-actions">
                    <a class="primary-btn" href="#demo">${escapeHtml(website.cta)}</a>
                    <a class="secondary-btn" href="#platform">Explore platform</a>
                </div>
            </div>
            <aside class="product-panel" aria-label="Product dashboard preview">
                <div class="panel-top">
                    <span></span><span></span><span></span>
                </div>
                <div class="score-card">
                    <p>${escapeHtml(domain.heroPanelTitle)}</p>
                    <strong id="readiness-score">${domain.key === 'clothing' ? 'DROP' : '87%'}</strong>
                </div>
                <div class="chart-bars">
                    <span style="height: 44%"></span>
                    <span style="height: 62%"></span>
                    <span style="height: 78%"></span>
                    <span style="height: 56%"></span>
                    <span style="height: 91%"></span>
                </div>
                <ul class="panel-list">
                    ${domain.heroPanelItems.map((item) => `<li><span></span> ${escapeHtml(item)}</li>`).join('')}
                </ul>
            </aside>
        </section>

        <section id="platform" class="section-grid">
            <div>
                <p class="eyebrow">Operating system</p>
                <h2>${escapeHtml(domain.platformHeading)}</h2>
            </div>
            <div class="feature-grid">
                ${sectionHtml}
            </div>
        </section>

        <section id="pricing" class="pricing">
            <p class="eyebrow">Products</p>
            <h2>${escapeHtml(domain.productHeading)}</h2>
            <div class="pricing-grid">
                ${productHtml}
            </div>
        </section>

        <section id="campaigns" class="campaigns">
            <p class="eyebrow">Marketing engine</p>
            <h2>${escapeHtml(domain.campaignHeading)}</h2>
            <div class="campaign-grid">
                ${adHtml}
            </div>
        </section>

        <section class="metrics">
            <div>
                <p class="eyebrow">Scale plan</p>
                <h2>Track what compounds.</h2>
            </div>
            <ul>${metricHtml}</ul>
        </section>

        <section id="demo" class="demo">
            <p class="eyebrow">Launch next</p>
            <h2>${escapeHtml(launch?.firstWeek || 'Validate the offer, capture demand, and turn early signals into the next product decision.')}</h2>
            <form>
                <input type="email" placeholder="work@email.com" aria-label="Email">
                <button type="submit">${escapeHtml(website.cta)}</button>
            </form>
        </section>
    </main>

    <script src="./app.js" defer></script>
</body>
</html>`;

    const css = `:root {
    --primary: ${primary};
    --secondary: ${secondary};
    --accent: ${accent};
    --ink: ${ink};
    --muted: #5b6472;
    --line: rgba(17, 24, 39, 0.1);
    --surface: #ffffff;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--ink);
    background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 18%, transparent), transparent 32rem),
        linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

a { color: inherit; text-decoration: none; }
button, input { font: inherit; }

.site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem clamp(1rem, 4vw, 4rem);
    background: rgba(248, 250, 252, 0.82);
    border-bottom: 1px solid var(--line);
    backdrop-filter: blur(18px);
}

.brand, nav, .hero-actions, .panel-list li {
    display: flex;
    align-items: center;
}

.brand { gap: 0.75rem; font-weight: 800; }
.brand-mark {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.65rem;
    color: white;
    background: linear-gradient(135deg, var(--primary), var(--accent));
}

nav { gap: 1.25rem; color: var(--muted); font-size: 0.92rem; }
.header-cta, .primary-btn, .secondary-btn, .pricing-card button, .campaign-card button, .demo button {
    border-radius: 0.6rem;
    border: 0;
    cursor: pointer;
    font-weight: 700;
}

.header-cta, .primary-btn, .pricing-card button, .demo button {
    color: white;
    background: var(--ink);
    box-shadow: 0 18px 40px rgba(17, 24, 39, 0.18);
}

.header-cta { padding: 0.72rem 1rem; }
.hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.95fr);
    gap: clamp(2rem, 6vw, 5rem);
    align-items: center;
    padding: clamp(4rem, 8vw, 7rem) clamp(1rem, 4vw, 4rem) 3rem;
}

.eyebrow {
    margin: 0 0 0.75rem;
    color: var(--primary);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
}

h1, h2, h3, p { margin-top: 0; }
h1 { max-width: 11ch; font-size: clamp(3rem, 7vw, 6.8rem); line-height: 0.92; margin-bottom: 1.35rem; }
h2 { font-size: clamp(2rem, 4vw, 4rem); line-height: 1; margin-bottom: 1rem; }
h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
p { color: var(--muted); line-height: 1.65; }

.hero-copy > p:not(.eyebrow) { max-width: 42rem; font-size: 1.18rem; }
.hero-actions { gap: 0.85rem; flex-wrap: wrap; margin-top: 2rem; }
.primary-btn, .secondary-btn { padding: 0.95rem 1.15rem; }
.secondary-btn { border: 1px solid var(--line); background: white; }

.product-panel, .feature-card, .pricing-card, .campaign-card, .metrics, .demo {
    border: 1px solid var(--line);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 24px 80px rgba(17, 24, 39, 0.08);
}

.product-panel { padding: 1rem; min-height: 30rem; }
.panel-top { display: flex; gap: 0.4rem; padding-bottom: 1rem; }
.panel-top span { width: 0.7rem; height: 0.7rem; border-radius: 999px; background: #d1d5db; }
.score-card { padding: 1.25rem; border-radius: 0.85rem; color: white; background: linear-gradient(135deg, var(--primary), var(--ink)); }
.score-card strong { display: block; font-size: 3.4rem; line-height: 1; }
.score-card p { color: rgba(255, 255, 255, 0.78); }
.chart-bars { display: flex; align-items: end; gap: 0.75rem; height: 8rem; margin: 2rem 0; }
.chart-bars span { flex: 1; border-radius: 999px 999px 0.45rem 0.45rem; background: linear-gradient(180deg, var(--accent), var(--primary)); }
.panel-list { display: grid; gap: 0.8rem; padding: 0; margin: 0; list-style: none; }
.panel-list li { gap: 0.6rem; color: var(--muted); }
.panel-list span { width: 0.7rem; height: 0.7rem; border-radius: 999px; background: var(--accent); }

.section-grid, .pricing, .campaigns, .metrics, .demo {
    margin: 0 clamp(1rem, 4vw, 4rem);
}

.section-grid {
    display: grid;
    grid-template-columns: 0.75fr 1.25fr;
    gap: 2rem;
    padding: 4rem 0;
}

.feature-grid, .pricing-grid, .campaign-grid {
    display: grid;
    gap: 1rem;
}

.feature-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pricing-grid { grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
.campaign-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.feature-card, .pricing-card, .campaign-card { padding: 1.25rem; }
.feature-index { color: var(--accent); font-weight: 800; }
.pricing, .campaigns { padding: 4rem 0; }
.pricing-card { display: flex; min-height: 21rem; flex-direction: column; justify-content: space-between; }
.product-image, .poster-thumb {
    display: block;
    width: 100%;
    border: 1px solid var(--line);
    object-fit: cover;
}
.product-image {
    aspect-ratio: 3 / 2;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
}
.poster-thumb {
    aspect-ratio: 1;
    border-radius: 0.85rem;
    margin-bottom: 1rem;
}
.pricing-card h3 { font-size: 2rem; }
.pricing-card button, .campaign-card button, .demo button { padding: 0.8rem 1rem; }
.campaign-card span { color: var(--primary); font-size: 0.8rem; font-weight: 800; }

.metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: clamp(2rem, 5vw, 4rem);
}
.metrics ul { display: grid; gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
.metrics li { padding: 1rem; border-radius: 0.75rem; background: #f8fafc; color: var(--muted); }

.demo {
    margin-top: 4rem;
    margin-bottom: 4rem;
    padding: clamp(2rem, 5vw, 4rem);
}
.demo form { display: flex; gap: 0.75rem; max-width: 36rem; }
.demo input { flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.9rem 1rem; }

@media (max-width: 900px) {
    nav { display: none; }
    .hero, .section-grid, .metrics { grid-template-columns: 1fr; }
    .feature-grid, .pricing-grid, .campaign-grid { grid-template-columns: 1fr; }
    h1 { max-width: 100%; }
}

@media (max-width: 560px) {
    .site-header { align-items: flex-start; }
    .header-cta { display: none; }
    .hero { padding-top: 3rem; }
    .product-panel { min-height: auto; }
    .demo form { flex-direction: column; }
}`;

    const js = `const form = document.querySelector('.demo form');
const score = document.querySelector('#readiness-score');

let value = 87;
if (score && /%$/.test(score.textContent || '')) {
    setInterval(() => {
        value = value >= 96 ? 87 : value + 1;
        score.textContent = value + '%';
    }, 1400);
}

if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input');
        const email = input && input.value ? input.value : 'your team';
        alert('Thanks, ' + email + '. The launch team will follow up shortly.');
        form.reset();
    });
}`;

    const types = `export interface Plan {
    name: string;
    price: string;
    value: string;
}

export interface CampaignAd {
    channel: string;
    headline: string;
    body: string;
    cta: string;
}

export interface StartupWebsite {
    name: string;
    headline: string;
    subheadline: string;
    plans: Plan[];
    ads: CampaignAd[];
}`;

    const mainTs = `import type { StartupWebsite } from './types';

export const website: StartupWebsite = ${JSON.stringify({
        name: appName,
        headline: website.headline,
        subheadline: website.subheadline,
        plans: productList,
        ads,
    }, null, 4)};

export function calculateReadiness(completedSteps: number, totalSteps: number): number {
    if (totalSteps <= 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
}`;

    const schema = `CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100) DEFAULT 'website',
    status VARCHAR(40) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    price VARCHAR(80) NOT NULL,
    value TEXT NOT NULL
);

CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);`;

    const seed = `INSERT INTO organizations (name, website)
VALUES ('${appName.replace(/'/g, "''")}', 'https://${slug}.com');

INSERT INTO plans (organization_id, name, price, value)
VALUES
${productList.map((product, index) => `    (1, '${String(product.name).replace(/'/g, "''")}', '${String(product.price).replace(/'/g, "''")}', '${String(product.value).replace(/'/g, "''")}')${index === productList.length - 1 ? ';' : ','}`).join('\n')}`;

    const apiRoutes = `import express from 'express';

export const router = express.Router();

router.post('/leads', async (req, res) => {
    const { email, source = 'website' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Connect this route to your database adapter in production.
    res.status(201).json({
        email,
        source,
        status: 'new',
        message: 'Lead captured',
    });
});

router.get('/plans', (_req, res) => {
    res.json(${JSON.stringify(productList, null, 4)});
});`;

    const readme = `# ${appName}

Generated company-level launch site for ${project.category}.

## Files

- \`index.html\`: production landing page shell
- \`styles.css\`: responsive company-grade UI styling
- \`app.js\`: browser interactions and lead form behavior
- \`src/main.ts\`: typed frontend data module
- \`src/types.ts\`: TypeScript interfaces
- \`db/schema.sql\`: database schema for organizations, leads, and plans
- \`db/seed.sql\`: starter seed data
- \`api/routes.ts\`: starter Express API routes

## Run

Open \`index.html\` directly, or serve the folder with any static server.
Use the SQL files to create the backend database tables before wiring the API to your DB adapter.`;

    const previewHtml = indexHtml
        .replace('<link rel="stylesheet" href="./styles.css">', `<style>${css}</style>`)
        .replace('<script src="./app.js" defer></script>', `<script>${js}</script>`);
    const productAssets = Object.fromEntries(productList.map((product, index) => [
        `assets/products/product-${index + 1}.svg`,
        product.imageSvg || makeProductImageSvg(product, brand, index),
    ]));
    const posterAssets = Object.fromEntries((marketing.instagramPosts || []).map((post, index) => [
        `assets/instagram/post-${index + 1}.svg`,
        post.posterSvg || makeInstagramPosterSvg(post, brand, index),
    ]));

    return {
        'index.html': indexHtml,
        'preview.html': previewHtml,
        'styles.css': css,
        'app.js': js,
        'src/main.ts': mainTs,
        'src/types.ts': types,
        'api/routes.ts': apiRoutes,
        'db/schema.sql': schema,
        'db/seed.sql': seed,
        'package.json': JSON.stringify({
            name: slug,
            version: '1.0.0',
            private: true,
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'tsc --noEmit && vite build',
                preview: 'vite preview',
            },
            dependencies: {
                '@vitejs/plugin-react': '^4.3.1',
                express: '^4.21.0',
                typescript: '^5.5.4',
                vite: '^5.4.3',
            },
        }, null, 4),
        'tsconfig.json': JSON.stringify({
            compilerOptions: {
                target: 'ES2022',
                module: 'ESNext',
                moduleResolution: 'Bundler',
                strict: true,
                skipLibCheck: true,
            },
            include: ['src', 'api'],
        }, null, 4),
        'vite.config.ts': `import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
    },
});`,
        '.env.example': `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${slug.replace(/-/g, '_')}
PORT=5000`,
        'README.md': readme,
        ...productAssets,
        ...posterAssets,
    };
}

function normalizeKit(raw, project, source, variant = makeDesignVariant()) {
    const domainProfile = detectDomain(project);
    const palette = raw?.brand?.palette || {};
    const brand = {
        websiteName: raw?.brand?.websiteName || project.name,
        tagline: raw?.brand?.tagline || project.tagline || `${project.name} turns ideas into launch-ready growth.`,
        positioning: raw?.brand?.positioning || `A focused ${domainProfile.label.toLowerCase()} brand for customers who want quality, clarity, and a memorable experience.`,
        palette: {
            primary: palette.primary || variant.palette.primary,
            secondary: palette.secondary || variant.palette.secondary,
            accent: palette.accent || variant.palette.accent,
            ink: palette.ink || variant.palette.ink,
        },
        voice: raw?.brand?.voice || ['clear', 'confident', 'useful'],
        logo: raw?.brand?.logo || `${project.name} mark with bold initials, ${variant.name} colors, and a clean growth signal.`,
        designVariant: variant.name,
        designSeed: variant.seed,
        domain: domainProfile.key,
        domainLabel: domainProfile.label,
        domainProfile,
    };
    const logoSvg = raw?.brand?.logoSvg || makeLogoSvg(brand.websiteName, brand.palette, variant, domainProfile);
    brand.logoSvg = logoSvg;
    brand.logoDataUrl = raw?.brand?.logoDataUrl || svgToDataUrl(logoSvg);

    const website = {
        urlPath: raw?.website?.urlPath || `/sites/${slugify(brand.websiteName)}`,
        headline: raw?.website?.headline || brand.tagline,
        subheadline: raw?.website?.subheadline || project.description || brand.positioning,
        cta: raw?.website?.cta || 'Start free',
        sections: Array.isArray(raw?.website?.sections) && raw.website.sections.length
            ? raw.website.sections
            : [
                { title: domainProfile.key === 'clothing' ? 'The collection' : 'What it does', body: project.description || `A practical ${domainProfile.label.toLowerCase()} brand built around real customer desire.` },
                { title: domainProfile.key === 'clothing' ? 'Fit and identity' : 'Why it wins', body: domainProfile.key === 'clothing' ? 'It turns a clear visual code into wearable products people can recognize and share.' : 'It combines a crisp promise, fast onboarding, and repeatable growth loops.' },
                { title: domainProfile.key === 'clothing' ? 'Drop strategy' : 'How it launches', body: domainProfile.key === 'clothing' ? 'Launch with a tight capsule collection, product visuals, and Instagram-ready drop creative.' : 'Start with a landing page, proof-driven ads, and a tight early-access offer.' },
            ],
        html: raw?.website?.html || '',
    };
    if (!website.html) {
        const sectionHtml = website.sections
            .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`)
            .join('');
        website.html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(brand.websiteName)}</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>${escapeHtml(website.headline)}</h1><p>${escapeHtml(website.subheadline)}</p><button>${escapeHtml(website.cta)}</button>${sectionHtml}</main></body></html>`;
    }

    const baseProducts = Array.isArray(raw?.products) && raw.products.length
        ? raw.products
        : [];
    const fallbackProducts = domainProducts(brand);
    const products = withGeneratedProductImages([...baseProducts, ...fallbackProducts].slice(0, 5), brand);
    const marketing = withGeneratedInstagramPosts(raw?.marketing || {
        personas: ['Time-strapped founder', 'Growth marketer', 'Agency operator'],
        ads: [
            { channel: 'Instagram', headline: domainProfile.key === 'clothing' ? `${brand.websiteName} drop is live` : `${brand.websiteName}: launch faster`, body: domainProfile.key === 'clothing' ? 'Shop the first capsule: hoodies, tees, caps, totes, and a jacket built around one recognizable visual code.' : 'Turn your idea into a polished offer, site, and campaign plan in one workflow.', cta: website.cta },
            { channel: 'Instagram', headline: domainProfile.key === 'clothing' ? 'Wear the mark' : 'Your next startup kit', body: domainProfile.key === 'clothing' ? 'A clean logo system, product story, and ready-to-post creative for your next fashion launch.' : 'Brand, landing page, product tiers, and ad angles built from one brief.', cta: 'See the drop' },
            { channel: 'Meta', headline: domainProfile.key === 'clothing' ? 'Limited capsule, clear identity' : 'From idea to launch page', body: domainProfile.key === 'clothing' ? 'Turn a clothing concept into a product lineup with real apparel visuals and campaign posters.' : 'Skip the blank page and start with a complete go-to-market foundation.', cta: 'Shop now' },
            { channel: 'Instagram', headline: `${brand.websiteName} visual system`, body: domainProfile.key === 'clothing' ? 'Logo, collection, product images, and drop posters ready for launch.' : 'A polished product story, launch offer, and visual creative ready to publish.', cta: 'Launch now' },
        ],
    }, brand);
    const seo = raw?.seo || {
        title: `${brand.websiteName} | ${brand.tagline}`,
        description: website.subheadline,
        keywords: [project.category, brand.websiteName, 'startup launch', 'marketing plan'],
    };
    const launch = raw?.launch || {
        checklist: ['Publish landing page', 'Create waitlist', 'Run 3 ad variants', 'Book 10 discovery calls'],
        firstWeek: 'Validate the offer with interviews, paid traffic, and founder-led outreach.',
    };
    const scale = raw?.scale || {
        metrics: ['Visitor to signup rate', 'Activation rate', 'CAC payback', 'Weekly active teams'],
        experiments: ['Niche-specific landing pages', 'Product-led referral loop', 'Concierge onboarding package'],
    };
    const generatedFiles = buildWebsiteFiles(project, brand, website, products, marketing, seo, launch, scale);
    website.files = {
        ...generatedFiles,
        ...(raw?.website?.files && typeof raw.website.files === 'object' ? raw.website.files : {}),
    };
    website.html = website.files['index.html'] || website.html;
    website.previewHtml = website.files['preview.html'] || website.html;

    return {
        source,
        brief: raw?.brief || {
            problem: `Customers need a faster way to get value from ${project.category} tools.`,
            audience: 'Founders, operators, and small teams',
            promise: brand.tagline,
        },
        research: raw?.research || {
            trends: ['AI-assisted workflows', 'self-serve onboarding', 'proof-led marketing'],
            competitors: ['Established tools with slower setup', 'manual agencies', 'generic templates'],
            opportunity: 'Win by shipping a narrower product with sharper messaging and faster time-to-value.',
        },
        analysis: raw?.analysis || {
            moat: 'Workflow depth, strong onboarding, and repeatable campaign assets.',
            risks: ['Unclear niche', 'weak proof', 'too many features before validation'],
            nextValidation: 'Interview 10 target users and sell a concierge pilot.',
        },
        brand,
        website,
        products,
        marketing,
        seo,
        launch,
        scale,
        steps: raw?.steps || {
            Understand: 'Defined audience, pain, promise, and offer scope.',
            Research: 'Mapped alternatives, trends, and market opening.',
            Analysis: 'Clarified risks, moat, and validation plan.',
            Identity: 'Generated brand name, voice, positioning, and colors.',
            Logo: 'Created a usable SVG logo and encoded preview URL.',
            Website: 'Generated landing page copy, sections, CTA, and HTML.',
            Products: 'Drafted product tiers and pricing logic.',
            Marketing: 'Created audience personas and ad campaigns.',
            SEO: 'Generated title, meta description, and keywords.',
            Launch: 'Built first-week launch checklist.',
            Scale: 'Defined growth metrics and experiments.',
        },
    };
}

function fallbackStartupKit(project, source = 'local', variant = makeDesignVariant()) {
    return normalizeKit({
        brand: {
            websiteName: project.name,
            tagline: project.tagline || `${project.name} builds your launch plan from one clear brief.`,
            palette: variant.palette,
            positioning: `A ${variant.mood} for founders who want finished assets, not scattered notes.`,
        },
    }, project, source, variant);
}

function stripCodeFence(value) {
    const text = String(value || '').trim();
    if (!text.startsWith('```')) return text;
    return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

async function generateStartupKit(project) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
    const variant = makeDesignVariant();
    if (!apiKey) {
        return fallbackStartupKit(project, 'local', variant);
    }

    const schemaInstruction = {
        brief: { problem: 'string', audience: 'string', promise: 'string' },
        research: { trends: ['string'], competitors: ['string'], opportunity: 'string' },
        analysis: { moat: 'string', risks: ['string'], nextValidation: 'string' },
        brand: {
            websiteName: 'string',
            tagline: 'string',
            positioning: 'string',
            palette: { primary: '#hex', secondary: '#hex', accent: '#hex', ink: '#hex' },
            voice: ['string'],
            logo: 'domain-specific logo concept, e.g. clothing logo uses hanger, garment tag, stitch, apparel monogram, or fashion mark',
            logoSvg: 'valid compact domain-specific svg string',
        },
        website: {
            urlPath: '/sites/name',
            headline: 'string',
            subheadline: 'string',
            cta: 'string',
            sections: [{ title: 'string', body: 'string' }],
            html: 'complete company-grade landing page html',
            files: {
                'index.html': 'full page html',
                'styles.css': 'responsive production css',
                'app.js': 'browser interactions',
                'src/main.ts': 'typed app data/module',
                'src/types.ts': 'TypeScript interfaces',
                'api/routes.ts': 'Express API route starter',
                'db/schema.sql': 'SQL schema',
                'db/seed.sql': 'SQL seed data',
                'README.md': 'project instructions',
            },
        },
        products: [
            { name: 'string', price: 'string', value: 'string', itemType: 'domain-specific product type', productImagePrompt: 'string' },
            { name: 'string', price: 'string', value: 'string', itemType: 'domain-specific product type', productImagePrompt: 'string' },
            { name: 'string', price: 'string', value: 'string', itemType: 'domain-specific product type', productImagePrompt: 'string' },
            { name: 'string', price: 'string', value: 'string', itemType: 'domain-specific product type', productImagePrompt: 'string' },
            { name: 'string', price: 'string', value: 'string', itemType: 'domain-specific product type', productImagePrompt: 'string' },
        ],
        marketing: {
            personas: ['string'],
            ads: [{ channel: 'string', headline: 'string', body: 'string', cta: 'string' }],
            instagramPosts: [{ headline: 'string', body: 'string', cta: 'string', caption: 'string', size: '1080x1080' }],
        },
        seo: { title: 'string', description: 'string', keywords: ['string'] },
        launch: { checklist: ['string'], firstWeek: 'string' },
        scale: { metrics: ['string'], experiments: ['string'] },
        steps: { Understand: 'string', Research: 'string', Analysis: 'string', Identity: 'string', Logo: 'string', Website: 'string', Products: 'string', Marketing: 'string', SEO: 'string', Launch: 'string', Scale: 'string' },
    };

    try {
        const domainProfile = detectDomain(project);
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
                'X-Title': process.env.OPENROUTER_APP_NAME || 'VEX Dream Builder',
            },
            body: JSON.stringify({
                model,
                temperature: 0.7,
                max_tokens: 5000,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a senior startup operator, brand designer, conversion copywriter, full-stack engineer, and product marketer. Create company-level UI and production-minded project files. Return only valid JSON. Do not include markdown.',
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            task: 'Create a complete launch-ready startup kit and multi-file website/app bundle from this brief. Include exactly 5 pre-products based on the description, product image concepts, Instagram-ready square post concepts, HTML, CSS, JS, TypeScript, API starter code, database schema, seed data, and README.',
                            required_schema: schemaInstruction,
                            domain_context: {
                                detected_domain: domainProfile.key,
                                label: domainProfile.label,
                                logo_motif: domainProfile.logoMotif,
                                product_rule: domainProfile.key === 'clothing'
                                    ? 'For clothing/apparel, products must be real apparel items like hoodie, tee, cap, tote, jacket, sneaker, etc. Product image prompts and SVG/logo concepts must look fashion/apparel related, not software dashboards.'
                                    : 'Products, images, logo, and website copy must visually match the described business category.',
                                fallback_product_examples: domainProfile.products,
                            },
                            design_direction: {
                                seed: variant.seed,
                                style: variant.name,
                                mood: variant.mood,
                                palette: variant.palette,
                                instruction: 'Even if the startup name is the same as a previous generation, create a meaningfully different logo, layout, color treatment, product names, and marketing creative.',
                            },
                            startup: {
                                name: project.name,
                                tagline: project.tagline,
                                category: project.category,
                                description: project.description,
                            },
                        }),
                    },
                ],
            }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error?.message || payload?.message || `OpenRouter request failed (${response.status})`);
        }

        const content = payload?.choices?.[0]?.message?.content;
        const parsed = JSON.parse(stripCodeFence(content));
        return normalizeKit(parsed, project, `openrouter:${model}`, variant);
    } catch (err) {
        console.error('OpenRouter generation failed, using local startup kit:', err.message);
        return fallbackStartupKit(project, `fallback:${model}`, variant);
    }
}

module.exports = {
    generateStartupKit,
    fallbackStartupKit,
};
