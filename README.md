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

The site builds into plain HTML and is served by a single nginx container, using the same Cloudflare Origin Certificate as the old Django site (`certs/origin.pem` and `certs/origin.key`, not committed).

First time, replacing the old Django site:

```sh
# 1. Save the old blog posts before shutting anything down
cd ~/old-site                                   # wherever the Django docker-compose.yml lives
docker compose cp web:/data/db.sqlite3 ./old.sqlite3

# 2. Get this site onto the server and give it the certs
git clone <this repo> ~/scottstone-site         # or unzip it there
cp -r ~/old-site/certs ~/scottstone-site/
cd ~/scottstone-site
python3 scripts/export_django_posts.py ~/old-site/old.sqlite3   # then commit src/content/writing/

# 3. Swap: stop the old stack (frees ports 80/443; its data volume is kept), start the new one
(cd ~/old-site && docker compose down)
docker compose up -d --build
```

Roll back with `docker compose down` here and `docker compose up -d` in the old folder.

Updating later: push to `main`. `.github/workflows/deploy.yml` SSHes in and runs `git pull && docker compose up -d --build` (same secrets as before; point `SERVER_PATH` at the new folder). Or run those two commands on the server yourself.

Caching: `/_astro/*` files have content hashes in their names and are cached for a year; everything else (pages, PDFs, images) is revalidated on each visit, so edits show up immediately.

## GitHub Pages

`.github/workflows/pages.yml` also publishes the site to https://scottastone.github.io on every push to `main`. One-time setup: repo Settings > Pages > Source: **GitHub Actions**. Canonical links point at scottstone.ca, so search engines treat that as the main copy.

## Alternative: Cloudflare Pages (no server)

Workers & Pages > Create > Pages > Connect to Git, preset Astro, build `npm run build`, output `dist`, then add the custom domains. `public/_redirects` handles the old `/posts/...` URLs there.

## Moving old blog posts over

```sh
docker compose cp web:/data/db.sqlite3 ./old.sqlite3   # on the old server
python3 scripts/export_django_posts.py ./old.sqlite3
```
