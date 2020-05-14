const userBD = require('./../accessBd/userBD')
const userMgr = new userBD()

module.exports = class Login{

  constructor(ipcMain, switchPages){
    this.loginSpace = {
      ipcMain: ipcMain, // Receber dados do front
      switchPages: switchPages, // Enviar dados para switchPages
      nameSpace: switchPages.nameSpace // Objeto de objetos usado para persistencia de dados
    }
  };

  // Loga e informa ao Controler 'switchPages'
  #login = (user, pwd) => {
    // Pesquisa id no Db
    userMgr.login(user, pwd)
    .then((id) => {
      // Persiste o dado
      this.loginSpace.nameSpace.id_user = id
      // Avisa ao processo Main quem esta logado
      this.loginSpace.switchPages.emit('login')
      // Encerra a pagina
      this.switchPageOff()
    })
    .catch()
  };

  // Add um canal de comunicação unilateral do front para login.js
  #addListenner = () => {
    // Alias 
    let ipcMain = this.loginSpace.ipcMain

    // Login
    ipcMain.on('login_page_login', (event, args) => {
      const { user, pwd } = args
      this.#login(user, pwd)
    })

    // Register
    ipcMain.on('login_page_register', (event, args) => {
      const { user, pwd } = args
      // Add user no Bd
      userMgr.addUser(user, pwd)
      .then((id) => {
        this.#login(user, pwd)
      })
      .catch(()=>{
        console.log("Ja existe")
      })
    })

  };

  // Remove o canal de comunicação unilateral do front para login.js
  #removeListenner = () => {
    // Cria um alias 
    let ipcMain = this.loginSpace.ipcMain
    // Remove Listenes
    ipcMain.removeAllListeners('login_page_login')
    ipcMain.removeAllListeners('login_page_register')
  };

  // Carrega o front no BrowserWindow e cria os canais de comunicação
  switchPageOn = (viewPage) => {
    viewPage.loadFile('app/src/modules/login/front/index.html')
    this.#addListenner()
  };

  // Encerra  os canais de comunicação do front com BrowserWindow 
  switchPageOff = () => {
    this.#removeListenner()
  };

  
}