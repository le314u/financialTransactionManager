const { ipcRenderer } = require('electron')

// Pega os dados preenchidos na pagina
function getArgs () {
  return {
    user: document.getElementById('email').value,
    pwd: document.getElementById('pwd').value
  }
}

// Ao clicar no #login envia dados para processMain
const login = document.getElementById('login')
login.addEventListener('click', () => {
  ipcRenderer.send('login_page_login', getArgs())
})

// Ao clicar no #register envia dados para processMain
const register = document.getElementById('register')
register.addEventListener('click', () => {
  ipcRenderer.send('login_page_register', getArgs())
})
