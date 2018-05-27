const {app, Menu, BrowserWindow, ipcMain} = require('electron')
// Module to create native browser window.
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//need this function until Electron manage to implement dynamic menu items
//https://github.com/electron/electron/issues/528
function buildKokMenu({login=true}) {
    const logInOut = {
        label: login ? "Login":"Logout",
        click() {
            mainWindow.webContents.send(login ? 'login':'logout');
        }
    }

    const menuTemplate = [
        {
            label: "Dashboard",
            click() {
                mainWindow.webContents.send('navigate','/')
            }
        },
        {
            label: "Account",
            submenu: [
                logInOut,
                {
                    label: "Profile",
                    click() {
                        mainWindow.webContents.send('navigate','account/profile');
                    },
                    enabled: login ? false:true                    
                }
            ]
        }
    ];

    if (process.env.ENV === "development") {
        menuTemplate.push({
            label: "Dev",
            submenu: [{label: "Dev tools", role: "toggledevtools"}]
        });
        mainWindow.webContents.openDevTools();
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

ipcMain.on('rebuild-menu',(evt,arg)=>buildKokMenu(arg));

function createWindow() {
    // Create the browser window.
    
    mainWindow = new BrowserWindow({
        width: 630,
        height: 640,
        backgroundColor: '#000',
        icon: './icons/icon.png'
    });

    //Application menus
    buildKokMenu({login: true});


    mainWindow.once('ready-to-show',()=>mainWindow.show());

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.resolve(__dirname, "index.html"),
        protocol: 'file',
        slashes: true
    }));

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});