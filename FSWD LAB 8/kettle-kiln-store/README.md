# Kettle & Kiln - tea store (full stack)

Node.js 20+, no npm packages needed.

    node server.js          # then open http://localhost:3000
    node api-test.js        # optional: sample API calls (server must be running)

The server serves the website from `public/` and the REST API from `/api`.
Data is saved in `data/db.json` (your uploaded file is included; delete it to start fresh).
Open the pages through http://localhost:3000, not by double-clicking the HTML files
(the front-end uses ES modules and calls the API).

## Back end  (src/)
route -> controller -> validator -> service -> db
(no middleware: controllers call requireUser() for protected endpoints; CORS and static files live in app.js)

    src/
      config/        port, paths, shipping rules
      core/          router, HttpError, JSON body reader
      db/            database.js (JSON file load/save), seed.js
      utils/         money, validators
      modules/       auth | products | reviews | cart | orders
                     each has: *.routes.js, *.controller.js, *.validator.js, *.service.js

## Front end  (public/js/)
page (data-page) -> controller -> service -> API, with views for HTML

    app.js           entry: navbar + the controller for the current page
    config.js        API base URL, max quantity
    controllers/     home, auth (signup/login), cart, checkout
    services/        http (fetch + token), session, auth, product, cart, review, order
    views/           navbar, product card, cart rows, reviews, toast, product art
    utils/           dom, format, form, nav, errors
    data/            product-presentation.js (colours/shapes per product id)

Product pictures are in `public/img/products/*.svg`. To use real photos, drop .jpg/.png/.webp
files in that folder and change each product's `image` path (src/db/seed.js, or data/db.json).

## Behaviour notes
- Cart, orders, reviews and accounts are now stored on the server (not localStorage).
- Cart and checkout need a login; guests are sent to the login page and back.
- Prices, shipping ($5, free over $50) and totals come from the API.
