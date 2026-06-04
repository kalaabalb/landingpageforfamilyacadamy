# Family Academy Landing Page

This repository is the public landing page for Family Academy.

## Local preview

```bash
npm start
```

Open `http://localhost:3000`.

## Render

- Service type: `Static Site`
- Build command: `npm run build`
- Publish directory: `.`
- Environment variables: none required for the current static setup

## Downloads

The landing page is wired to `config.js`.

Fill in the `href` values with your public download URLs for:

- client Windows installer
- client Windows zip
- client macOS zip
- client Linux tarball
- client Android APK pack
- client Play Store bundle
- TV Android APK
- TV Android bundle
- TV Linux bundle
- TV macOS zip

## Notes

- Keep Cloudinary secrets out of the browser code.
- Use public delivery URLs or server-side signed links for the actual files.
- The page is designed as a cinematic room, so wheel, arrow keys, swipe, and clicks all move through the story.
