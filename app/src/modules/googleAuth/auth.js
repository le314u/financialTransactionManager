const { google } = require('googleapis')// Api do Google
const fs = require('fs');//Ler arquivos do Sistema

const userBD = require('../accessBd/userBD.js')// Comunicação com Bd tabela User
const userMgr = new userBD()

// Para escolher um escopo verificar o link : https://developers.google.com/calendar/auth
const SCOPES = [ 'https://www.googleapis.com/auth/calendar' ]
const FILE_CREDENTIALS = 'credentials.json'

module.exports = class Auth{
  constructor(){ 
    this.authSpace = {
      credentialsJSON: null,
      oAuth2Client: null,
      url: ''
    }

    //Le as Credentiais do App
    this.#getCredentials()
    .then(()=>{
      //Prepara o cliente oAuth2 
      this.#createClienteOauth2()
    }).catch()

  };

  // Retorna um JSON com as credenciais // Lida de um arquivo
  #getCredentials = () => {
    return new Promise( (resolve, reject) => {
      //Le o Arquivo e retorna JSON com as credenciais
      fs.readFile('app/src/modules/googleAuth/'+FILE_CREDENTIALS, (err, content) => {
        if (err) {
          console.error('Erro ao carregar o arquivo de credenciais do cliente',err);
          reject(err);
        } else {
          // Transforma o conteudo do arquivo em um Objeto JSON
          let credentialsJSON = JSON.parse(content)
          // Transforma a credencial em um atributo da classe
          this.authSpace.credentialsJSON = credentialsJSON
          resolve(credentialsJSON);
        }
      });
    })
  };

  // Prepara um cliente oAuth2 
  #createClienteOauth2 = () => {
    // cria o cliente oAuth2
    let { client_secret, client_id, redirect_uris } = this.authSpace.credentialsJSON.installed
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )
    // Seta a url de geração de codigo
    this.authSpace.url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
    // Configurando autenticação global
    google.options({
      auth: oAuth2Client
    });
    this.authSpace.oAuth2Client = oAuth2Client
    return oAuth2Client
  };

  // Cria um token de acordo com o codigo de Autorização
  #createTokenAuth = (code) => {
    //Cria um token de autentificação
    return new Promise( (resolve, reject) => {
      this.authSpace.oAuth2Client.getToken(code, (err, tokenJSON) => {
        if (err) {
          console.error('Erro no token de autorização:', err)
          reject(false)
        } else {
          // Retorna o Token de autorização
          resolve(tokenJSON)
        }
      })
    })
  }

  //Salva o Token Refresh no Bd
  #persisteToken = (id_user, strCode) => {
    // Armazena o token_refresh no Bd 
    userMgr.addToken(id_user, strCode)
  };
  
  // Retorna o token de atualização do $id_user
  #getTokenRefresh = (id_user) => {
    return new Promise((resolve, reject) => {
      // Verifica se existe um token Salvo
      userMgr.getToken(id_user)
      .then((token)=>{
        if(token !== userBD.NOT_TOKEN){
          resolve(token)
        } else {
          reject(false)
        }
      }).catch(reject)
    })
  };

  // Seta o Token no cliente oAuth2
  #setToken = (token_refresh) => {
    // Seta as credenciais no cliente oAuth2Cliente
    return this.authSpace.oAuth2Client.setCredentials ({ 
      refresh_token : token_refresh
    })
  };
  
  // Salva o token de autualização no bd
  saveAuthorizationCode = (code, nameSpace) => {
    return new Promise( (resolve, reject) => {
      // Cria um token de acordo com o codigo
      this.#createTokenAuth(code)
      .then(({refresh_token})=>{
        // Persiste o Token no BD
        this.#persisteToken(nameSpace.id_user, refresh_token)
        resolve(true)
      }).catch(reject)
    })
  };

  // Retorna uma url para authenticar
  getURL = () => {
    return this.authSpace.url
  };


  // Retorna clienteAuth2 com authorização
  authorization = (nameSpace) => {
    return new Promise( (resolve, reject) => {
      // Pega o toke de atualização do $id_user
      this.#getTokenRefresh(nameSpace.id_user)
      .then( (token) => {
        return this.#setToken(token)
      })
      .then( (token_refresh) => {
        resolve(this.authSpace.oAuth2Client)
      })
      .catch( reject )
    })

  };


}