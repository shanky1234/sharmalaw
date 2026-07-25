# Hostinger deployment guide

This website is static HTML, CSS, and JavaScript. The Python `app.py` file runs the local preview and the local consultation-dashboard demonstration. It is not needed for the static website on standard Hostinger web hosting.

## Files to upload

Upload these files directly into your domain's `public_html` directory:

- `index.html`
- `civil-property.html`
- `criminal-defence.html`
- `family-matters.html`
- `legal-notices.html`
- `style.css`
- `practice.css`
- `theme.css`
- `footer.css`
- `script.js`

Do not place them inside an extra folder. `index.html` must be directly inside `public_html`.

## Upload steps

1. In Hostinger hPanel, open **Websites** and select your website.
2. Open **File Manager**, then open the domain's `public_html` folder.
3. Remove Hostinger's default `index.html` file, if one exists.
4. Upload `advocate-chamber-hostinger-deploy.zip`.
5. Extract the ZIP file inside `public_html`.
6. Confirm that `index.html` appears directly in `public_html`, then open your domain in a browser.

## Before publishing

- Replace the placeholder contact form behaviour with a real email, WhatsApp, or CRM integration.
- Add the chamber's real phone number, email address, office hours, and advocate profile details.
- Enable SSL in Hostinger so the website uses `https://`.

The local Python demo saves consultation requests, displays them at `admin.html`, and includes a visible page-visit counter. Standard Hostinger static hosting cannot run this Python API, so before publishing the form or counter you must add a PHP/database, email service, CRM form backend, or an analytics/counter service.
