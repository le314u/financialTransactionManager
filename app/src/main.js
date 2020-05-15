const path = require('path');
const electron = require('electron');
const { app, BrowserWindow } = electron
const SwitchPages = require('./modules/switchPages.js')

module.exports = class Main{

  constructor(){
    // Atributos
    this.obj = {
      view : null
    }
    // Metodos
    this.#createListenner()
    this.switchPages = null
    
  }

  #createListenner = () => {
    //Cria a Janela
    app.on('ready', () => {
      this.#createWindow()
    })

    // Fecha o App caso todas as Janelas estejam Fechadas
    app.on('window-all-closed', () => {
      app.quit()
    })

    // Quando a tela do Aplicativo é Desfocada
    app.on('browser-window-blur', () => {
      console.error('Segundo Plano')
    })
  }
  
  #createWindow = () => {
    // Cria uma janela de navegação.
    this.obj.view = new BrowserWindow({
      // Tamanho Normal
      width: 800,
      height: 600,
      // Tamanho Maximo
      minWidth: 400,
      minHeight: 300,
      // Icone
      icon: '/usr/share/icons/gnome/256x256/places/start-here.png',
      // Cria Efeitos
      hasShadow: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        devTools: true
      }
    })

    this.switchPages = new SwitchPages(this.obj);

    // Desativa a barra de Menus
    this.obj.view.removeMenu()
  
    // So mostra a pagina quando ela estiver pronta
    this.obj.view.once('ready-to-show', () => {
      this.obj.view.show()
      this.obj.view.webContents.openDevTools()
    })
  }
}