const express = require("express");
const app = express();
const ejs = require("ejs");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//Database

connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

//passando para o express usar o EJS como view Engine

app.set('view engine', 'ejs')
app.use(express.static('public'));

//Body parser

app.use(express.json());
app.use(express.urlencoded());

//Rotas
app.get("/",(req, res) =>{

    Pergunta.findAll({ raw: true, order:[
        ['titulo', 'ASC']
    ]}).then(perguntas =>{
        res.render('index', {
            perguntas: perguntas
        });
    })

})

app.get("/perguntar",(req, res) =>{
    res.render("perguntar");
})
 
app.post("/salvarpergunta", (req,res) =>{
    let {titulo, descricao} = req.body

    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() =>{ 
        res.redirect("/");
    });
})

app.get("/resposta/:id", (req,res) =>{
    var id = req.params.id;

    Pergunta.findOne({
        where: {id:id}
    }).then(pergunta =>{

        if(pergunta != undefined){

            Resposta.findAll({
                where: {perguntaId: pergunta.id,
                        isExcluded: 0}
            }).then(respostas =>{

                res.render("resposta", {
                    pergunta:pergunta,
                    respostas:respostas
                });

            })
        } else{

            alert = true
            res.redirect('/')
        }
        
    })
})

app.post("/salvarresposta", (req,res) =>{
    let {corpo, perguntaId, isExcluded} = req.body
    if(corpo != undefined){
        Resposta.create({
            corpo: corpo,
            perguntaId: perguntaId,
            isExcluded: 0
        }).then(() =>{ 
            res.redirect("/resposta/"+perguntaId);
        });
    }
     
})

app.post("/excluirresposta", (req,res) =>{
    let {id, perguntaId} = req.body
    Resposta.update(
        {isExcluded:1},
        {where:{id:id}}
    ).then(() =>{ 
        res.redirect("/resposta/"+perguntaId);
    });
})

app.listen(8000,()=>{console.log("App rodando!");})