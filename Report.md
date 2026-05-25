- Tried installing older node versions. (node version 16)
- Tried running `debug` command, it didn't work. It tells me the `uri` for mongodb connection is missing
- Created `.env` file and addedn `MONGODB_URI` with some local database and again tried the command.
- Ok this time, the server started on port `3000`.
- Populated the database by running the command `node scripts/populatedb.js mongodb://localhost:27017/sparc`.
- When i went to `/projects` route, the image was not working.
- The images are not pushed to the `projects` collection when seeding data.
  - So, i added the default image in the `views/gallery.pug` file as the fallback image if the the length of the `imgages` field is 0.

- The project image upload flow was using AWS S3 (signed URL approach):
  - Frontend called `/api/project/sign-s3/put` to get a pre-signed S3 URL.
  - File was PUT directly to S3 from the browser.
  - The returned S3 URL was stored in the `project.images[]` array in MongoDB.
  - Delete called `/api/project/image/delete` which triggered `s3.deleteObject`.
- **Issue:** No valid AWS credentials/bucket configured locally, so the upload flow was completely broken.
- **Fix:** Replaced the entire S3 flow with local filesystem storage:
  - Added a `POST /api/project/upload` endpoint using `multer` that saves files to `www/images/projects/`.
  - Files are served as static assets via Express's existing `express.static('www')` middleware.
  - `GET /api/project/image/delete` now deletes files from disk using `fs.unlink`.
  - On project delete, local image files are also cleaned up from disk.
  - Removed all `aws-sdk` usage from `projectController.js`.
  - Updated `edit-projects.js` frontend to POST `FormData` to the new local upload endpoint.

- Images on `/shop` were not visible.
  - **Root cause:** The `populatedb.js` seed script created products with `image: { contentType: 'png' }` but no `image.data` (no binary buffer). The `GET /product/image/:id` endpoint was sending `null` to the browser, resulting in broken images.
  - **Fix:** Updated `product_image_get` in `productController.js` to check if `product.image.data` exists. If missing (or on any error), it redirects to `/images/img1.jpg` as a default fallback image.

- The project used SendGrid (`@sendgrid/mail`) to send email notifications on enquiry submissions.
  - **Issue:** No valid `SENDGRID_API_KEY` configured locally, causing the warning `API key does not start with "SG."` on every server start.
  - **Fix:** Removed all `@sendgrid/mail` imports and `sgMail.send()` calls from `enquiryController.js`. Replaced with a local `sendMail()` dummy function that logs the email details (to, from, subject, body) to the console. The enquiry save and contact form flows continue to work correctly — emails are just logged instead of sent.

- The parallax image on the `/projects` hero section was not working.
  - **Root cause (confirmed):** `materialize-old.js` does not include the parallax plugin — it has only 1 unrelated mention of "parallax". The `$('.parallax').parallax()` call in `init.js` was failing silently because `$.fn.parallax` was never defined. The actual parallax plugin lives in `materialize.min.js` (Materialize v1.x), already loaded via `footer.pug`, which uses the `M.Parallax.init()` API.
  - Additionally, `gallery-materialize.css` had `display: none` on `.parallax img`, hiding the image entirely when JS didn't initialize it.
  - **Fix:**
    - Commented out `display: none` in `gallery-materialize.css` so the image is always visible.
    - Added an inline `<script>` in `gallery.pug` that calls `M.Parallax.init(elems)` on `window load`, using the correct Materialize v1 API.

- Project cards on `/projects` were overlapping with the footer.
  - **Root cause:** Each gallery item had a hardcoded inline style `position: absolute; left: 0px; top: 0px;` in `gallery.pug`. This caused all cards to stack at the origin before masonry.js could run, so the `.gallery` container never got a computed height. With height 0, the footer rendered immediately below the empty container, while the absolutely-positioned cards floated over it.
  - **Fix:** Removed the inline style from the gallery item markup. Masonry.js sets `position: absolute` and calculates the correct `top`/`left` values itself. Without the hardcoded style, cards render in document flow first, giving masonry valid dimensions to work with, and the container height is set correctly.

- Browser console errors on `/projects` route:
  - **5× iframe 404 errors** (`http://localhost:3000/&origin=...`): Seeded projects have empty `youtubeUrl`. The template always rendered `<iframe src="&origin=...">`, producing a malformed relative URL. **Fix:** Added `if project.youtubeUrl` guard in `gallery.pug` — iframe only renders when URL is non-empty.
  - **76× `TypeError: undefined is not an object (evaluating 'i.style')`** from `materialize-old.js` carousel: The `.carousel` div was always rendered even with 0 images, and the carousel plugin crashes when there are no `.carousel-item` elements. **Fix:** Added `if project.images.length` guard — carousel only renders when images exist.
  - **`TypeError: undefined is not an object (evaluating 'this[0]["client"+t]')`** from `script.js`: `M.Sidenav.init()` was called with `null` (returned by `document.querySelector('.sidenav')` on pages without a sidenav). **Fix:** Added `if (sidenav)` null guard in `script.js`.
  - **Font 404s** (Roboto `.woff2`/`.woff`): Only `.ttf` variants exist in `www/fonts/roboto/`. Not fixed — would require downloading the missing font files.

- **Font 404 errors** (Roboto `.woff2` / `.woff`): The `@font-face` declarations in `gallery-materialize.css` listed `eot → woff2 → woff → ttf` as fallback sources. Only `.ttf` files exist in `www/fonts/roboto/`, so the browser 404'd on every woff2 and woff request before falling through to ttf. **Fix:** Removed all `eot`, `woff2`, and `woff` entries from the five Roboto `@font-face` blocks, keeping only the `ttf` source. All modern browsers support TTF, so no visual change — just no more 404s.
