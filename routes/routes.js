const express = require('express');
const router = express.Router();
const session = require('express-session');
const pool = require('../src/DBconfig.js')
const { isRegistered, isAuthenticated, isNotAuthenticated,isRegistered_admin} = require('../src/session.js')
const bcrypt = require('bcrypt');
const bcrypt_n = 8;

router.use(session({
    secret: 'u93&KE33mhwO',
    resave: false,
    saveUninitialized: false
  }))

//RUTAS USUARIOS

  //ruta index
router.get('/index', (req, res) =>{
    res.render('index')
  });


  //ruta login
  router.get('/login', isNotAuthenticated, (req, res) => {
    let errors = undefined;
    res.render('login', {errors});
  })

  router.post('/login', async (req, res)=>{
    console.log("Login Happened!");
    let {username, password} = req.body;
  
    isRegistered(username, password).then(function(result){
      if(result){
        req.session.regenerate(function (err) {
          if (err) throw err;
  
          req.session.user = username;
  
          req.session.save(function (err) {
            if (err) throw err;
            res.redirect('/home');
          });
        });
      }
      else{
        errors = [{message:"Credenciales no Coinciden" }];
        res.render("login", {errors});
      }
    });
  
});


  //ruta register
  router.get('/register', isNotAuthenticated, (req, res) => {
    let errors = undefined;
    res.render('register', {errors});
  })


  router.post('/register', async (req, res)=>{
    console.log("Register Happened!");
    let {email, username, password, password2} = req.body;
    
    let errors = [];
  
    if(password != password2){
      errors.push({message: "Error: Contraseñas Diferentes"});
    }
    if(password.length < 8){
      errors.push({message: "Error: Contraseñas muy Pequeñas"});
    }
  
    if(errors.length > 0){
      res.render('register', {errors});
    }
  
    else{
      let hashedPassword = await bcrypt.hash(password, bcrypt_n);
      console.log(hashedPassword);
  
      pool.query(
        `SELECT * FROM users
        WHERE email = $1`, [email], 
        (err, results) =>{
          if(err){
            console.log("Mori aqui");
            throw err;
          }
          console.log(results.rows);
          if(results.rows.length > 0){
            errors.push({message:"Error: Correo ya utilizado"});
            res.render('register', {errors})
          }
          else{
            pool.query(`SELECT * FROM users
            WHERE username = $1`, [username], 
            (err, results) =>{
              if(err){
                console.log("Mori aqui");
                throw err;
              }
              console.log(results.rows);
              if(results.rows.length > 0){
                errors.push({message:"Error: Usuario ya utilizado"});
                res.render('register', {errors})
              }else{
                pool.query(
                  `INSERT INTO users (email, username, password)
                  VALUES ($1, $2, $3)
                  RETURNING id, password`, [email, username, hashedPassword], 
                  (err, result)=>{
                    if(err){
                      throw err;
                    }
                    console.log(result.rows);
                    let mensaje = [{message:"Felicitaciones, fuiste registrado"}]
  
                    res.render('login', {mensaje});
                  }
                )
              }
              
            })
          }
        }
      )
    }
  
});




  //ruta home
  router.get('/home', isAuthenticated, (req, res) => {
    res.render('home', {user:req.session.user});
  })
  
  //ruta logout
  router.get('/logout', isAuthenticated, function (req, res) {
    // log out exitoso
  
    // Eliminamos el usuario de nuestra sesión
    req.session.user = null
    console.log("Log Out Happened")
    req.session.save(function (err) {
      if (err) {
        // Manejar el error si es necesario
        console.error(err);
        res.status(500).send('Error interno del servidor');
      }
  
      // Regenerar la sesión, lo cual es una buena práctica para protegerse contra formas de fijación de sesión
      req.session.regenerate(function (err) {
        if (err) {
          // Manejar el error si es necesario
          console.error(err);
          res.status(500).send('Error interno del servidor');
        }
  
        res.redirect('/index');
      });
    });
  });
  
  
  

//ruta forgot password
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});


router.post('/forgot-password', async (req, res) => {
    let { email, newPassword } = req.body;
  
    pool.query(
      `SELECT * FROM users
      WHERE email = $1`, [email],
      async (err, results) => {
        if (err) {
          throw err;
        }
  
        if (results.rows.length > 0) {
          let hashedPassword = await bcrypt.hash(newPassword, bcrypt_n);
          console.log(hashedPassword);
  
          pool.query(
            `UPDATE users
            SET password = $1
            WHERE email = $2`, [hashedPassword, email],
            (err, result) => {
              if (err) {
                throw err;
              }
  
              res.render('forgot-password-success');
            }
          );
        } else {
          res.render('forgot-password', { error: 'El correo electrónico no está registrado' });
        }
      }
    );
});


//RUTAS PARA ADMINISTRADORES

//ruta home
router.get('/home-admin', isAuthenticated,  (req, res) => {
    res.render('home-admin', { admin: req.session.user });
});

//ruta register
router.get('/register-admin', isNotAuthenticated, (req, res) => {
    let errors = undefined;
    res.render('register-admin', { errors });
});


router.post('/register-admin', async (req, res) => {
    let { email, adminname, password, password2 } = req.body;
    let errors = [];
  
    if (password !== password2) {
      errors.push({ message: "Error: Contraseñas Diferentes" });
    }
    if (password.length < 8) {
      errors.push({ message: "Error: Contraseñas muy Pequeñas" });
    }
  
    if (errors.length > 0) {
      res.render('register-admin', { errors });
    } else {
      let hashedPassword = await bcrypt.hash(password, bcrypt_n);
  
      pool.query(
        'SELECT * FROM admin WHERE email = $1 OR adminname = $2',
        [email, adminname],
        (err, results) => {
          if (err) {
            console.log("Mori aquí");
            throw err;
          }
  
          if (results.rows.length > 0) {
            errors.push({ message: "Error: Correo o Usuario ya utilizados" });
            res.render('register-admin', { errors });
          } else {
            pool.query(
              'INSERT INTO admin (email, adminname, password) VALUES ($1, $2, $3) RETURNING id, password',
              [email, adminname, hashedPassword],
              (err, result) => {
                if (err) {
                  throw err;
                }
                console.log(result.rows);
                let mensaje = [{ message: "Felicitaciones, fuiste registrado como administrador" }];
                res.render('login-admin', { mensaje });
              }
            );
          }
        }
      );
    }
});


//ruta login
router.get('/login-admin', isNotAuthenticated, (req, res) => {
    let errors = undefined;
    res.render('login-admin', {errors});
});


router.post('/login-admin', async (req, res)=>{
    console.log("Login Happened!");
    let {adminname, password} = req.body;
  
    isRegistered_admin(adminname, password).then(function(result){
      if(result){
        req.session.regenerate(function (err) {
          if (err) throw err;
  
          req.session.user = adminname;
  
          req.session.save(function (err) {
            if (err) throw err;
            res.redirect('/home-admin');
          });
        });
      }
      else{
        errors = [{message:"Credenciales no Coinciden" }];
        res.render("login-admin", {errors});
      }
    });
});

//ruta forgot password
router.get('/forgot-password-admin', (req, res) => {
  res.render('forgot-password-admin');
});


router.post('/forgot-password-admin', async (req, res) => {
  let { email, newPassword } = req.body;

  pool.query(
    `SELECT * FROM admin
    WHERE email = $1`, [email],
    async (err, results) => {
      if (err) {
        throw err;
      }

      if (results.rows.length > 0) {
        let hashedPassword = await bcrypt.hash(newPassword, bcrypt_n);
        console.log(hashedPassword);

        pool.query(
          `UPDATE admin
          SET password = $1
          WHERE email = $2`, [hashedPassword, email],
          (err, result) => {
            if (err) {
              throw err;
            }

            res.render('forgot-password-success-admin');
          }
        );
      } else {
        res.render('forgot-password-admin', { error: 'El correo electrónico no está registrado' });
      }
    }
  );
});

module.exports = router;
