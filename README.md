# node-mailer-gmailAPI
Nodejs API to send email from a user's account with Gmail API without using client libraries


# About the Project
node-email-client is a Nodejs API that authenticates a user's profile through an OAuth 2.0 flow to send email through the user's Gmail This application makes use of the Gmail API without involving the nodejs-client-library, officially supported by Google.

# Setup Procedure and workflow

1. Clone the repository to your local machine. You need to have Node and NPM installed.
2. Generate Client Credentials - To use the client application, the *client_id*, *client_secret* and *resource_uri* needs to be generated. Head over to [https://console.developers.google.com/] , create a new project with Gmail API and download the credential file, with name **credentials.json**, in the same directory. 
3. To install the required packages, simply do `npm install` to download all the dependencies in the local folder.
4. Run the server with `node app.js`. The server will be live at http://localhost:4000.
5. To send email, the user needs to complete authentication. For that, navigate to /auth route. (http://localhost:4000/auth)
6. Once the authentication is complete, the user receives a success message that tells him to navigate to /send endpoint, which allows to send email for authenticated users.
7. Once the API receives a GET request to /send, a command line input stream is fired up, for the user to enter details for the Email message. During the process, the User's email ID is also requested from the Gmail API to be used as the FROM email in the email message.
8. Once the user enters the parameters, and if everything is approved, the user is redirected to the API root endpoint. The details of the email message is visible on the console.  

# API Design : 

The API is two major functions : 

1. ## User Authentication
2. ## Send Email

### User Authentication

The User authentication follows an OAuth 2.0 workflow. OAuth is an authentication protocol for applications to interact and authenticate users. "Login With Google" is a widely popular use of this mechanism. It is a two step process. First the client application receives an authentication code, subject to the user's permission. This authentication code is sent as a response, which in turn is exchanged for access tokens. These access token is the ultimate key to access the user's resources. Also, these access token have a lifetime, so for prolonged access, refresh tokens are needed. These access token is saved in a secret file in the application root directory, by the name token.json. This token file must be kept utmost securely, in the local machine.


### Sending Email

Once, we have the access key, it is sent alongside an HTTP Header in a POST request to a Gmail API endpoint. The body of the POST request contains the email message. The API requires the message body to be Base64 encoded in MIME format. Finally, if everything is approved, the message gets sent, and a JSON object containing metadata about the message is printed to the console. The user is redirected to the root endpoint for further action.

# References
 ### Gmail API Reference : [https://developers.google.com/gmail/api/reference/rest]
 ### OAuth 2.0 for Web Server Applications Guide : [https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1]
