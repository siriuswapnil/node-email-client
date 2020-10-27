# node-mailer-gmailAPI
Nodejs API to send email from a user's account with Gmail API without using client libraries


# About the Project
node-mailer is a Nodejs API that authenticates a user's profile through an OAuth 2.0 flow to send email through the user's Gmail This application makes use of the Gmail API without involving the nodejs-client-library, officially supported by Google.

# Setup Procedure and workflow

1. Clone the repository to your local machine. You need to have Node and NPM installed.
2. To install the required packages, simply do `npm install` to download all the dependencies in the local folder.
3. Run the server with `node app.js`. The server will be live at http://localhost:4000.
4. To send email, the user needs to complete authentication. For that, navigate to /auth route. (http://localhost:4000/auth)
5. Once the authentication is complete, the user receives a success message that tells him to navigate to /send endpoint, which allows to send email for authenticated users.
6. Once the API receives a GET request to /send, a command line input stream is fired up, for the user to enter details for the Email message. During the process, the User's email ID is also requested from the Gmail API to be used as the FROM email in the email message.
7. Once the user enters the parameters, and if everything is approved, the user is redirected to the API root endpoint. The details of the email message is visible on the console. 
