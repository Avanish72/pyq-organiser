# PYQ Topic Organiser 📚

A smart tool that uses AI to extract all questions from previous year exam papers and organises them topic-wise — so students can study smarter.

## Features

- 📄 Upload `.txt` question papers or paste text directly
- 🧠 AI extracts every question and detects the topic automatically
- 🗂️ Browse questions grouped by topic (Arrays, DP, OS, DBMS, etc.)
- ✅ Mark questions as solved and track progress per topic
- 💡 Get instant AI explanations for any question
- 🔍 Search across all questions
- 📊 Progress ring showing overall completion

## Live Demo

👉 **[Open the app](https://YOUR-USERNAME.github.io/pyq-organiser)**

## How to deploy on GitHub Pages

1. **Fork or clone this repo**
   ```bash
   git clone https://github.com/YOUR-USERNAME/pyq-organiser.git
   cd pyq-organiser
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repo on GitHub
   - Click **Settings** → **Pages**
   - Under *Source*, select **main branch** and **/ (root)** folder
   - Click **Save**
   - Your site will be live at `https://YOUR-USERNAME.github.io/pyq-organiser`

## How to use

1. Open the app link
2. Paste your question paper text (or upload a `.txt` file)
3. Enter your [Anthropic API key](https://console.anthropic.com/settings/keys) (free to get)
4. Click **Extract & Organise with AI**
5. Browse questions by topic, mark solved, get explanations!

## Getting an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for a free account
3. Go to **Settings → API Keys**
4. Click **Create Key** and copy it

> Your API key is never stored — it only lives in your browser tab while you use the app.

## Tech stack

- Pure HTML, CSS, JavaScript (no framework, no build step)
- Claude AI (`claude-sonnet-4-6`) via Anthropic API
- Google Fonts (Inter + Syne)
- Tabler Icons

## File structure

```
pyq-organiser/
├── index.html   # Main page + landing
├── style.css    # All styles
├── app.js       # App logic + API calls
└── README.md    # This file
```

## License

MIT — free to use, fork, and share.
