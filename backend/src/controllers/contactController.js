const Contacto=require('../models/contactModel')

exports.enviarFormulario = async (req,res) =>{
    try{
        const{tipoForm} = req.body;//Identificador del tipo de formulario
        let insertId;

        switch(tipoForm){
            case 'general':
                insertId = await Contacto.crearGeneral(req.body);
                break;
            case 'servicio':
                insertId = await Contacto.crearServicio(req.body);
                break;
            case 'formacion':
                // AQUÍ: Tenías 'crearServicio', cámbialo a 'crearFormacion'
                insertId = await Contacto.crearFormacion(req.body); 
                break;
            default:
                return res.status(400).json({error: 'Tipo de formulario no valido'});
        }
    res.status(201).json({
        mensaje: 'Formulario enviado con exito',
        id: insertId
    });
    } catch(error){
        console.error("Error en contacto:",error);
        res.status(500).json({error: 'Error interno del servidor al procesar el formulario'});
    }
};
