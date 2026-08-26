# Tumbview

A fullscreen slideshow viewer for any public Tumblr blog. Point it at a blog name and it plays a random, non-repeating sequence of that blog's photos.

## What it does

Tumbview fetches photo posts from a Tumblr blog through the Tumblr API and displays them one at a time, fullscreen, on a black background. Photos play in random order without repeats; once every photo on the current page has been shown, it automatically fetches the next page and keeps going. No build step, no dependencies — just static HTML/CSS/JS.

## Use cases

- **Party / event visuals.** Drop in a blog and let it run on a screen or projector as simple, hands-off ambient visuals — no VJ software required.
- **Finding content to repost.** Tumblr users can flip through a blog's photo posts fullscreen, distraction-free, to quickly spot images worth reblogging to their own Tumblr.

## Features

- Load any public Tumblr blog by name
- Adjustable slide interval (1–120 seconds)
- Random, non-repeating photo order with automatic pagination
- Play / pause
- Next / previous navigation (previous steps back through playback history)
- Open the current photo's original Tumblr post in a new tab
- Minimal UI that auto-hides during playback and reappears on mouse move or key press

## Controls

| Input | Action |
|---|---|
| `Enter` | Load the blog and start |
| `Space` / `→` | Next photo |
| `←` | Previous photo |
| Click on photo | Next photo |
| ▶ / ⏸ button | Play / pause |
| 🔗 button | Open current photo's post on Tumblr |

## Setup

Tumbview needs a Tumblr API key to fetch posts. Keys are kept out of the repo on purpose (see [Notes](#notes)):

1. Get a free key at [tumblr.com/oauth/apps](https://www.tumblr.com/oauth/apps).
2. Copy `config.example.js` to `config.js`.
3. Put your key in `config.js`:
   ```js
   window.TUMBVIEW_CONFIG = {
     apiKey: 'YOUR_TUMBLR_API_KEY'
   };
   ```

`config.js` is gitignored, so your key stays local.

## Usage

No install or build required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder with any static file server (e.g. `npx serve .`)

Then type a blog name (without `.tumblr.com`), set the interval in seconds, and click **Go**.

## Screenshots

![Tumbview fullscreen photo with overlay UI](screenshots/Screenshot_1.png)

<p>
  <img src="screenshots/Screenshot_2.png" width="100%" alt="Overlay UI close-up: blog input, interval, and controls" />
</p>
<p>
  <img src="screenshots/Screenshot_3.png" width="49%" alt="Landscape photo, UI visible" />
  <img src="screenshots/Screenshot_4.png" width="49%" alt="Portrait photo, UI visible" />
</p>

## Notes

- **API key.** The Tumblr API key now lives in a local, gitignored `config.js` (see [Setup](#setup)) instead of being hardcoded in `tumbview.js`. This is still a client-side key exposed to anyone using the deployed page — that's unavoidable for a pure static site without a backend proxy — but at least it's no longer committed to the repo.
- **Previously exposed key.** An earlier version of this repo had a real API key committed directly in the source. That key is still visible in the git history on GitHub. If it's still active, regenerate/revoke it from your [Tumblr app settings](https://www.tumblr.com/oauth/apps) and use the new one only in your local `config.js`.
