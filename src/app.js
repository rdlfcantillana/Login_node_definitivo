console.log("Up and Running!");
const express = require('express')
const router = require('../routes/routes.js')
const app = express()
app.use(express.urlencoded({ extended: false}));
app.use(express.static("public"));
app.use( '/',router)
const port = 3000;
//const Routes = require('./routes')(app); // Pass the app instance to routes
app.set('trust proxy', 1) 
app.set("view engine", "ejs");
 



const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

