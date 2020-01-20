//Aqui va toda la configuracion de las asignaciones. Creación, muestra, edición y eliminar.
//Solicitamos:
const router = require('express').Router(); //Enrutador

//Modelo de datos:
const asignacion = require('../models/asignaciones');

//Para autenticar. Se coloca entre el url y la palabra async de cada metodo
const { isAuthenticated } = require('../helpers/auth');

//Página para mostrar las asignaciones (pagina del admin)
router.get('/FVK/asignaciones', isAuthenticated, async (req, res) => {
    const asignaciones = await asignacion.find().sort({tipo : 'desc'}); //buscamos las asignaciones que existen, con y sin responsable
    res.render('admin/asignaciones', { asignaciones }); //Mostramos la vista con las asignaciones
})

//------------------------------------------------------------------------------------

//Para crear nuevas asignaciones
router.post('/asignaciones/nuevoequipo', isAuthenticated, async (req, res) => {
    const errors = []; //Lista de errores
    const {tipo, descripcion, responsable} = req.body; //Solicitamos del formulario los datos
    if(!tipo){ //Si no se escribe un tipo
        errors.push({text : 'Ingrese el tipo de equipo.'}); //Agregar esto a la lista para ser mostrado más adelante
    }
    if(!descripcion){ //Si no hay descripcion
        errors.push({text : 'Ingrese la descripcion del equipo.'}); //Lo mismo
    }
    if(errors.length > 0){ //Si hay errores
        res.render('/FVK/asignaciones', {errors, tipo, descripcion}); //Mostrar los errores en la pagina.
    } else { //Si no hay error
        const newAsignacion = new asignacion({tipo, descripcion, responsable}); //Creamos la nueva asignacion
        await newAsignacion.save(); //Guardamos
        req.flash('success_msg', 'equipo registrado con exito.'); //mostramos mensaje
        res.redirect('/FVK/asignaciones'); //Y redireccionamos a la pagina donde se muestran los equipos
    }
});

//--------------------------------------------------------------------------------------

//Editar informacion

//Esto es para buscar la info del equipo en cuestión y pegarla en la pagina de edicion
router.get('asignaciones/editar/:id', isAuthenticated, async (req, res) => {
    const equipo = await asignacion.findById(req.params.id); //Buscamos la informacion del equipo segun su id
    res.render('admin/edit-panel', { equipo }); //Lo mostramos en la pagina, el como se hace estara en la vista respectiva
});

//Esto es para guardar los cambios necesarios
router.put('asignaciones/guardar/:id', isAuthenticated, async (req, res) => {
    const { tipo, descripcion, responsable } = req.body; //Los datos registrados en el formulario
    await asignacion.findByIdAndUpdate(req.params.id, { tipo, descripcion, responsable }); //Buscamos el equipo por su id y lo actualizamos
    req.flash('success_msg', 'Informacion del equipo editada con exito.'); //mostramos mensaje
    res.redirect('/FVK/asignaciones'); //Y redireccionamos a la pagina donde se muestran los equipos
});

//-------------------------------------------------------------------------------------

//Borrar equipo del sistema

router.delete('asignaciones/borrar/:id', isAuthenticated, async (req, res) => {
    await asignacion.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Equipo eliminado con exito');
    res.redirect('/FVK/asignaciones');
});

module.exports = router;