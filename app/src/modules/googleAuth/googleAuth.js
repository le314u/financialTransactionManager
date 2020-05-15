const googleAuth = require('./auth.js')
const auth = new googleAuth()

module.exports = class Login{

  constructor(ipcMain, switchPages){
    this.authSpace = {
      ipcMain: ipcMain, // Receber dados do front
      switchPages: switchPages, // Enviar dados para switchPages
      nameSpace: switchPages.nameSpace // Objeto de objetos usado para persistencia de dados
    }
  };

  // Add um canal de comunicação unilateral do front para googleAuth.js
  #addListenner = () => {
    // Alias 
    let ipcMain = this.authSpace.ipcMain
    let switchPages = this.authSpace.switchPages
    let nameSpace = this.authSpace.nameSpace
    // Seta Token de authentication
    ipcMain.on('googleAuth_setToken', (event, args) => {
      const { token } = args // código de autorização
      auth.saveAuthorizationCode(token, nameSpace)
      .then( ()=>{
        // Seta o token no cliente oAuth2
        return auth.authorization(nameSpace)
      })
      .then( ()=>{
        // Avisa ao controller que o cliente oAuth foi criado
        switchPages.emit('auth')
      })
      .catch()
    })
  };

  // Remove o canal de comunicação unilateral do front para googleAuth.js
  #removeListenner = () => {
    // Cria um alias 
    let ipcMain = this.authSpace.ipcMain
    // Remove Listeners
    ipcMain.removeAllListeners('googleAuth_setToken')
  };

  // Carrega o front no BrowserWindow e cria os canais de comunicação
  switchPageOn = (viewPage) => {
    // Carrega a pagina 
    viewPage.loadFile('app/src/modules/googleAuth/front/index.html')
    .then(()=>{
      // Envia o link para permitir acesso via google
      viewPage.webContents.send('url',auth.getURL())
    })
    this.#addListenner()
  };

  // Encerra  os canais de comunicação do front com BrowserWindow 
  switchPageOff = () => {
    this.#removeListenner()
  };

  // Retorna a autorização
  getAuthorization = (nameSpace) => {
    return new Promise((resolve, reject) => {
      auth.authorization(nameSpace)
      .then((cliente)=>{
        resolve(cliente)
      })
      .catch(()=>{
        reject(false)
      })
    })
  }
}