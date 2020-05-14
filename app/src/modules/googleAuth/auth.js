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
      oAuth2Client: null,
      credentials: null
    }
    this.#getCredentials().then(()=>{
      this.#createClienteOauth2()
    })
  };

  // Retorna um JSON com as credenciais
  #getCredentials = () => {
    return new Promise( (resolve, reject) => {
      //Le o Arquivo e retorna JSON com as credenciais
      fs.readFile('app/src/modules/googleAuth/'+FILE_CREDENTIALS, (err, content) => {
        if (err) {
          console.log('Erro ao carregar o arquivo de credenciais do cliente');
          console.log(err);
          reject(err);
        } else {
          //Transforma o conteudo do arquivo em um Objeto JSON
          let credentialsJSON = JSON.parse(content);
          this.authSpace.credentials = credentialsJSON;
          resolve(credentialsJSON);
        }
      });
    })
  };

  // Cria um cliente oAuth2 com as credenciais
  #createClienteOauth2 = () => {
    // Pega os 3 campos do objeto Json
    const { client_secret, client_id, redirect_uris } = this.authSpace.credentials.installed
    // Gera a autorização
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )
    
    this.authSpace.oAuth2Client = oAuth2Client;
    return oAuth2Client
  };

  // Cria um token de acordo com o codigo gerado
  #createTokenAuth = (code) => {
    //Alias
    let oAuth2Client = this.authSpace.oAuth2Client
    //Cria um token de autentificação
    return new Promise( (resolve, reject) => {
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Erro no token de acesso', err, '\n')
          reject(false)
        } else {
          resolve(token)
        }
      })
    })
  }

  #persistToken = (id_user, jsonToken) => {
    // Converte o Token em uma string
    const strToken = JSON.stringify(jsonToken)
    // Armazena o token no Bd 
    userMgr.addToken(id_user, strToken)
  };

  // Retorna o token de acesso
  #getToken = (id_user) => {
    return new Promise((resolve, reject) => {
      // Verifica se existe um token no BD
      userMgr.getToken(id_user)
      .then((token)=>{// Caso o token ja exista
        if(token.length > 2){
          // Converte string em JSON
          let jsonToken = JSON.parse(token)
          resolve(jsonToken)
        } else {
          reject(false)
        }
      }).catch(reject)
    })
  };

  #setToken = (jsonToken) => {
    //Alias
    let oAuth2Client = this.authSpace.oAuth2Client
    // Seta as credenciais no cliente oAuth2Cliente
    oAuth2Client.setCredentials(jsonToken)
    return oAuth2Client
  };

  // Retorna uma url para authenticar
  getURL = () => {
    //Alias
    let oAuth2Client = this.authSpace.oAuth2Client
    // Gera uma URL de autenticação
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
    return authUrl;
  };

  // Retorna clienteAuth2
  authorizationId_User = (nameSpace) => {
    return new Promise( (resolve, reject) => {
      // Verifica se existe um token salvo no Bd
      this.#getToken(nameSpace.id_user)
      .then( (jsonToken) => {
        return this.#setToken(jsonToken)
      })
      .then( (oAuth2Client) => {
        // Seta o oAuth2 client
        console.log(nameSpace)
        nameSpace.oAuth2Client = oAuth2Client
        resolve(true)
      })
      .catch(reject)
    })
  }

  // Retorna clienteAuth2
  authorizationCode = (code, nameSpace) => {
    return new Promise( (resolve, reject) => {
      // Cria um token de acordo com o codigo gerado
      this.#createTokenAuth(code) 
      .then( (tokenJSON) => {
        // Persiste o Token no BD
        this.#persistToken(nameSpace.id_user, tokenJSON )
        // Seta o Token
        return this.#setToken( tokenJSON )
      })
      .then( (oAuth2Client) => {
        // persiste o cliente oAuth2Client
        nameSpace.oAuth2Client = oAuth2Client
        resolve(true)
      })
      .catch(reject)
    })
  }

}