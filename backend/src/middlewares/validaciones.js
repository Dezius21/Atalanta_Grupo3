const {body,validationResult} = require('express-validator');

const validar = (req,res,next) =>{
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({error: errores.array()});
    }
    next();
};

const validarRegister =[
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({min:2, max:100}).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es valido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña no puede ser vacia')
        .isLength({min: 8}).withMessage('Minimo 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una mayuscula')
        .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un numero'),

    validar
];

const validarLogin =[
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es valido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña no puede ser vacia'),

    validar
]

const validarNoticia = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('El título es obligatorio')
        .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres')
        .escape(),

    body('contenido')
        .trim()
        .notEmpty().withMessage('El contenido es obligatorio')
        .isLength({ min: 10 }).withMessage('El contenido debe tener mínimo 10 caracteres')
        .escape(),

    body('categoria')
        .trim()
        .notEmpty().withMessage('La categoria es obligatoria')
        .escape(),

    validar

]

const validarContacto = [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido').escape(),
    body('apellidos').trim().notEmpty().withMessage('Los apellidos son requeridos').escape(),
    body('email').trim().notEmpty().withMessage('Email no valido').escape(),
    body('empresa').trim().notEmpty().withMessage('La empresa es requerida'),
    body('cargo').trim().notEmpty().withMessage('El cargo es requerido').escape(),
    body('tipoForm').notEmpty().withMessage('Error al cargar el formulario'),
    body('mensaje').optional().trim().escape(),
    body('interes').if(body('tipoForm').custom(val => val === 'servicio' || val === 'formacion')).notEmpty().withMessage('El interes es requerido').escape(),
    body('tamaño').if(body('tipoForm').custom(val => val === 'formacion')).notEmpty().withMessage('El tamaño es requerido').escape(),
    validar
]

module.exports = {validarRegister, validarLogin , validarNoticia, validarContacto, validar}
