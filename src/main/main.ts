import { app, BrowserWindow, ipcMain, Menu, nativeImage } from 'electron';
import * as url from 'url';
import fs from 'fs';
import {
  DELETE_FILE,
  OPEN_PROJECT,
  READ_FILE,
  HAS_FILE,
  REMOVE_UESLESS_TRANSLATIONS,
  RENAME_FILE,
  SAVE_FILE,
  SHOW_ARTICLE_SUMMARY,
  SHOW_PROJET_SETTINGS,
  WRITE_FILE,
} from '../constants/events';
const path = require('path');

const remote = require('@electron/remote/main');

remote.initialize();
let mainWindow: Electron.BrowserWindow | null;

function ensureDirExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirExists(dirname);
  fs.mkdirSync(dirname);
}

function listen(command: string, process: (...rest) => any) {
  ipcMain.on(command, (event, arg) => {
    const res = process(arg);
    event.sender.send(command + '-' + arg.channelId + '-response', res);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    backgroundColor: '#f2f2f2',
    icon: nativeImage.createFromPath(
      path.join(__dirname, '../../static/avatar.png')
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV !== 'production',
      webSecurity: false,
    },
  });

  remote.enable(mainWindow.webContents);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const menuTemplate: any = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Project',
        // click: () => {
        //   console.log('Open File Clicked');
        // },
      },
      {
        label: 'Open Project...',
        click: () => {
          if (!mainWindow) {
            return;
          }
          mainWindow.webContents.send(OPEN_PROJECT);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Project settings',
        click: () => {
          if (!mainWindow) {
            return;
          }
          mainWindow.webContents.send(SHOW_PROJET_SETTINGS);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Article Summary',
        click: () => {
          if (!mainWindow) {
            return;
          }
          mainWindow.webContents.send(SHOW_ARTICLE_SUMMARY);
        },
      },
      {
        label: 'Remove useless translations',
        click: () => {
          if (!mainWindow) {
            return;
          }
          mainWindow.webContents.send(REMOVE_UESLESS_TRANSLATIONS);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Reload',
        click: () => {
          if (!mainWindow) {
            return;
          }
          mainWindow.webContents.reload();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Exit',
        role: 'quit',
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:',
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on(SAVE_FILE, (event, arg) => {
  const { filePath, data } = arg;
  ensureDirExists(filePath);
  try {
    fs.writeFileSync(filePath, data);
    event.sender.send(SAVE_FILE + '-' + arg.channelId + '-response');
  } catch (err) {
    console.log(err);
  }
});

listen(HAS_FILE, (arg) => {
  const { filePath } = arg;
  try {
    const res = fs.existsSync(filePath);
    return res;
  } catch (err) {
    console.error(err);
  }
});

listen(READ_FILE, (arg) => {
  const { filePath } = arg;
  try {
    let res = fs.readFileSync(filePath, { encoding: 'utf8' });
    if (arg.json) {
      res = JSON.parse(res);
    }
    return res;
  } catch (err) {
    console.error(err);
  }
});

listen(WRITE_FILE, (arg) => {
  const { filePath, data } = arg;
  ensureDirExists(filePath);
  try {
    let toWrite = data;
    if (typeof toWrite === 'object') {
      toWrite = JSON.stringify(toWrite, null, 2);
    }
    fs.writeFileSync(filePath, toWrite);
    return true;
  } catch (err) {
    console.error(err);
  }
});

ipcMain.on(DELETE_FILE, (_, arg) => {
  const { filePath } = arg;
  fs.rmSync(filePath);
});

ipcMain.on(RENAME_FILE, (event, arg) => {
  const { oldFilePath, newFilePath } = arg;
  ensureDirExists(newFilePath);
  try {
    const res = fs.renameSync(oldFilePath, newFilePath);
    event.sender.send(RENAME_FILE + '-' + arg.channelId + '-response', res);
  } catch (err) {
    console.log(err);
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
