const { RSA_X931_PADDING } = require('constants');
var express = require('express');
var app = express();
var fs = require('fs');
const { get } = require('http');
var fetch = require('node-fetch');
app.use(express.json({ limit: "1mb" }));
var readline = require('readline-sync');




const SCOPE = "https://www.googleapis.com/auth/gmail.compose";

exports.generateAuthCodeURL = (req, res) => {
    var credentials = fs.readFileSync('credentials.json', "utf-8");
    credentials = JSON.parse(credentials);

    const client_id = credentials.web.client_id;
    //const client_secret = credentials.web.client_secret;
    const redirect_uri = credentials.web.redirect_uris[0];
    var authURL = "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=" + client_id +
        "&scope=" + SCOPE +
        "&access_type=" + "offline" +
        "&redirect_uri=" + redirect_uri +
        "&response_type=" + "code";

    res.redirect(authURL);
}

exports.completeAuth = (req,res) => {
    var AUTH_CODE = req.query.code;
    var credentials = fs.readFileSync('credentials.json', "utf-8");
    credentials = JSON.parse(credentials);

    const client_id = credentials.web.client_id;
    const client_secret = credentials.web.client_secret;
    const redirect_uri = credentials.web.redirect_uris[0];
    var postDataUrl = 'https://oauth2.googleapis.com/token?' +
        'code=' + AUTH_CODE +  //auth code received from the previous call
        '&client_id=' + client_id +
        '&client_secret=' + client_secret +
        '&redirect_uri=' + redirect_uri +
        '&grant_type=' + "authorization_code"

    fetch(postDataUrl, {
        method: 'POST'
    })
    .then(data => data.json())
    .then(val => {

        var token = {
            "ACCESS_TOKEN": val.access_token,
            "REFRESH_TOKEN": val.refresh_token,
            "status": 200   
        };

        const tokenString = JSON.stringify(token, null, 2);
        fs.writeFileSync('./token.json', tokenString);
    });

    res.send("Authorization Complete. Redirect to /send with POST Request to send email");
    
}

exports.sendMail = (req,res) => {
    
    var toAddress = readline.question("Enter Receiver Email");
    var emailSubject = readline.question("Enter Email Subject");
    var emailMessage = readline.question("Enter Email Message");
    


    var access_token = null;
    try {
        token = fs.readFileSync("./token.json");
        token = JSON.parse(token);
        access_token = token.ACCESS_TOKEN;
      } catch (err) {
        console.log("Error reading Access Token. Try Auth again.-",err);
        res.redirect('/');
      }
      if(access_token){
            //getting From Address
        var fromAddress = function() {
            getaddressURL = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
            fetch(getaddressURL, {
                method : 'POST',
            headers: {
                "Authorization": "Bearer "+ access_token,
                "Content-Type" : "application/json"
            }
            })
            .then(res => res.json())
            .then(data => {
                return data.emailAddress;
            });
                
        }
        const API_URL = `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;
        var mail = new Buffer.from(
            "Content-Type: text/plain; charset=\"UTF-8\"\n" + 
            "MIME-Version: 1.0\n" +
            "Content-Transfer-Encoding: 7bit\n" + 
            `To: ${toAddress}\n` +
            `From: ${fromAddress}\n` +
            `Subject: ${emailSubject}\n\n` +
        
            `${emailMessage}`
        ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

        
        fetch(API_URL, {
            method : 'POST',
            headers: {
                "Authorization": "Bearer "+ access_token,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "raw": mail
            })
        })
        .then(res => res.json())
        .then(data => console.log(data));

        res.redirect("/send-success");
    }
    else{
        res.send("Access Token not found. Complete Authorization by redirecting to /auth");
    }
      

}





