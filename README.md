# Horizon — Dwellsy IQ

Your unified project intelligence dashboard.

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository called `horizon`
3. Upload all these files (drag & drop the folder)

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select your `horizon` repository
4. Click **Deploy** (Vercel auto-detects Vite)

### Step 3 — Add your OpenAI API key
1. In your Vercel project, go to **Settings → Environment Variables**
2. Add: `VITE_OPENAI_API_KEY` = your key from [platform.openai.com](https://platform.openai.com)
3. Click **Redeploy** — done!

## Local development

```bash
npm install
npm run dev
```

## Connecting your Google Doc

To load projects from your Google Doc automatically:
1. Enable the Google Docs API in Google Cloud Console
2. Create a service account and download the JSON key
3. Add `VITE_GDOC_ID` and `VITE_GDOC_KEY` to Vercel env vars
4. Replace the `INITIAL_PROJECTS` import in `src/data.js` with a fetch call

Or use Make.com to sync your Google Doc to a simple JSON endpoint and point the app at it.
