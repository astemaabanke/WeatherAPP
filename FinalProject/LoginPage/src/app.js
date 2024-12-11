// import the express modules 
const express = require("express"); 

// imoport the path module 
const path = require("path");

// const import bcrypt which will help with password authentication when stroing the user password into the datase 

const bcrypt = require("bcrypt");

const app = express();

// define the directory where the ejs file will be found 
app.set("views", path.resolve(__dirname, "templates")); 

// ejs templates 

app.set("view engine", "ejs");


// Serve static files (CSS) from the 'CSSStyle' folder
app.use(express.static(path.join(__dirname, "../CSSStyle")));

// Check if static files are being served correctly
console.log('Serving static files from:', path.join(__dirname, '../CSSStyle'));

const port = 5010; 


       // THIS AREA CONTAINS DATABASE CONNECTIVITY INFORMATION 
// ------------------------------------------------------------------------------------
       //this will take care of using information passed in the .env file 
   require("dotenv").config({ path: path.resolve(__dirname, '../../credentials/.env') });

      // get the databse password for validation 
    const uri = process.env.MONGO_DB_PASSWORD;

    /* Our database and collection */
    const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
      // import the MongoDB node.js driver, a library used to connect to and interact with MongoDB databses
    const {MongoClient, ServerApiVersion} = require('mongodb'); 

   
   console.log(path.resolve(__dirname, '../../credentials/.env'));
// -----------------------------------------------------------------------------------------



// set the different routes where the request will be handles from the clinet 

// this will go straight to the home page 
app.get("/", (req, res) => {
  res.render("Login");
  
});

app.get("/login", (req, res) => {
  res.render("Login");
}); 

// route to redirect user to the sign up page 

app.get("/signup", (req, res) => {
  res.render("signup")
}); 


// this will handle the post method for the signup form 
// Import the moduel 
    const bodyParser = require("body-parser");
    /* Initializes request.body with post information */ 
    app.use(bodyParser.urlencoded({extended:false}));

app.post("/signup", async (req, res) => {

// create a new client 

// get the username, password from the form 

    let {username, password} = req.body;

    console.log(`username is ${username} password is ${password}`);


     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    
    try {

      await client.connect();
      
      // first check if the user already exits in the databse 

      const existingUser = await FindUser(client, databaseAndCollection, username); 
      if(existingUser){
        res.send("User already exits. Please choose another name");
      }else {
        // store the info to store in the database in an object 

        
        const userinfo = {username: username, password: password };
        // call the add a user function to add the use in the databse 

        await SignUpUser(client, databaseAndCollection, userinfo);
      }


    }catch (e){
      console.error(e);
    }finally {
      await client.close()
    }
    res.send("Signed up successful");
});


// this will handle the post request for the login form 
app.post("/login", async (req, res) =>{

   let {username, password} = req.body;

    console.log(`username is ${username} password is ${password}`);


     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    
    try {

      await client.connect();
      
      // first check if user in the databse

      const existingUser = await FindUser(client, databaseAndCollection, username); 
      if(!existingUser){
        res.send("username not found");
      }
      
     const passwordexit = await FindUserPassword(client, databaseAndCollection, password);

     if(!passwordexit){
      res.send("passowrd not found");
     }else {
      // if the password matches then 
      const CapitalName = username;
      res.render("home", {username: username});
     }
      
    }catch (e){
      console.error(e);
    }finally {
      await client.close()
    }




})


  // function thaat wiil allow a user to SignUp in the databse 
  async function SignUpUser(client, databaseAndCollection, userinfo){
     const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .insertOne(userinfo);
  }

// Function that will find a user in the database 

async function FindUser(client, databaseAndCollection, username){
  // username that we are trying to filter from the databse 
let filter = {username: username}; 
const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);

return result;


}


async function FindUserPassword(client, databaseAndCollection, password){
  // username that we are trying to filter from the databse 
let filter = {password: password}; 
const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);

return result;


}


app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
  console.log(path.resolve(__dirname, "templates"))
})