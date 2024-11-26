import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

// ScraperImports
import { ExportResults } from "./components/outputproduct";
import { BrowserProcess, PhoneProcess } from "./components/scraper";
import { IPC_form_data, SuccessMessage } from "./components";
import path from "node:path";

import fs from "node:fs";
let mainWindow: BrowserWindow | null;

// Function to get the Documents directory
function getDocumentsPath() {
  // Use different methods for Windows and macOS
  if (process.platform === "win32") {
    return path.join(app.getPath("home"), "Documents", app.getName());
  } else if (process.platform === "darwin") {
    return path.join(app.getPath("documents"), app.getName());
  } else {
    // Fallback to user data directory for other platforms
    return app.getPath("userData");
  }
}

function createWindow(): void {
  // Create the browser window.
  const userDataPath = getDocumentsPath();
  console.log(userDataPath);
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    fs.mkdirSync(`${userDataPath}/results`, { recursive: true });
  }
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow!.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");
  console.log(getDocumentsPath());

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  /*   ipcMain.on('ping', () => console.log('pong')) */

  //@ts-ignore
  ipcMain.on("ping", async (e: Electron.IpcMainEvent, data: IPC_form_data) => {
    console.log(data);
    let platform = data.system;
    if (platform === "computer") {
      let finalResult: Array<unknown> = [];
      for (var i = 0; i < data.keywords.length; i++) {
        let keyword = data.keywords[i];
        try {
          let run = await new BrowserProcess([keyword], data.language).Launch();
          finalResult = [...finalResult, ...run];
          //TODO: we can notify that one keyword finished
          mainWindow?.webContents.send("Failed Keyword", {
            status: 200,
            message: `Keyword ${keyword} finished Scraping`,
          });
        } catch (error) {
          // TODO: We can notify that one keyword failed
          mainWindow?.webContents.send("Failed Keyword", {
            status: 500,
            message: `Keyword ${keyword} failed to execute`,
          });
        }
      }

      let fileNameOut = `${getDocumentsPath()}/results/${data.output}`;
      await ExportResults(data.outputFormat, finalResult, fileNameOut);
      mainWindow?.webContents.send("finished_scraping", {
        status: 200,
        results: finalResult.length,
        path: `${getDocumentsPath()}/results/${data.output}`,
      } as SuccessMessage);
    } else if (platform === "phone") {
      let finalResult: Array<unknown> = [];
      for (let index = 0; index < data.keywords.length; index++) {
        const keyword = data.keywords[index];
        try {
          let run = await new PhoneProcess(data.deviceType, data.language, [
            keyword,
          ]).Launch();
          finalResult = [...finalResult, ...run];
          //TODO: we can notify that one keyword finished
          mainWindow?.webContents.send("Failed Keyword", {
            status: 200,
            message: `Keyword ${keyword} finished Scraping`,
          });
        } catch (error) {
          // TODO: We can notify that one keyword failed
          mainWindow?.webContents.send("Failed Keyword", {
            status: 500,
            message: `Keyword ${keyword} failed to execute`,
          });
        }
      }
      let fileNameOut = `${getDocumentsPath()}/results/${data.output}`;
      await ExportResults(data.outputFormat, finalResult, fileNameOut);
      mainWindow?.webContents.send("finished_scraping", {
        status: 200,
        results: finalResult.length,
        path: `${getDocumentsPath()}/results/${data.output}`,
      } as SuccessMessage);
    }
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    const userDataPath = getDocumentsPath();
    console.log(userDataPath);
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      fs.mkdirSync(`${userDataPath}/results`, { recursive: true });
    }
  });

  app.on("ready", () => {
    const userDataPath = getDocumentsPath();
    console.log(userDataPath);
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      fs.mkdirSync(`${userDataPath}/results`, { recursive: true });
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
