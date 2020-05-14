const db = require('./mgrSql3')

const TABLE = {} // A global constant
TABLE.nameTable = 'user'
TABLE.id = 'id_user'
TABLE.user = 'user'
TABLE.pwd = 'pwd'
TABLE.token = 'token'
Object.freeze(TABLE)

module.exports = class User {
  constructor () {
    this.dbManager = new db()
    this.table = this.dbManager.openDb('user.db')
    this.init = false
    this.initPromise = this.initDb().then(() => {
      this.init = true
    }).catch(() => {
      // console.log("Tabela player ja existente ")
    })
  };

  initDb () {
    // Inicia um novo BD caso o arquivo.bd esteja corrompido
    return this.dbManager.comandDb(this.table, `
        CREATE TABLE ${TABLE.nameTable} (
            ${TABLE.id} INTEGER PRIMARY KEY,
            ${TABLE.user} TEXT NOT NULL UNIQUE,
            ${TABLE.pwd} TEXT NOT NULL,
            ${TABLE.token} TEXT
        );`)
  };

  addUser (user, pwd) {
    // Add o usuario ao Bd
    return new Promise((resolve, reject) => {
      //Verifica sqlInjection
      this.dbManager.hasInjections([user, pwd], reject)
      // Add o Player no Bd
      const code = `INSERT INTO ${TABLE.nameTable} (${TABLE.user}, ${TABLE.pwd}, ${TABLE.token}) VALUES ('${user}', '${pwd}', '');`
      this.dbManager.comandDb(this.table, code)
        .then((add) => {
          resolve(true)
        })
        .catch(reject)
    })
  };

  rmPlayer (user, pwd) {
    // Remove o usuario do Bd
    return new Promise((resolve, reject) => {
      //Verifica sqlInjection
      this.dbManager.hasInjections([user, pwd], reject)
      // Apaga o Player no Bd
      const code = `DELETE FROM ${TABLE.nameTable} WHERE ${TABLE.user} = '${user}' AND ${TABLE.pwd} = '${pwd}';`
      this.dbManager.comandDb(this.table, code)
        .then(() => {
          resolve(true)
        })
        .catch(reject)
    })
  };

  login (user, pwd) {
    // Pega o id caso os dados estejam certos
    return new Promise((resolve, reject) => {
      // Verifica sqlInjection
      this.dbManager.hasInjections([user, pwd], reject)
      // Procura o  Player no Bd
      const strCode = `SELECT ${TABLE.id} FROM ${TABLE.nameTable}  WHERE ${TABLE.user} = '${user}' AND ${TABLE.pwd} = '${pwd}';`
      this.dbManager.searchDb(this.table, strCode)
        .then((acc) => {
          if (acc === undefined) {
            reject(false)
          } else {
            resolve(acc[TABLE.id])
          }
        }).catch(reject)
    })
  };

  addToken (id, token) {
    console.log("MUITO CUIDADO COM SQL INJECTION PARA addToken de userBD")
    // Add token ao Bd
    return new Promise((resolve, reject) => {
      // Procura o Player no Bd
      const code = `UPDATE ${TABLE.nameTable} SET ${TABLE.token} = '${token}' WHERE ${TABLE.id} = ${id};`
      this.dbManager.comandDb(this.table, code)
        .then(() => {
          resolve(true)
        })
        .catch(reject)
    })
  };

  getToken (id) {
    // Pega o token caso os dados estejam certos
    return new Promise((resolve, reject) => {
      const strCode = `SELECT ${TABLE.token} FROM ${TABLE.nameTable}  WHERE ${TABLE.id} = ${id};`
      this.dbManager.searchDb(this.table, strCode)
        .then((token) => {
          if (token === undefined) {
            reject(false)
          } else {
            resolve(token[TABLE.token])
          }
        }).catch(reject)
    })
  };
}