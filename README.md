# scottstone.ca

Personal site, built with [Astro](https://astro.build) as a static site. No server, database or Docker.

## Updating content

| To change | Edit |
| --- | --- |
| Name, tagline, about, research areas, skills, education, links | `src/data/profile.yaml` |
| Publications | `src/data/publications.yaml` (add an entry; `featured: true` puts it on the homepage) |
| CV / resume | replace `public/files/cv.pdf` or `public/files/resume.pdf` |
| Blog posts | add a Markdown file to `src/content/writing/` (start from `templates/post.md`) |
| Colours, fonts, spacing | `src/styles/global.css` (tokens at the top) |

Commit and push to `main`; Cloudflare Pages rebuilds and deploys automatically. You can also edit these files straight in GitHub's web editor.

## Running locally

Requires Node 22+.

```sh
npm install
npm run dev      # http://localhost:4321, shows drafts too
npm run build    # outputs static site to dist/
```

## Deploying to your own server (Docker)

The site builds into plain HTML served by a small nginx container named `scottstone`, over plain HTTP. It sits behind the server's shared reverse proxy in `~/docker/websites/proxy`, which owns ports 80/443 and the Cloudflare Origin Certificates and reaches this container over the `web` Docker network. That network is created once with `docker network create web`.

```sh
git clone https://github.com/scottastone/scottastone.github.io ~/docker/websites/scottstone.ca
cd ~/docker/websites/scottstone.ca && docker compose up -d --build
```

### Automatic updates

Run the site from a clone of this repo on the server, then let cron check GitHub every 2 minutes and rebuild when `main` changes (no secrets or open ports needed):

```sh
crontab -e
# add this line (adjust the path):
*/2 * * * * $HOME/scottstone-repo/scripts/auto-update.sh >> /tmp/site-update.log 2>&1
```

`tail /tmp/site-update.log` shows each update. The script only fast-forwards, so it stops rather than overwrite edits made directly on the server.

Alternative: `.github/workflows/deploy.yml` can push updates over SSH instead, once the `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` and `SERVER_PATH` repo secrets are set.

Caching: `/_astro/*` files have content hashes in their names and are cached for a year; everything else (pages, PDFs, images) is revalidated on each visit, so edits show up immediately.

## GitHub Pages (redirect)

`.github/workflows/pages.yml` publishes https://scottastone.github.io on every push to `main`, but every page there just forwards to the same path on scottstone.ca (`scripts/make-redirects.mjs`). Requires repo Settings > Pages > Source: **GitHub Actions**.

## Alternative: Cloudflare Pages (no server)

Workers & Pages > Create > Pages > Connect to Git, preset Astro, build `npm run build`, output `dist`, then add the custom domains. `public/_redirects` handles the old `/posts/...` URLs there.

## Moving old blog posts over

```sh
docker compose cp web:/data/db.sqlite3 ./old.sqlite3   # on the old server
python3 scripts/export_django_posts.py ./old.sqlite3
```
