const path = require('path')
const sqlite3 = require('sqlite3')
//const dirDbs = __dirname + '/../../../db/'
const dirDbs = 'app/db/'
debug = false

module.exports = class Db {
  constructor () {};
  openDb (name) {
    return new sqlite3.Database(dirDbs + name, (err) => {
      if (err) {
        console.error('Erro Criação:' + err.message)
      } else {
        console.warn('Conexao estabelecida com ' + name);
      }
    })
  };

  closeDb (dataBase) {
    return new Promise((resolve, reject) => {
      return dataBase.close((err) => {
        if (err) {
          console.error(err.message)
          reject(false)
        } else {
          console.warn('Fecha a Conexão com o banco de dados')
          resolve(true)
        }
      })
    })
  };

 
  comandDb (dataBase, strCode) {
    if (debug) { console.warn(strCode) }
    return new Promise((resolve, reject) => {
      return dataBase.run(strCode, (err) => {
        if (err) {
          // console.error('Erro comando:'+err.message);
          reject(err)
        }
        resolve(true)
      })
    })
  };

  searchDb (dataBase, strCode, callBack) {
    if (debug) { console.warn(strCode) }
    return new Promise((resolve, reject) => {
      return dataBase.get(strCode, (err, instRow) => {
        if (err) {
          console.error('Erro pesquisas:' + err.message)
          reject(err.message)
        }
        resolve(instRow)
      })
    })
  };

  searchies (dataBase, strCode, callBack) {
    if (debug) { console.warn(strCode) }
    return new Promise((resolve, reject) => {
      dataBase.all(strCode, (err, instRows) => {
        if (err) {
          console.error('Erro pesquisas:' + err.message)
          reject(err.message)
        }
        resolve(instRows)
      })
    })
  };

  hasInjection (str) {
    // Informa se possui algum caracter invalido na string
    return (
      str.includes("'") ||
      str.includes('"') ||
      str.includes(';')
    )
  };
  
  hasInjections (args, reject) {
    // Verifica em todos os argumentos passados se possui sqlInjection
    args.forEach( (arg)=>{
        if( this.hasInjection(arg) ){
          try{
            reject('sqlInjection in ' + arg)
          } catch{
            return true
          }
        }
      return false
    })
  }
}
