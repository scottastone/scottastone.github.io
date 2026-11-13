# scottstone.ca

Personal site, built with [Astro](https://astro.build) as a static site and served from Scott's own server in an nginx Docker container.

## Editing the site

Everything you'd normally change is a plain text file. Edit it on GitHub (open the file, click the pencil, then **Commit changes** to `main`). The server checks GitHub every 2 minutes and rebuilds, so the live site updates a few minutes after you commit.

For bigger edits across several files, press `.` on the repo page to open the same files in a full editor in your browser (github.dev).

| To change | Edit |
| --- | --- |
| Your name, headline, about text, links, experience, skills, education | `src/data/profile.yaml` |
| Page headings, the publications/writing page intros, how many papers and posts the homepage shows | `src/data/site.yaml` |
| Publications | `src/data/publications.yaml` (copy an entry; `featured: true` puts it on the homepage) |
| CV / resume | upload a new `public/files/cv.pdf` or `public/files/resume.pdf` over the old one |
| Blog posts | add a Markdown file to `src/content/writing/` (copy `_template.md` there) |
| Colours, fonts, spacing | `src/styles/global.css` (tokens at the top) |

### Writing a post

1. In `src/content/writing/`, choose **Add file > Create new file**.
2. Name it `my-post-title.md`. The name becomes the address: `scottstone.ca/writing/my-post-title/`.
3. Paste in `_template.md`, fill in the title, description and date, and write.
4. Keep `draft: true` while working on it; delete that line to publish.

For pictures, use **Add file > Upload files** in the same folder, then write `![description](./picture.jpg)` in the post. Images are resized and compressed for you.

### If an edit doesn't show up

Look at the commit on GitHub. A red X next to it means that edit broke the build (GitHub also emails you). The live site keeps showing the last working version, so nothing is broken for visitors. Click the red X, then **Details**: the error names the file and the field, for example

```
src/data/profile.yaml has a problem:
  - focus.0.title: Invalid input: expected string, received undefined
```

Fix the file and commit again. The usual YAML slip-ups:

- Text containing a colon followed by a space (`Title: subtitle`) needs "double quotes" around it.
- Indentation is spaces, and items in the same list must line up.
- Lists in square brackets need the closing `]`.

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

### Automatic updates

Run the site from a clone of this repo on the server, then let cron check GitHub every 2 minutes and rebuild when `main` changes (no secrets or open ports needed):

```sh
crontab -e
# add this line (adjust the path):
*/2 * * * * $HOME/scottstone-repo/scripts/auto-update.sh >> /tmp/site-update.log 2>&1
```

`tail /tmp/site-update.log` shows each update. The script only fast-forwards, so it stops rather than overwrite edits made directly on the server.

### Other sites behind this nginx

This nginx also fronts [pottedpainter.ca](https://github.com/scottastone/heineart.ca): `nginx/default.conf` proxies it to the `heineart` container over the shared `web` Docker network that this compose file creates. Its Cloudflare Origin Certificate goes in `certs/pottedpainter/origin.pem` and `origin.key`. If that certificate is missing, only pottedpainter.ca fails; scottstone.ca keeps working.

Caching: `/_astro/*` files have content hashes in their names and are cached for a year; everything else (pages, PDFs, images) is revalidated on each visit, so edits show up immediately.

## Build check and GitHub Pages (redirect)

`.github/workflows/pages.yml` builds the site on every push to `main` and every pull request, which is what produces the green tick or red X on each commit. On `main` it also publishes https://scottastone.github.io, where every page just forwards to the same path on scottstone.ca (`scripts/make-redirects.mjs`). Requires repo Settings > Pages > Source: **GitHub Actions**.

## Alternative: Cloudflare Pages (no server)

Workers & Pages > Create > Pages > Connect to Git, preset Astro, build `npm run build`, output `dist`, then add the custom domains. `public/_redirects` handles the old `/posts/...` URLs there.

## Moving old blog posts over

```sh
docker compose cp web:/data/db.sqlite3 ./old.sqlite3   # on the old server
python3 scripts/export_django_posts.py ./old.sqlite3
```
