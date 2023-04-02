import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { SHOW_PROJET_SETTINGS } from '../constants/events';

const remote = require('@electron/remote/main');

remote.initialize();
let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    backgroundColor: '#f2f2f2',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV !== 'production',
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
        // click: () => {
        //   console.log('Save File Clicked');
        // },
      },
      {
        type: 'separator',
      },
      {
        label: 'Project settings',
        click: () => {
          console.log('dd');
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
        label: 'Exit',
        role: 'quit',
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

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
