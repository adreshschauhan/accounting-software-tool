// electron/main.js
// Runs the Express server directly inside Electron's main process (no
// separate terminal/process needed) and opens the calculator window.

const { app, BrowserWindow } = require('electron');
const path = require('path');
const createServer = require('../server/server');

let mainWindow;
let httpServer;

function startServer() {
  // app.getPath('userData') is the correct, permanent place for an
  // installed app to store its own data — different per user, survives
  // updates, and is where Windows/Mac expect app data to live.
  const dbPath = path.join(app.getPath('userData'), 'calculator.db');
  const expressApp = createServer(dbPath);
  httpServer = expressApp.listen(5000, () => {
    console.log('Server running (SQLite database at):', dbPath);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 560,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'client', 'index.html'));

  // mainWindow.webContents.openDevTools(); // uncomment while debugging
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (httpServer) httpServer.close();
  if (process.platform !== 'darwin') app.quit();
});
