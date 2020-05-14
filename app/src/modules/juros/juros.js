const userBD = require('./../accessBd/userBD')
const userMgr = new userBD()

module.exports = class Login{

  constructor(ipcMain, switchPages){
    this.jurosSpace = {
      ipcMain: ipcMain, // Receber dados do front
      switchPages: switchPages, // Enviar dados para switchPages
      nameSpace: switchPages.nameSpace // Objeto de objetos usado para persistencia de dados
    }
  };

  // Add um canal de comunicação unilateral do front para juros.js
  #addListenner = () => {
    // Alias 
    let ipcMain = this.jurosSpace.ipcMain

    // Registra o evento no Db
    ipcMain.on('register', (event, args) => {
      const { user, pwd } = args
    })

    // Registra o evento no GoogleCalendar
    ipcMain.on('register', (event, args) => {
      const { user, pwd } = args
    })
  };

  // Remove o canal de comunicação unilateral do front para juros.js
  #removeListenner = () => {
    // Alias 
    let ipcMain = this.jurosSpace.ipcMain

    // Remove Listeners
    ipcMain.removeListener('register')
  };

  // Carrega o front no BrowserWindow e cria os canais de comunicação
  switchPageOn = (viewPage) => {
    viewPage.loadFile('app/src/modules/juros/front/index.html')
    this.#addListenner()
  };

  // Encerra  os canais de comunicação do front com BrowserWindow 
  switchPageOff = () => {
    this.#removeListenner()
  };
}