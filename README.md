# MERN + Electron Calculator (SQLite version)

A tiny calculator demonstrating the full pipeline: React frontend →
Express API → SQLite storage → Electron desktop wrapper. Fully
self-contained — nothing extra to install on the machine that runs the
final .exe.

## How it fits together

```
client/index.html   → React UI (the "R"). Plain HTML with React loaded
                       from a CDN — no build step, easy to read.
server/server.js    → Express API (the "E") that does the math and
                       saves each calculation to a SQLite file (the "M",
                       swapped in for MongoDB — same idea, zero setup).
electron/main.js    → Opens the native window and starts the Express
                       server directly inside Electron itself — the
                       user only ever sees one icon to double-click.
package.json         → ONE install for the whole project (client has no
                       dependencies of its own, so it doesn't need one).
```

## Run it while developing

From the project's root folder (the one with `package.json` in it):

```
npm install
npm start
```

That's it — one install, one start command. A calculator window opens.
Every `=` press sends a request to the Express API inside the app,
which does the math and saves it to a local SQLite file.

Want to test just the backend without opening the window?
```
node server/server.js
```

## Package it as an installer (.exe)

Once it's working the way you want:

```
npm run dist
```

This creates a `dist/` folder in the project root containing the
installer (something like `MERN Calculator Setup 1.0.0.exe`). That one
file is fully self-contained — the person installing it does NOT need
Node.js, Electron, or any database installed. SQLite ships inside the
app as a plain file.

Note: `better-sqlite3` is a native module, so the first `npm install`
compiles it for your system, and the `postinstall` script
(`electron-builder install-app-deps`) automatically re-compiles it to
match Electron's exact version before packaging. You don't need to run
anything extra — this happens on its own.

## Where the data actually lives

Each installed copy stores its SQLite file in that user's own app-data
folder (e.g. `%APPDATA%\MERN Calculator\calculator.db` on Windows) —
this is standard practice for installed apps, separate from your
project folder, and survives app updates.

## Where to go from here

- Add a "View History" button to the UI that calls `GET /api/history`.
- Remember: SQLite here means each installed copy has ITS OWN separate
  data. That's fine for a calculator, but for your real office tool
  (shared data across staff), you'll want the central-database
  approach instead — same Express code, just pointed at one shared
  server instead of a local SQLite file.
