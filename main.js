const { app, BrowserWindow } = require("electron");

const FRONTEND_URL = "http://127.0.0.1:3000";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

console.log("[electron] App starting");

function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function createWindow() {
  console.log("[electron] App ready");

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      contextIsolation: true
    }
  });

  console.log("[electron] Window created");
  win.webContents.openDevTools();

  let attempts = 0;
  let isLoaded = false;
  let retryTimeout = null;

  const clearRetry = () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  };

  const loadFrontend = () => {
    attempts += 1;
    console.log(`[electron] Loading frontend (${attempts}/${MAX_RETRIES}): ${FRONTEND_URL}`);

    win.loadURL(FRONTEND_URL).catch((error) => {
      console.error(`[electron] loadURL error on attempt ${attempts}:`, error);
    });
  };

  const scheduleRetry = (details) => {
    if (isLoaded) {
      return;
    }

    const isConnectionRefused =
      details.errorCode === -102 ||
      String(details.errorDescription || "").toLowerCase().includes("connection refused");

    if (attempts >= MAX_RETRIES) {
      console.error("[electron] Frontend server not running on port 3000");
      console.error("[electron] Max retry attempts reached. Last failure:", details);
      return;
    }

    console.error(
      `[electron] Failed to load frontend (attempt ${attempts}/${MAX_RETRIES}): ${details.errorDescription}`
    );

    if (isConnectionRefused) {
      console.error("[electron] Frontend server not running on port 3000");
    }

    clearRetry();
    retryTimeout = setTimeout(() => {
      console.log(`[electron] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      loadFrontend();
    }, RETRY_DELAY_MS);
  };

  win.webContents.on("did-start-loading", () => {
    console.log("[electron] Window started loading");
  });

  win.webContents.on("did-finish-load", () => {
    isLoaded = true;
    clearRetry();
    console.log(`[electron] Frontend loaded successfully: ${FRONTEND_URL}`);
  });

  win.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error("[electron] did-fail-load:", {
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame
      });

      if (!isMainFrame || normalizeUrl(validatedURL) !== normalizeUrl(FRONTEND_URL)) {
        return;
      }

      scheduleRetry({ errorCode, errorDescription, validatedURL });
    }
  );

  win.webContents.on("render-process-gone", (event, details) => {
    console.error("[electron] render-process-gone:", details);
  });

  win.webContents.on("unresponsive", () => {
    console.error("[electron] Window became unresponsive");
  });

  win.on("closed", () => {
    clearRetry();
  });

  loadFrontend();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
