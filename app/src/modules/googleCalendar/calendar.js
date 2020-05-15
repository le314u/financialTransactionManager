const { google } = require('googleapis')
const calendarName = 'Financial Transaction Manager'

module.exports = class Calendar{
  constructor(nameSpace){
    this.nameSpace = nameSpace
    this.drive = null
  };

  #createDrive = () => {
    this.drive = google.calendar({ version: 'v3'})
  }
  #getDrive = () => {
    if(this.drive == null){
      this.#createDrive()
    }
    return this.drive
  }
  
  // Recebe uma lista com 250 calendarios
  #getCalendars = () => {
    // Instancia o Api do Google calendar
    const calendar = this.#getDrive()
    return new Promise((resolve, reject) => {
      // Request
      calendar.calendarList.list({
        maxResults: 250
      }, (err, res) => {
        if (err) {
          console.error('The API returned an error:#getCalendars ' + err)
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  };

  // Trabalha com a resposta de um calendarList
  #searchIdCalendar = (request) => {
    // Processamento
    const calendarios = request.data.items
    let existCalendar = false
    // Verifica se existe um calendario chamado Cheque
    calendarios.forEach((calendario) => {
      if (calendario.summary == calendarName) {
        this.nameSpace.idCalendar = calendario.id
        existCalendar = true
      }
    })
    return existCalendar
  };

  // Cria uma string de Data aceita pelo google Calendar
  #data = (dia, mes, ano, hora) => {
    const strData = new Date(ano, mes - 1, dia, hora, 59, 59, 59).toISOString()
    return strData
  };

  // cria um calendario e retorna o id Dele
  #insertCalendar = () => {
    // Api do Google calendar
    const calendar = this.#getDrive()
    return new Promise((resolve, reject) => {
      // Request
      calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          timeZone: 'America/Sao_Paulo',
          location: 'Br',
          description: 'Calendario criado para armazenar eventos de movimentação financeira'
        }
      }, (err, res) => {
        if (err) {
          console.error('The API returned an error: #insertCalendar ' + err)
          reject(err)
        } else {
          this.nameSpace.idCalendar = res.data.id
          resolve( this.nameSpace.idCalendar )
        }
      })
    })
  };

  // Prepara a biblioteca para uso
  start = (nameSpace)=>{

    this.nameSpace = nameSpace
    this.#getCalendars()
    .then((request)=>{
      if( !this.#searchIdCalendar(request)){
        //Cria o Calendario se necessário
        this.#insertCalendar()
      }
    })
    .catch((err)=>{
      console.error("Erro ao iniciar")
      console.error(err)
    })
  }

  // Cria um evento no Calendario
  createEvent = (nome, descricao, dia, mes, ano) => {
    // Alias
    let idCalendar = this.nameSpace.idCalendar
    let clienteOauth2 = this.nameSpace.oAuth2Client
    // Api do Google calendar
    const calendar = google.calendar({ version: 'v3', clienteOauth2 })
    return new Promise((resolve, reject) => {
      // request
      calendar.events.insert({
        calendarId: idCalendar,
        requestBody: {
          anyCanAddSelf: false,
          // colorId:null,
          guestsCanInviteOthers: false,
          guestsCanModify: false,
          summary: nome,
          description: descricao,
          start: { dateTime: this.#data(dia, mes, ano, 22) },
          end: { dateTime: this.#data(dia, mes, ano, 23) }
        }
      }, (err, res) => {
        if (err) {
          console.error('The API returned an error:createEvent ' + err)
          // Loop Até ser aceito
          this.createEvent(nome, descricao, dia, mes, ano)
          //reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

}