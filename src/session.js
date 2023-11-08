const pool = require('./DBconfig.js')
const bcrypt = require('bcrypt');


//funciones middleware

const isRegistered = (username, password) =>{
 
  return new Promise(function(resolve, reject){
    pool.query(
      `SELECT * FROM users WHERE username = $1`, 
      [username], 
      (err, results)=>{
        if(err){
          throw err;
        }
        // console.log(results.rows);
  
        if(results.rows.length > 0){
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch)=>{
            if(err){
              throw err;
            }
            //  Dos posibles resultados
            //  Clave Correcta = true
            //  Clave Incorrecta = false
            resolve(isMatch);
          })
        }
        else{
          //Correo Incorrecto
          resolve(false);
        }
      }
    )
  })  
}

const isRegistered_admin = (adminname, password) =>{
 
  return new Promise(function(resolve, reject){
    pool.query(
      `SELECT * FROM admin WHERE adminname = $1`, 
      [adminname], 
      (err, results)=>{
        if(err){
          throw err;
        }
      
  
        if(results.rows.length > 0){
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch)=>{
            if(err){
              throw err;
            }
            //  Dos posibles resultados
            //  Clave Correcta = true
            //  Clave Incorrecta = false
            resolve(isMatch);
          })
        }
        else{
          //Correo Incorrecto
          resolve(false);
        }
      }
    )
  })  
}

function isAuthenticated (req, res, next) {
  if (req.session.user){
     next();
  } 
  else {
    let errors = [{message: "Tienes que Iniciar Sesion"}];
    res.render('login', {errors});
  }
}

function isNotAuthenticated(req, res, next){
  if(!req.session.user){
     next();
  }
  else{
    res.render('home', {user:req.session.user});
  }
}




module.exports = {
  isRegistered,
  isAuthenticated,
  isNotAuthenticated,
  isRegistered_admin
}