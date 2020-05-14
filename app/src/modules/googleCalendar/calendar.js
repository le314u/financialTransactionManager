const flagsCalendarApi = require('./calendarApi')

module.exports = function createEvent (nomeEvento, descricao, dia, mes, ano) {
  // Pega o Id do Calendario
  flagsCalendarApi.getIdCalendar()
    .then(() => {
    // Cria um evento no calendario
      flagsCalendarApi.createEvent(nomeEvento, descricao, dia, mes, ano)
    })
}
