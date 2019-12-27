//Este archivo se encarga de la parte de autenticacion del usuario y del dojo
const passport = require('passport'); //Solicitamos la dependencia passport
const EstrategiaLocal = require('passport-local').Strategy; //Y de ella sacamos el método para validación de forma local
const mongoose = require('mongoose'); //Mongoose para usar los comandos de la base de datos.
const Usuario = require('../models/usuarios'); //Requerimos el modelo de usuario
const Dojo = require('../models/dojos'); //Y de los dojos
const Admin = require('../models/administrator'); //Y de los admin

//Para los usuarios
passport.use(new EstrategiaLocal({ //Definimos una nueva estrategia de validacion
    usernameField : 'email' //Usamos el email como nombre de usuario
}, async(email, contraseña, done) => { //Declaramos un proceso asincrono
    const usuario = await Usuario.findOne({email : email}); //Donde buscamos un usuario con ese correo y lo guardamos en una variable
    if (!usuario || usuario.solvente == false){ //Si no existe
        return done(null, false, {message : 'Usuario no existe o insolvente'}); //Envia este mensaje, indagar acerca de null y false.
    } else{ //Pero si existe
        const compara = await usuario.matchPassword(contraseña); //Pasamos a comparar las contraseñas
        if(compara){ //si son iguales
            return done(null, usuario); //Pasamos
        } else { //Si no son iguales
            return done(null, false, {message : 'Contraseña incorrecta'}); //Enviar mensaje
        }
    }
}));

//Serializacion de usuario, toma un dato del usuario para poder registrar la sesion, en este caso es su id.
passport.serializeUser((usuario, done) => {
    done(null, usuario.id); 
});

//Deserializacion, proceso contrario.
passport.deserializeUser((id, done) => {
    usuario.findById(id, (err, usuario) => {
        done(err, usuario);
    });
});

//---------------------------------------------------------------------------------------------------

//Para los dojos, más o menos lo mismo.
passport.use(new EstrategiaLocal({ 
    usernameField : 'email'
}, async(email, dojoPassword, done) => { 
    const dojo = await Dojo.findOne({email : email}); 
    if (!dojo || dojo.solvente == false || dojo.activo == false){ //Aqui esta la principal diferencia, si el dojo no existe o su status de solvencia o su acceso es falso, es decir que no ha sido validado aun o fue considerado insolvente
        return done(null, false, {message : 'Dojo no registrado, insolvente o no validado'}); 
    } else { 
        const compara = await dojo.matchPassword(dojoPassword); 
        if(compara){ 
            return done(null, dojo); 
        } else { 
            return done(null, false, {message : 'Contraseña incorrecta'}); 
        }
    }
}));

//Serializacion de dojo, repasar
passport.serializeUser((dojo, done) => {
    done(null, dojo.id); 
});

//Deserializacion
passport.deserializeUser((id, done) => {
    usuario.findById(id, (err, dojo) => {
        done(err, dojo);
    });
});

//----------------------------------------------------------------------------------------------------
//Para los Admin.
passport.use(new EstrategiaLocal({ 
    usernameField : 'correo'
}, async(correo, password, done) => { 
    const admin = await Admin.findOne({correo : correo}); 
    if (!admin){ 
        return done(null, false, {message : 'Perfil de administrador no existe'}); 
    } else { 
        const compara = await Admin.matchPassword(password); 
        if(compara){ 
            return done(null, Admin); 
        } else { 
            return done(null, false, {message : 'Contraseña incorrecta'}); 
        }
    }
}));

//Serializacion de admin
passport.serializeUser((Admin, done) => {
    done(null, Admin.id); 
});

//Deserializacion
passport.deserializeUser((id, done) => {
    usuario.findById(id, (err, Admin) => {
        done(err, Admin);
    });
});