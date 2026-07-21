# Family Academy Landing Page

Public cinematic landing page for Family Academy.

## Role

- Brand and product presentation
- Public download hub for the client and TV builds
- SEO-friendly entry point for search engines and social previews

## Development

```bash
npm start
```

Open `http://localhost:3000`.

## Deploy

- Production domain: `familyacademy.et`
- HahuCloud Enterprise: upload this directory's static files to the `familyacademy.et` document root
- Build command: `npm run build`
- Publish directory: `.`

## Downloads

Download URLs are defined in `config.js` and point to GitHub Release assets for:

- Windows installer and zip
- macOS zip
- Linux tarball
- Android split APKs and universal APK
- Android App Bundle
- TV APKs and desktop bundles

## Notes

- Keep browser code free of secrets.
- Keep the GitHub Release tags or `downloads.familyacademy.et` assets aligned with the latest published artifacts.
- The landing page is intentionally cinematic and keyboard, mouse, touch, and remote friendly.
