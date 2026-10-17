"""Check optimized image references, unchanged content, and image integrity."""
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'assets/img/web/manifest.json').read_text())
ASSETS = MANIFEST['assets']


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.images, self.ids, self.links, self.text = [], [], [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img':
            self.images.append(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href'))

    def handle_data(self, data):
        self.text.extend(data.split())


def local(value):
    return value.removeprefix('https://theasthanagroup.com/').split('?')[0]


def original(value):
    source = local(value)
    return ASSETS.get(source, {}).get('source', source)


image_count = 0
for file in sorted(ROOT.glob('*.html')):
    current_text = file.read_text()
    old_text = subprocess.check_output(['git', 'show', f'HEAD:{file.name}'], cwd=ROOT, text=True)
    current, old = Page(current_text), Page(old_text)
    assert current.text == old.text, f'Content changed: {file.name}'
    assert current.ids == old.ids, f'IDs changed: {file.name}'
    assert current.links == old.links, f'Links changed: {file.name}'
    assert len(current.images) == len(old.images), f'Image count changed: {file.name}'
    for before, after in zip(old.images, current.images):
        image_count += 1
        assert original(after['src']) == original(before['src']), f'Wrong image: {file.name}'
        for key in ('alt', 'class', 'style', 'onerror'):
            assert after.get(key) == before.get(key), f'{key} changed: {file.name}'
        assert after['loading'] in ('lazy', 'eager') and after['decoding'] == 'async'
        source = local(after['src'])
        assert (ROOT / source).is_file(), f'Missing source: {source}'
        if source in ASSETS:
            info = ASSETS[source]
            assert int(after['width']) == info['width'] and int(after['height']) == info['height']
        widths = set()
        for candidate in after.get('srcset', '').split(','):
            if not candidate.strip():
                continue
            source, width = candidate.split()
            width = int(width.removesuffix('w'))
            assert width not in widths, f'Duplicate responsive width: {file.name}'
            widths.add(width)
            assert width == ASSETS[source]['width'] and (ROOT / source).is_file()
        if widths:
            assert after.get('sizes'), f'Missing responsive sizes: {file.name}'
    for match in re.finditer(r'(?:src|href|content)="((?:https://theasthanagroup.com/)?assets/[^"?]+)(?:\?[^"#]*)?"', current_text):
        assert (ROOT / local(match[1])).exists(), f'Missing local asset: {file.name}: {match[1]}'
    if 'pages.css' in current_text:
        assert 'pages.css?v=20261016-images' in current_text
        assert 'assets/js/app.js?v=101' in current_text

for output, info in ASSETS.items():
    path = ROOT / output
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        assert image.size == (info['width'], info['height'])
        assert 34853 not in image.getexif(), f'GPS metadata retained: {output}'
    assert path.stat().st_size == info['bytes']
    assert path.stat().st_size < (ROOT / info['source']).stat().st_size, f'Image grew: {output}'

sources = {info['source'] for info in ASSETS.values()}
for source in sources:
    before = subprocess.check_output(['git', 'show', f'HEAD:{source}'], cwd=ROOT)
    assert hashlib.sha256(before).digest() == hashlib.sha256((ROOT / source).read_bytes()).digest(), f'Original overwritten: {source}'

icons = json.loads((ROOT / 'manifest.json').read_text())['icons']
for icon in icons:
    with Image.open(ROOT / icon['src'].removeprefix('./')) as image:
        assert icon['sizes'] == f'{image.width}x{image.height}' and image.width == image.height
assert 'site-static-v101' in (ROOT / 'sw.js').read_text()
assert 'sw.js?v=101' in (ROOT / 'assets/js/app.js').read_text()
assert 'return cache.addAll(assets)' in (ROOT / 'sw.js').read_text()
home = Page((ROOT / 'index.html').read_text()).images[0]
assert home['loading'] == 'eager' and home['fetchpriority'] == 'high'
for image in Page((ROOT / 'culture.html').read_text()).images[1:]:
    assert image['loading'] == 'lazy'

print(f'PASS: {image_count} image tags, {len(ASSETS)} generated assets, {len(sources)} unchanged originals.')
print('PASS: text, publication numbering, links, alt text, portrait framing, responsive sizes, icons, and cache versions.')

# A visual review sheet is temporary and never part of the published website.
review = [
    ('Group photo', 'assets/img/optimized/group-photo-2026.jpg', 840),
    ('Tanya portrait', 'assets/img/optimized/tanya-700.jpg', 336),
    ('Hansika portrait', 'assets/img/optimized/hansika-700.jpg', 336),
    ('Publication figure', 'assets/img/publications/post-optimization-subspace.webp', 560),
    ('Software illustration', 'assets/img/4.png', 960),
    ('DOE seal', 'assets/img/funding/doe-seal.svg', 112),
    ('NSF seal', 'assets/img/funding/nsf-logo.svg', 112),
]
sheet = Image.new('RGB', (1080, 340 * len(review)), '#f4f6fb')
draw = ImageDraw.Draw(sheet)
for row, (label, source, width) in enumerate(review):
    output, info = next((output, info) for output, info in ASSETS.items()
                        if info['source'] == source and info['options']['width'] == width
                        and output.endswith('.webp'))
    paths = [ROOT / source, ROOT / output] if not source.endswith('.svg') else [ROOT / output, ROOT / output]
    for column, item in enumerate(paths):
        with Image.open(item) as image:
            picture = ImageOps.exif_transpose(image).convert('RGBA')
            if 'portrait' in label:
                offset = .3 if label.startswith('Hansika') else .5
                picture = ImageOps.fit(picture, (280, 280), centering=(.5, offset))
            picture = ImageOps.contain(picture, (500, 285))
            x, y = column * 540 + (540 - picture.width) // 2, row * 340 + 40
            sheet.paste(picture, (x, y), picture)
        name = 'Original (resized for comparison)' if column == 0 and not source.endswith('.svg') else 'Optimized display copy'
        draw.text((column * 540 + 20, row * 340 + 12), f'{label}: {name}', fill='#1f2430')
sheet.save('/private/tmp/asthana-image-optimization-review.jpg', quality=92)
print('Visual review: /private/tmp/asthana-image-optimization-review.jpg')
