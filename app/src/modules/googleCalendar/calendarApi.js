const { google } = require('googleapis')
const auth = require('./auth')
const calendarName = 'Financial Transaction Manager'

// Cria clienteOuath2
function clienteOuath2 () {
  return new Promise((resolve, reject) => {
    if (flags.clienteOauth2 == undefined) {
      auth().then((cOauth2) => {
        // Procura o Calendario
        flags.clienteOauth2 = cOauth2
        resolve(cOauth2)
      })
    } else {
      resolve(flags.clienteOauth2)
    }
  })
}

// Pega o idCalendar
function getIdCalendar () {
  return new Promise((resolve, reject) => {
    if (!flags.exist) {
      // Pega o ide
      clienteOuath2().then((cOauth2) => {
        return getCalendars(cOauth2)
      }).then((res) => {
        // Procura o calendario '$calendarName'
        return searchCalendar(res)
      }).then((exist) => {
        // Verifica se ja existe o calendary
        if (exist) {
          return flags.idCalendar
        } else {
          return insertCalendar(clienteOauth2)
        }
      }).then((idCalendar) => {
        // retorna o id do calendar
        flags.idCalendar = idCalendar
        resolve(idCalendar)
      })
    } else {
      // retorna o id do calendar
      resolve(flags.idCalendar)
    }
  })
}

// Recebe uma lista com 250 calendarios
function getCalendars (auth) {
  return new Promise((resolve, reject) => {
    // Api do Google calendar
    const calendar = google.calendar({ version: 'v3', auth })
    // request
    calendar.calendarList.list({
      maxResults: 250
    }, (err, res) => {
      if (err) {
        console.log('The API returned an error: ' + err)
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

// trabalha com a resposta de um calendarList
function searchCalendar (res) {
  // Processamento
  const calendarios = res.data.items
  // Verifica se existe um calendario chamado Cheque
  calendarios.forEach((calendario) => {
    if (calendario.summary == calendarName) {
      flags.exist = true
      flags.idCalendar = calendario.id
    }
  })
  return flags.exist
}

// cria um calendario e retorna o id Dele
function insertCalendar (auth) {
  return new Promise((resolve, reject) => {
    // Api do Google calendar
    const calendar = google.calendar({ version: 'v3', auth })
    // request
    calendar.calendars.insert({
      requestBody: {
        summary: calendarName,
        timeZone: 'America/Sao_Paulo',
        location: 'Br',
        description: 'Calendario criado para armazenar eventos de movimentação financeira'
      }
    }, (err, res) => {
      if (err) {
        console.log('The API returned an error: ' + err)
        reject(err)
      } else {
        flags.exist = true
        flags.idCalendar = res.data.id
        resolve(flags.idCalendar)
      }
    })
  })
}

function data (dia, mes, ano, hora, min, seg) {
  const strData = new Date(ano, mes - 1, dia, hora, min, seg, 0).toISOString()

  return strData
}

// Cria evento
function createEvent (nome, descricao, dia, mes, ano) {
  return new Promise((resolve, reject) => {
    getIdCalendar().then((idCalendar) => {
      const auth = flags.clienteOauth2
      // Api do Google calendar
      const calendar = google.calendar({ version: 'v3', auth })
      // request
      calendar.events.insert({
        calendarId: idCalendar,
        requestBody: {
          anyCanAddSelf: false,
          // colorId:null,
          guestsCanInviteOthers: false,
          guestsCanModify: false,
          start: { dateTime: data(dia, mes, ano, 23, 0, 0) },
          end: { dateTime: data(dia, mes, ano, 23, 59, 59) },
          summary: nome,
          description: descricao
        }
      }, (err, res) => {
        if (err) {
          console.log('The API returned an error: ' + err)
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  })
}

module.exports = flags = {
  // Atributos
  exist: false,
  clienteOauth2: undefined,
  idCalendar: undefined,
  // Metodos
  getIdCalendar: getIdCalendar,
  getClienteOuath2: clienteOuath2,
  createEvent: createEvent
}
