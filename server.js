const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const validator = require('validator');

//#region  ############## CONFIG #####################################

var port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

var connection = mysql.createConnection({
    host: 'br480.hostgator.com.br',
    user: 'omccre77_omcprad',
    password: 'zxcv1357',
    database: 'omccre77_omcprado',
    //port: '3306'
    //ssl=true 
    //quando estiver em produção, e a hospedagem fornecer o certificado

});

connection.connect(function(err){
    if (err) {
        console.log('error conection: ' + err.stack);
        return;
    }
    console.log('Conected as ID: ' + connection.threadId);
});

//#endregion

//#region ################### GET ####################################
app.get('/', function (req, res){
    console.log('Passando no: Entrando no GET/ ');
    res.send('Welcome!');
});

app.get('/login/:email/:password', function (req, res){
    console.log('Passando no: Entrando no GET/LOGIN ');

    var erro = false;

    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    var login_temp = {};
    login_temp.email = req.params.email;
    login_temp.password = req.params.password;

    var status_code = 200;
    var msg_text = ""; 

    console.log(login_temp);
    console.log('TAG OLAVO 1 ');
    if (!validator.isEmail(login_temp.email)) {
        console.log('Passando no: Login > Validação de Formato de E-mail');
        status_code = 400;
        msg_text = "E-mail em formato inválido!"; 
        erro = true;

    }
    console.log('TAG OLAVO 2 ');
    if (erro == false) {
        //Consulta no banco de dados
        //SELECT
        console.log('TAG OLAVO 3 ');
        login_select(login_temp).then((result) => {

            console.log('Passando no Login_select.then() ');
            //Caso não retorno dados compativeis com email e senha
            if (parseInt(result.length) == 0) {
                console.log('Passando no Login_select.then() > Verifica resultado == 0');
                status_code = 400;
                msg_text = 'Login ou senha incorretos, verifique e tente novamente! ';
            }

            if (parseInt(result.length) > 1) {
                console.log('Passando no Login_select.then() > Verifica resultado > 1');
                status_code = 400;
                msg_text = 'Existe um problema com seus dados, entre em contato! ';
            }

            // Carregandoi o objeto de resposta
            msg_res.status = status_code;
            msg_res.message = msg_text;
            //Retorno mensagem com status e mensagem
            res.status(msg_res.status).json(msg_res);



        }).catch((err) => {

            console.log('Passando no: Login > Login_select.catch()' );
            if (err) {
                msg_res.status  = err.status_code;
                msg_res.message = err.msg_text;
            }else{
                msg_res.status  = 500;
                msg_res.message = 'Não é possivel realizar a ação, tente novamente em breve! ';  
            }
            console.log('--->> Login - catch - Erro: ' + msg_res.message );
            //Retorno mensagem com status e mensagem
            res.status(msg_res.status).json(msg_res);



        });
    }else{
        msg_res.status = status_code;
        msg_res.message = msg_text;
    
        res.status(msg_res.status).json(msg_res);
    
    }
});
//#endregion

//#region ################### POST ##################################
app.post('/register', function (req, res){
    console.log('Passando no: Entrando no POST/REGISTER ');

    var erro = false;

    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    //msg_res.status = 400;
    //msg_res.message = "Erro ao logar...";

    var register_temp = {};
    register_temp = req.body;

    var status_code = 200;
    var msg_text = ""; 

    console.log(register_temp);

    if (!validator.isEmail(register_temp.email)) {
        console.log('Passando no: Login > Validação de Formato de E-mail');
        status_code = 400;
        msg_text = "E-mail em formato inválido!"; 
        erro = true;
    }

    if (erro == false) {
        //Consulta no banco de dados
        register_select(register_temp).then((result) => {
            //Verifica se ja existe e-mail cadastrado
            if (result.length > 0) {
                console.log('Passando no: regiter_select.then() > verifica resultadop > 0 ');
                status_code = 400;
                msg_text = 'Ja existe um cadastro para este email.';
                msg_res.status = status_code;
                msg_res.message = msg_text;

                // retorno da mensagem
                res.status(msg_res.status).json(msg_res);
            } else {
                // se não existir faz a inclusão
                register_insert(register_temp).then((result2) => {
                    console.log('Passando no: Register > register_insert.Then() ');
                    msg_res.status = status_code;
                    msg_res.message = msg_text;

                    // retorno da mensagem
                    res.status(msg_res.status).json(msg_res);

                }).catch((err2) => {
                    console.log('Passando no register > register_insert.catch() ');
                    msg_res.status = err2.status_code;
                    msg_res.message = err2.msg_text;
                    console.log('Register INSERT - catch - Erro: ' + msg_res.message);
                    // retorno da mensagem
                    res.status(msg_res.status).json(msg_res);
                });
            }


        }).catch((err) => {
            console.log('Passando no register > register -> register_select.catch()');
            if (err.status_code) {
                msg_res.status = err.status_code;
                msg_res.message = err.msg_text;


            }else{
                msg_res.status = 500;
                msg_res.message = '---->>>> Register -0 register_select - catch = erro no Then disparou a catch.... ';
                
            }
            console.log('Register Select - select - catch - Erro: ' + msg_res.message);

            res.status(msg_res.status).json(msg_res);
        });




        }else {
        msg_res.status = status_code;
        msg_res.message = msg_text;

        res.status(msg_res.status).json(msg_res);
        }

});
//#endregion
 
//#region ################### FUNCTION ##############################

// LOGIN

function login_select(login_temp){

    return new Promise((resolve, reject) => {
        console.log(`SELECT * FROM login WHERE email = '${login_temp.email}' and password = '${login_temp.password}' `);

        connection.query(`SELECT * FROM login WHERE email = '${login_temp.email}' and password = '${login_temp.password}' `, function (err, results, field) {
            console.log('entro no comando');
            var obj_err = {};
            obj_err.msg_text = '......>>>>>> login_select - Não entrou no erro ainda ....';
            console.log(err);
            if (err) {
                console.log('ERRO: login_select dentro da PROMISE: ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('Dentro da Promise -> Selecionado: ' + results.length);
                resolve(results); 
            } 
  
        });

    });
}

//REGISTER

function register_select(register_temp){
    return new Promise((resolve, reject) => {
        console.log('Dentro da Promise ->');

        connection.query(`SELECT * FROM login WHERE email = '${register_temp.email}' `, function (err, results, field) {
            console.log('entro no comando');
            var obj_err = {};
            obj_err.msg_text = '......>>>>>> register_select - Não entrou no erro ainda ....';
            console.log(err);
            if (err) {
                console.log('ERRO: register_select dentro da PROMISE: ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('Dentro da Promise -> Selecionado: ' + results.length);
                resolve(results); 
            } 
  
        });

    });
}
function register_insert(register_temp){
    return new Promise((resolve, reject) => {
        console.log('Dentro da Promise ->');

        connection.query(`INSERT INTO login (email, password) VALUES ('${register_temp.email}', '${register_temp.password}' ) `, function (err, results, field) {
            console.log('entro no comando');
            var obj_err = {};
            obj_err.msg_text = '......>>>>>> register_insert - Não entrou no erro ainda ....';
            console.log(err);
            if (err) {
                console.log('ERRO: register_insert dentro da PROMISE: ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('Dentro da Promise -> Linhas Afetadas: ' + results.length + '|' + results.insertId);
                resolve(results); 
            } 
  
        });

    });
}


//#endregion

app.listen(port, () => {
    console.log(`Listering port ${port}`);
});

