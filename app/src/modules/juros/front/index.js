//DEFINE
const DEF_ANO = 0
const DEF_MES = 1
const DEF_DIA = 2

let nameSpace = {}

function valid(entrada,saida){
//Verifica se as Datas são validas
    //Ano Entrada > Saida?
    if( entrada[DEF_ANO] > saida[DEF_ANO] ){
        alert("Ano entrada invalido")
        return false
    }else{
        //Mes Entrada > Saida?
        if( entrada[DEF_MES] > saida[DEF_MES] ){
            if( entrada[DEF_ANO] == saida[DEF_ANO] ){//So da errado se o ano for igual
                alert("Mes entrada invalido")
                return false
            }
        }else{
            //Dia Entrada > Saida?
            if( entrada[DEF_DIA] > saida[DEF_DIA] ){
                if( entrada[DEF_ANO] == saida[DEF_ANO] ){//So da errado se o ano for igual
                    if( entrada[DEF_MES] == saida[DEF_MES] ){//So da errado se o mes for igual
                        alert("Dia entrada invalido")
                        return false
                    }
                }
            }
        }
    }
    return true
}


function totalDias(entrada,saida){       
//Verifica quantidade de dias corridos

    let dataEntrada = new Date((entrada[DEF_ANO]),(entrada[DEF_MES]-1),(entrada[DEF_DIA]),12,00);
    let dataSaida = new Date((saida[DEF_ANO]),(saida[DEF_MES]-1),(saida[DEF_DIA]),12,00);

    const seg = 1000
    const min = 60
    const hora = 60
    const dia = 24
    
    let totalDias = (new Date(dataSaida-dataEntrada).getTime()/seg/min/hora/dia) // Contabiliza o amior < o menor
    totalDias += 1;
           
    return (totalDias)
}

function juros(taxa, montante, dias){
//Calcula o valor dos juros de acordo com o montante os dias e a taxa
    taxaDEC = taxa/100
    lucroDiario = (montante*taxaDEC)/30
    lucroTotal = (lucroDiario*dias)
    return lucroTotal
}

function data2str(data){
//Converte o value do input em uma string dia/mes/ano
    return ""+data[DEF_DIA] +"/"+ data[DEF_MES] +"/"+ data[DEF_ANO]
}

function truc(valor){
//Trunca o valor para 2 casas decimais (referente aos centavos centavos)
    return(Math.trunc(valor * 100)/100)
}

function geraURL(vetParametros){
    url='whatsapp://send?text='
    url='https://web.whatsapp.com/send?text='
    for(const txt of vetParametros) {
        url += encodeURIComponent(txt);
        alert(url)
    }
    return url
}
function calcular(){
    //Pega Datas do input
    let entrada = document.getElementById("inp").value.split("-");
    let intEntrada = entrada.map(Number)
    let saida = document.getElementById("out").value.split("-");
    let intSaida = saida.map(Number)

    if(valid(intEntrada,intSaida)){
        let origen = document.getElementById("src").value;
        let valor = document.getElementById("val").value;
        let taxa = document.getElementById("per").value;
        let titular = document.getElementById("titular").value;
        let numero = document.getElementById("num").value;
        let banco = document.getElementById("bank").value;
        let dias = totalDias(entrada,saida);
        let jurosTotal = juros(taxa, valor, dias)
        
        let strEntrada = data2str(intEntrada)
        let strSaida = data2str(intSaida)

        print(origen,titular,numero,banco,valor,strEntrada,strSaida,taxa,dias,jurosTotal)
    }
}

function table(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total){
    return  ""+
    "<table class='table resultado'>"+
        "<tr><td >Origem:</td><td>"             +origen+        "</td></tr>"+
        "<tr><td >Titular:</td><td>"            +titular+       "</td></tr>"+
        "<tr><td >Numero:</td><td>"             +numero+        "</td></tr>"+
        "<tr><td >Banco:</td><td>"              +banco+         "</td></tr>"+
        "<tr><td >Valor:</td><td>R$"            +valor+         "</td></tr>"+
        "<tr><td >Entrada:</td><td>"            +entrada+       "</td></tr>"+
        "<tr><td >Saida:</td><td>"              +saida+          "</td></tr>"+   
        "<tr><td >Taxa:</td><td>"               +taxa+          "%</td></tr>"+
        "<tr><td >Tempo:</td><td>"              +dias+          "dias</td></tr>"+
        "<tr><td >Juros:</td><td>R$"            +juros+         "</td></tr>"+
        "<tr><td >Repasse:</td><td>R$"          +repasse+       "</td></tr>"+
        "<tr><td >Total:</td><td>R$"            +total+         "</td></tr>"
    "</table>"
}

function json(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total){
    return `{
        "Origem":    "${origen}",
        "Titular":   "${titular}",
        "Numero":    "${numero}",
        "Banco":     "${banco}",
        "Valor":     "${valor}",
        "Entrada":   "${entrada}",
        "Saida":     "${saida}",
        "Taxa":      "${taxa}",
        "Tempo":     "${dias}",
        "Juros":     "${juros}",
        "Repassar":  "${repasse}",
        "Total":     "${total}"   
    }`
}

function txt(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total){
    return ""+
    "Origem:"       +origen+        "\n"+
    "Titular:"      +titular+       "\n"+
    "Numero:"       +numero+        "\n"+
    "Banco:"        +banco+         "\n"+
    "Valor:R$"      +valor+         "\n"+
    "Entrada:"      +entrada+    "\n"+
    "Saida:"        +saida+      "\n"+
    "Taxa:"         +taxa+          "%\n"+
    "Tempo:"        +dias+          "dias\n"+
    "Juros:R$"      +juros+         "\n"+
    "Repasse:R$"    +repasse+       "\n"+
    "Total:R$"      +total+         "\n"
}

function print(origen,titular,numero,banco,valor,entrada,saida,taxa,dias,juros){
    
    //Reescreve a pagina
    valor = truc(parseFloat(valor))
    juros = truc(parseFloat(juros))
    repasse = valor - juros
    total = juros+valor

    let strJSON = json(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total);
    nameSpace = JSON.parse(strJSON);
        
    let TABLE = table(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total);
    //let JSON = json(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total);
    //let TXT = txt(origen, titular, numero, banco, valor, entrada, saida, taxa, dias, juros, repasse, total);
        
    //Troca a tabela
    let content = document.getElementById("content")
    content.innerHTML = TABLE

    //Torna os buttoes Visiveis
    let buttons = document.getElementById("buttons")
    buttons.removeAttribute('hidden');
}



//Cria Evento Para os buttons
let calc = document.getElementById("calcular");
calc.addEventListener('click',calcular);

//Coloca IPC
const {ipcRenderer} = require("electron");

const register = document.getElementById("register");
register.addEventListener('click', ()=>{

    let descricao = `No dia ${nameSpace['Entrada']} houve um cheque ${nameSpace['Numero']} do ${nameSpace['Banco']} repassado por ${nameSpace['Origen']} sendo o titular ${nameSpace['Titular']} para retirada em ${nameSpace['Saida']}`
    console.log()
    let saida = nameSpace['Saida'].split('/')
    let args={
        'nomeEvento':   'Cheque',
        'descricao':    descricao,
        'dia':  saida[0],
        'mes':  saida[1],
        'ano':  saida[2]
    }
    ipcRenderer.send("juros_register_calendar",args);
    // Recarrega a pagina
    window.location.reload(1)
});