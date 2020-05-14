// Processo Main
const { ipcMain } = require('electron');
const EventEmitter = require('events');
const login = require('./login/login.js');
const juros = require('./juros/juros.js');
const google_auth = require('./googleAuth/googleAuth.js');


module.exports = class SwitchPages extends EventEmitter{
  constructor({view}){
    super()
    this.view = view
    // Estado
    this.nameSpace = {
      id_user: 0,
      oAuth2Client: null
    }
    // Carrega todas as paginas
    this.#loadPageModules();
    this.#addListenner();
  }

  // Carrega todos os modulos do front
  #loadPageModules = () => {
    this.page_login = new login(ipcMain, this);
    this.page_juros = new juros(ipcMain, this);
    this.page_google_auth = new google_auth(ipcMain, this);
    // Mostra a Pagina de Login
    this.page_login.switchPageOn(this.view);
  };

  // Cria um canal de comunicação entre Controller e os Page Modules
  #addListenner = () => {

    // Quando é logado no App
    this.on('login', () => {
      // Encerra a comunicação da Pagina
      this.page_login.switchPageOff(this.view);
      // Verifica qual a proxima pagina
      this.page_google_auth.hasAuthorization(this.nameSpace) 
      .then((q)=>{
        console.log(q)
        //Carrega a proxima pagina
        this.page_juros.switchPageOn(this.view);
      })
      .catch(()=>{
        //Carrega a proxima pagina
        this.page_google_auth.switchPageOn(this.view);
      })
        
      
      
    })

    // Quando é dada permissão para o App
    this.on('auth', () => {
      //Encerra a comunicação da Pagina
      this.page_google_auth.switchPageOff(this.nameSpace);
      //Carrega a proxima pagina
      this.page_juros.switchPageOn(this.view);
    })

  };

}

