# Target-machine deployment

## Run on a Windows machine

1. Install Python 3.9 or newer and select **Add Python to PATH** during installation.
2. Extract this ZIP to a permanent folder, for example `C:\KishunSharmaLawChambers`.
3. Double-click `start_site.bat`.
4. Open `http://127.0.0.1:8000` on that machine.

No additional Python packages are required. Consultation requests and the local visit count are stored in a `data` folder created beside the extracted application folder.

## Make it available to other users

The included server is intended for local demonstration. For a public website, deploy the static files to Hostinger or Cloudflare Pages, then use a production form/database service for consultation requests and visitor analytics. Do not expose the local Python development server directly to the internet.
