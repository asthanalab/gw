// Run with Node.js and sharp available (NODE_PATH may point to its installation).
// Originals are never overwritten. Pages use generated display copies instead.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const generated = 'assets/img/web';
const manifestPath = path.join(root, generated, 'manifest.json');
const stylesheetVersion = '20261016-responsive-images';
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const originals = new Map(htmlFiles.map((name) => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
const oldCss = fs.readFileSync(path.join(root, 'pages.css'), 'utf8');
const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { version: 1, assets: {} };
const pending = new Map();
fs.mkdirSync(path.join(root, generated), { recursive: true });

const attribute = (tag, name) => {
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 's'));
    return match ? match[2] : '';
};
const setAttribute = (tag, name, value) => {
    const pattern = new RegExp(`(\\s)${name}\\s*=\\s*(["'])(.*?)\\2`, 's');
    return pattern.test(tag)
        ? tag.replace(pattern, (_, space) => `${space}${name}="${value}"`)
        : tag.replace(/\s*\/?>$/, ` ${name}="${value}">`);
};
const localSource = (value) => value.replace(/^https:\/\/theasthanagroup\.com\//, '').split('?')[0];
const originalSource = (value) => {
    const source = localSource(value);
    return manifest.assets[source]?.source || source;
};

function formatImage(tag, indent) {
    const attributes = [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)];
    const lines = [];
    let line = '<img';
    for (const match of attributes) {
        let value = match[3];
        if (match[1] === 'srcset') value = value.split(',').map((item) => item.trim()).join(`,\n${indent}        `);
        const item = `${match[1]}=${match[2]}${value}${match[2]}`;
        if (line.length + item.length + indent.length > 140) {
            if (line.trim()) lines.push(line);
            line = `${indent}    ${item}`;
        } else line += ` ${item}`;
        if (item.includes('\n')) {
            lines.push(line);
            line = `${indent}   `;
        }
    }
    if (line.trim()) lines.push(line);
    return `${lines.join('\n')}>`;
}

async function render(source, options) {
    const key = JSON.stringify([source, options]);
    if (pending.has(key)) return pending.get(key);
    const work = (async () => {
        const input = fs.readFileSync(path.join(root, source));
        const hash = crypto.createHash('sha256').update(input).update(key).digest('hex').slice(0, 10);
        const stem = source.replace(/^assets\/img\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
        const output = `${generated}/${stem}-${options.width}-${hash}.${options.format || 'webp'}`;
        if (!fs.existsSync(path.join(root, output))) {
            let image = sharp(input, { density: 144 }).rotate();
            image = options.square
                ? image.resize(options.width, options.width, { fit: 'contain', background: '#ffffff' })
                : image.resize({ width: options.width, withoutEnlargement: true });
            if (options.format === 'png') image = image.png({ palette: true, compressionLevel: 9 });
            else if (options.format === 'jpg') image = image.flatten({ background: '#ffffff' }).jpeg({ quality: options.quality, mozjpeg: true });
            else image = image.webp({ quality: options.quality, alphaQuality: 100, effort: 6 });
            // sharp strips EXIF/GPS metadata unless explicitly asked to retain it.
            await image.toFile(path.join(root, output));
        }
        const info = await sharp(path.join(root, output)).metadata();
        const record = { source, width: info.width, height: info.height, bytes: fs.statSync(path.join(root, output)).size, options };
        manifest.assets[output] = record;
        return { ...record, output };
    })();
    pending.set(key, work);
    return work;
}

function specification(file, tag, source) {
    if (source === 'assets/img/optimized/group-photo-2026.jpg') return {
        widths: [480, 840, 1280], quality: 78,
        defaultWidth: file === 'culture.html' ? 1280 : 840,
        sizes: file === 'index.html'
            ? '(max-width: 460px) calc(100vw - 40px), 420px'
            : file === 'culture.html'
                ? '(max-width: 1160px) calc(100vw - 40px), 1120px'
                : '(max-width: 991px) calc(100vw - 40px), 460px',
        eager: true
    };
    if (attribute(tag, 'class').split(/\s+/).includes('person-photo')) return {
        widths: [224, 336], quality: 82,
        sizes: '(max-width: 767px) 96px, 112px'
    };
    if (source.startsWith('assets/img/funding/')) return { widths: [source.endsWith('.svg') ? 112 : 216], quality: 90 };
    if (file === 'culture.html') return {
        widths: [360, 720, 960], defaultWidth: 720, quality: 76,
        sizes: '(max-width: 457px) calc(100vw - 40px), (max-width: 675px) 45vw, (max-width: 893px) 30vw, (max-width: 1111px) 23vw, 210px'
    };
    if (file === 'publications.html') return { widths: [560], quality: 90 };
    if (file === 'research.html') return source.includes('pillar-cartoon')
        ? { widths: [280], quality: 88, eager: true }
        : { widths: [720], quality: 90 };
    if (file === 'outputs.html') return {
        widths: [480, 960], quality: 86, eager: true,
        sizes: '(max-width: 767px) calc(100vw - 40px), 540px'
    };
    if (file === 'news.html') return {
        widths: [480, 720], defaultWidth: 480, quality: 80, sizes: '240px'
    };
    return { widths: [960], quality: 86 };
}

async function optimizeTag(file, original, index) {
    const source = originalSource(attribute(original, 'src'));
    if (!source.startsWith('assets/img/') || source.startsWith(`${generated}/`)) return original;
    const spec = specification(file, original, source);
    if (source.endsWith('.svg') && !source.startsWith('assets/img/funding/')) {
        return setAttribute(setAttribute(original, 'loading', attribute(original, 'loading') || 'lazy'), 'decoding', 'async');
    }
    const variants = [];
    for (const width of spec.widths) {
        const result = await render(source, { width, quality: spec.quality });
        if (!variants.some((variant) => variant.width === result.width)) variants.push(result);
    }
    const main = variants.find((variant) => variant.options.width === spec.defaultWidth) || variants.at(-1);
    let tag = setAttribute(original, 'src', main.output);
    tag = setAttribute(setAttribute(tag, 'width', main.width), 'height', main.height);
    if (variants.length > 1) {
        tag = setAttribute(tag, 'srcset', variants.map((variant) => `${variant.output} ${variant.width}w`).join(', '));
        tag = setAttribute(tag, 'sizes', spec.sizes);
    }
    const eager = spec.eager || (file === 'people.html' && index < 3);
    tag = setAttribute(tag, 'loading', eager ? 'eager' : 'lazy');
    tag = setAttribute(tag, 'decoding', 'async');
    if (source === 'assets/img/optimized/group-photo-2026.jpg') tag = setAttribute(tag, 'fetchpriority', 'high');
    return tag;
}

function pageImages(html, css) {
    const sources = new Set();
    for (const tag of html.match(/<img\b[^>]*>/gs) || []) sources.add(localSource(attribute(tag, 'src')));
    for (const tag of html.match(/<link\b[^>]*>/gs) || []) {
        if (attribute(tag, 'rel') === 'icon') sources.add(localSource(attribute(tag, 'href')));
    }
    if (html.includes('pages.css')) {
        for (const match of css.matchAll(/url\(["']?(assets\/img\/[^"')]+)["']?\)/g)) sources.add(match[1]);
    }
    return [...sources].filter((source) => source.startsWith('assets/img/'));
}
const bytes = (sources) => sources.reduce((total, source) => total + fs.statSync(path.join(root, source)).size, 0);

async function main() {
    const favicon = await render('assets/img/logoUND.jpeg', { width: 64, format: 'png', square: true });
    const touch = await render('assets/img/logoUND.jpeg', { width: 180, format: 'png', square: true });
    const pwaIcons = [];
    for (const width of [192, 512]) pwaIcons.push(await render('assets/img/logoUND.jpeg', { width, format: 'png', square: true }));

    for (const [file, initial] of originals) {
        let html = initial;
        const tags = [...html.matchAll(/<img\b[^>]*>/gs)];
        // Replace from the end so offsets remain exact and unrelated markup stays intact.
        for (let index = tags.length - 1; index >= 0; index--) {
            const match = tags[index];
            const indent = html.slice(html.lastIndexOf('\n', match.index) + 1, match.index);
            const replacement = formatImage(await optimizeTag(file, match[0], index), indent);
            html = html.slice(0, match.index) + replacement + html.slice(match.index + match[0].length);
        }
        for (const match of [...html.matchAll(/<meta\b[^>]*>/gs)].reverse()) {
            if (attribute(match[0], 'property') !== 'og:image') continue;
            const source = originalSource(attribute(match[0], 'content'));
            if (!source.startsWith('assets/img/') || source.startsWith(`${generated}/`)) continue;
            const social = await render(source, { width: 1200, quality: 80, format: 'jpg' });
            const replacement = setAttribute(match[0], 'content', `https://theasthanagroup.com/${social.output}`);
            html = html.slice(0, match.index) + replacement + html.slice(match.index + match[0].length);
        }
        html = html.replace(/<link\b[^>]*>/gs, (tag) => {
            if (attribute(tag, 'rel') === 'icon') return setAttribute(setAttribute(tag, 'href', favicon.output), 'type', 'image/png');
            if (attribute(tag, 'rel') === 'apple-touch-icon') return setAttribute(tag, 'href', touch.output);
            return tag;
        });
        html = html.replace(/pages\.css\?v=[^"']+/g, `pages.css?v=${stylesheetVersion}`);
        html = html.replace(/assets\/js\/app\.js\?v=\d+/g, 'assets/js/app.js?v=101');
        if (file === 'people.html') html = html.replace('<script src="assets/js/app.js?v=101">', '<script defer src="assets/js/app.js?v=101">');
        if (html !== initial) fs.writeFileSync(path.join(root, file), html);
        console.log(`Optimized ${file} (${tags.length} image tags)`);
    }
    const background = await render('assets/img/optimized/group-photo-2026.jpg', { width: 480, quality: 52 });
    const css = oldCss.replace(/url\("assets\/img\/(?:optimized\/group-photo-2026\.jpg|web\/optimized-group-photo-2026-480-[a-f0-9]+\.webp)"\)/, `url("${background.output}")`);
    if (css !== oldCss) fs.writeFileSync(path.join(root, 'pages.css'), css);
    const appManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
    appManifest.icons = pwaIcons.map((icon) => ({ src: `./${icon.output}`, type: 'image/png', sizes: `${icon.width}x${icon.height}` }));
    fs.writeFileSync(path.join(root, 'manifest.json'), `${JSON.stringify(appManifest, null, 2)}\n`);

    const allBefore = new Set();
    const allAfter = new Set();
    const pages = {};
    for (const [file, initial] of originals) {
        const before = pageImages(initial, oldCss);
        const after = pageImages(fs.readFileSync(path.join(root, file), 'utf8'), css);
        before.forEach((source) => allBefore.add(source));
        after.forEach((source) => allAfter.add(source));
        pages[file] = { beforeBytes: bytes(before), afterBytes: bytes(after) };
    }
    manifest.assets = Object.fromEntries(Object.entries(manifest.assets).sort(([a], [b]) => a.localeCompare(b)));
    // Keep the initial audit when this idempotent script is run again.
    manifest.audit ||= { beforeBytes: bytes([...allBefore]), afterBytes: bytes([...allAfter]), pages };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(JSON.stringify(manifest.audit, null, 2));
    console.log(`Favicon: ${favicon.output}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
