const { ipcRenderer } = require('electron')

// Pega os dados preenchidos na pagina
function getArgs () {
  return {
    token: document.getElementById('token').value,
  }
}

// Auth
// Ao clicar no #auth envia dados para processMain
const login = document.getElementById('auth')
login.addEventListener('click', () => {
  ipcRenderer.send('googleAuth_setToken', getArgs())
})

// Listenen para mostrar o url na tela
ipcRenderer.on('url', (event, strUrl) => {
  let url = document.getElementById('url')
  url.innerHTML = strUrl
})