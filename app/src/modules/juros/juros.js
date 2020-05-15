const google_calendar = require('../googleCalendar/calendar.js');
const calendar = new google_calendar()
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

  // Add um canal de comunicação unilateral do front para juros.js e do juros.js para com o controller 'switchPages.js'
  #addListenner = () => {
    // Alias 
    let ipcMain = this.jurosSpace.ipcMain
    let switchPages = this.jurosSpace.switchPages

    // Registra o evento no Db
    ipcMain.on('juros_register_calendar', (event, args) => {
      const { nomeEvento, descricao, dia, mes, ano} = args
      console.log("Salva no Bd DEPOIS IMPLEMENTAR juros.js")
    })
    
    // Registra o evento no GoogleCalendar
    ipcMain.on('juros_register_calendar', (event, args) => {
      const { nomeEvento, descricao, dia, mes, ano} = args
      calendar.createEvent(nomeEvento, descricao, dia, mes, ano)
    })
  };

  // Remove o canal de comunicação unilateral do front para juros.js
  #removeListenner = () => {
    // Alias 
    let ipcMain = this.jurosSpace.ipcMain

    // Remove Listeners
    ipcMain.removeListener('juros_register_calendar')
  };

  // Carrega o front no BrowserWindow e cria os canais de comunicação
  switchPageOn = (viewPage) => {
    viewPage.loadFile('app/src/modules/juros/front/index.html')
    this.#addListenner()
    calendar.start(this.jurosSpace.nameSpace)
  };

  // Encerra  os canais de comunicação do front com BrowserWindow 
  switchPageOff = () => {
    this.#removeListenner()
  };
}