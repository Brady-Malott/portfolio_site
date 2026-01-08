# Portfolio Site

A JSON-driven portfolio site with a home page, projects gallery, and contact page.

## Structure

- `index.html` – Home page with experience timeline and tools grid, populated from `data/experience.json` and `data/tools.json`.
- `projects.html` – Grid of project cards populated from `data/projects.json`.
- `contact.html` – Contact details populated from `data/contact.json`.
- `main.js` – Page initialization and DOM rendering logic.
- `styles.css` – Light custom styling layered on top of Bootstrap.
- `data/experience.json` – Work experience entries for the experience timeline.
- `data/tools.json` – Tools & technologies grid data.
- `data/projects.json` – Project cards, including link type (web vs download).
- `data/contact.json` – Contact information (email, GitHub, LinkedIn, etc.).

To add or edit content, simply update the JSON files in the `data` folder.

The site uses [Bootstrap 5](https://getbootstrap.com/) via CDN for layout, typography,
and basic components, with a small amount of custom CSS for the experience timeline
and project hover effects.

## Running locally

Because the site loads JSON via `fetch`, it should be served over HTTP (not opened directly from the file system).

With Node.js installed, you can run:

```bash
cd portfolio_site
npm init -y
npm install serve --save-dev
npm start
```

Then open the printed `http://localhost:...` URL in your browser.
