# Arian Kapllanaj — Personal Portfolio Concept

A cinematic, responsive one-page portfolio built with HTML, CSS, JavaScript and Three.js.

## Preview locally

You can now open `index.html` directly by double-clicking it. The JavaScript and Three.js code are bundled locally, so the Initialize button works without a server.

You can also serve the folder through a small local server:

```bash
cd arian-portfolio
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Files

- `index.html` — structure and personalized content
- `contact.html` — animated contact experience and enquiry form
- `css/style.css` — responsive design and motion system
- `css/contact.css` — contact-page layout and form animations
- `js/main.js` — source for interactions, navigation, project overlays and reveal effects
- `js/scene.js` — Three.js interactive digital core
- `js/app.bundle.js` — browser-ready bundle used by `index.html`
- `js/contact.js` / `js/contact.bundle.js` — contact interactions and Three.js signal scene
- `js/vendor/three.module.min.js` — local Three.js dependency

No external images, fonts or CDN requests are required.

The contact form is prepared to submit to `send-email.php`. Add that server-side handler when deploying to PHP hosting; a successful handler can redirect to `contact.html?sent=1` to display the built-in success animation.
