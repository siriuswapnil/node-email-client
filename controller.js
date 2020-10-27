var express = require('express');
var app = express();
var fs = require('fs');
var fetch = require('node-fetch');
app.use(express.json({ limit: "1mb" }));
var readline = require('readline-sync');


/* 
Scopes determine the level of access we need from the API, while keeping the user in charge of permissions. As a general rule, keep the scopes as limited as possible in alignment to your functionality. Here, we need the ability to send email, hence the foloowing scope is declared globally.
*/

const SCOPE = "https://www.googleapis.com/auth/gmail.compose";

/*
The generateAuthCodeURL module provides the URL for authorizing the application from Google to access user data. The Auth URL returns an authorization key that in turn can be exchanged for an access token to perform requests to the Gmail API.
*/
exports.generateAuthCodeURL = (req, res) => {

    /*
     Get the client application credentials from the credentials.json file. This file can be downloaded from the Google Developer Console, selecting the required API( Gmail in this case). The credentials.json file contains important information like the client_id, client_secret and the redirect_uris. These should be kept in a secure location.
    */
    var credentials = fs.readFileSync('credentials.json', "utf-8");

    // Parsing the file contents into readable JSON
    credentials = JSON.parse(credentials);

    const client_id = credentials.web.client_id;
    const redirect_uri = credentials.web.redirect_uris[0];
    
    //Constructing the Authorization URL with the unique credentials 
    var authURL = "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=" + client_id +
        "&scope=" + SCOPE +
        "&access_type=" + "offline" +
        "&redirect_uri=" + redirect_uri +
        "&response_type=" + "code";
    
    // Redirecting to the Authorization URL for requesting user permission
    res.redirect(authURL);
}

/*
The module below receives the Authorization key (subject to user's permission) and redirects to another URL for exchanging the authorization key for the Access Token and the Refresh Token. A valid access token ensures authorization is approved, and that the client application can access the API with the approved credentials. The Refresh Token is used to reauthorize the application, in case the access token is expired, which it does after some duration.  
*/

exports.completeAuth = (req,res) => {

    // Get Authorization key from the request-body
    var AUTH_CODE = req.query.code;

    // Reading credentials.json contents again for client_id, client_secret etc. This process can be optimized. Read Issues on Github
    var credentials = fs.readFileSync('credentials.json', "utf-8");
    credentials = JSON.parse(credentials);

    const client_id = credentials.web.client_id;
    const client_secret = credentials.web.client_secret;
    const redirect_uri = credentials.web.redirect_uris[0];

    // Generating URL for exchanging auth. key with access token
    var postDataUrl = 'https://oauth2.googleapis.com/token?' +
        'code=' + AUTH_CODE +  //auth code received from the previous call
        '&client_id=' + client_id +
        '&client_secret=' + client_secret +
        '&redirect_uri=' + redirect_uri +
        '&grant_type=' + "authorization_code"

    // Making POST request to potDataURL and receiving the access token and refresh token
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

        // Saving the secret user's credentials into a private file. Currently using writeFileSync to perform synchronous action. Can be optimized using writeFile() which is Async in nature
        const tokenString = JSON.stringify(token, null, 2);
        fs.writeFileSync('./token.json', tokenString);
    });

    // Send the following message is everything went well
    res.send("Authorization Complete. Redirect to /send and enter details in console to send email");
    
}

/*
The send Mail module enables to send the email to the requested email address, subject to the condition that the authorization process is complete. In case it is not, the user gets redirected to base route('/'). First the user is asked for the receiver's address, message subject and message body, using the console. We use readline-sync package for taking user input. 
*/
exports.sendMail = (req,res) => {
    
    
    // Taking input using the readline-sync package and saving them to a variable
    var toAddress = readline.question("Enter Receiver Email");
    var emailSubject = readline.question("Enter Email Subject");
    var emailMessage = readline.question("Enter Email Message");
    


    var access_token = null;

    // Reading previously stored access token from file, token.json. If the file does not exist, or error reading, redirect to API home route
    try {
        token = fs.readFileSync("./token.json");
        token = JSON.parse(token);
        access_token = token.ACCESS_TOKEN;
      } catch (err) {
        console.log("Error reading Access Token. Try Auth again.-",err);

        // Redirecting to home route in case of failure to fetch token file
        res.redirect('/');
      }

      // Check if token file is valid. Can be optimised. See Issue on Github
      if(access_token){
            /*
            Getting From Address from Gmail API calling the User Profile route.
            */


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

        //Route for sending email
        const API_URL = `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;

        /*
         Generating message thread and converting to Base64 encoding
        */

        var mail = new Buffer.from(
            "Content-Type: text/plain; charset=\"UTF-8\"\n" + 
            "MIME-Version: 1.0\n" +
            "Content-Transfer-Encoding: 7bit\n" + 
            `To: ${toAddress}\n` +
            `From: ${fromAddress}\n` +
            `Subject: ${emailSubject}\n\n` +
        
            `${emailMessage}`
        ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

        // POST Request to API_URL to send email
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
        // If email sent successfully, navigate to /send-success route
        res.redirect("/send-success");
    }
    else{
        res.send("Access Token not found. Complete Authorization by redirecting to /auth");
    }
}

// Success redirect and message
exports.sendSuccess = (req,res) => {
        res.send("Mail sent! Check Inbox!");
      };


