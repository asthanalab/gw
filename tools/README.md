# Website image optimization

`optimize-images.cjs` generates small, metadata-free display copies under
`assets/img/web/` and updates image references without changing page content.
Original photos, scientific figures, and vector logos remain untouched.

The script requires Node.js and `sharp`. Run it from the repository root:

```sh
node tools/optimize-images.cjs
```

Set `NODE_PATH` to an existing package installation if necessary. The script is
idempotent: rerunning it reuses the same content-addressed images. The generated
manifest records each source, dimensions, compression settings, and initial
image-payload audit. Social sharing uses JPEG; display images use WebP, while
small vector publication schematics remain SVG. Images are resized, not cropped
or redrawn, and existing portrait framing is retained in CSS.

Run checks with Python and Pillow available:

```sh
python3 tools/check-images.py
```

Checks compare against `HEAD`, verify unchanged content and originals, validate
every generated image and responsive size, and produce a temporary visual review
sheet. Review the sheet before committing the update.
