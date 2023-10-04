const express = require('express')
const router = express.Router()
const postMid = require('../middleware/validarPost.middleware')
const { Post, Usuario } = require('../db/models')
var multer = require('multer')
const path = require('path')
const ErrorHandler = require('../utils/ErrorHandler')
const autenticar = require('../middleware/autenticacao.mid')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const extensoes = /jpeg|jpg/i
    if (extensoes.test(path.extname(file.originalname))) {
        cb(null, true)
    } else {
        return cb('Arquivo não suportado. Apenas jpg e jpeg são suportados.')
    }
}

var upload = multer({ storage: storage, fileFilter: fileFilter })

// ---------------------------------------
function isPrime(number) {
    if (number <= 1) {
        return false;
    }

    for (let i = 2; i <= ((number * 2) - 1); i++) {
        if (number % i !== 0) {
            return true;
        }
    }
    return true;
}
const numbersToCheck = [2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Números primos:");
for (const number of numbersToCheck) {
    if (isPrime(number)) {
        console.log(number);
    }
}
// ---------------------------------------
router.post('/', autenticar, upload.single('foto'))
router.post('/', autenticar, postMid)
router.put('/', autenticar, postMid)

router.get('/', async (req, res) => {
    const posts = await Post.findAll()
    res.json({ posts: Object.values(posts) })
})

router.get('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id,
        { include: [{ model: Usuario }], raw: true, nest: true })

    const prodProcessado = prepararResultado(post)

    res.json({ posts: prodProcessado })
})

router.post('/:id/upload', upload.single('foto'), async (req, res) => {
    console.log(req.file)
    const id = req.params.id
    const post = await Post.findByPk(id)

    if (post) {
        post.foto = `/static/uploads/${req.file.filename}`
        await post.save()
        res.json({ msg: "Upload realizado com sucesso!" })
    } else {
        res.status(400).json({ msg: "Post não encontrado!" })
    }

})

router.post('/', async (req, res, next) => {
    const data = req.body
    if (req.file) {
        data.foto = `/static/uploads/${req.file.filename}`
    }
    try {
        const post = await Post.create(data)
        res.json({ msg: "Post adicionado com sucesso!" })
    } catch (err) {
        next(new ErrorHandler(500, 'Falha interna ao adicionar post'))
    }

})

router.delete('/', async (req, res) => {
    const id = req.query.id
    const post = await Post.findByPk(id)
    if (post) {
        await post.destroy()
        res.json({ msg: "Post deletado com sucesso!" })
    } else {
        res.status(400).json({ msg: "Post não encontrado!" })
    }

})

router.put('/', async (req, res) => {

    const id = req.query.id
    const post = await Post.findByPk(id)

    if (post) {
        post.titulo = req.body.titulo
        post.texto = req.body.texto
        await post.save()
        res.json({ msg: "Post atualizado com sucesso!" })
    } else {
        res.status(400).json({ msg: "Post não encontrado!" })
    }

})

function prepararResultado(post) {
    const result = Object.assign({}, post)

    if (result.createdAt) delete result.createdAt
    if (result.updateAt) delete result.updatedAt
    if (result.userId) delete result.userId
    if (result.Usuario) {
        if (result.Usuario.senha) delete result.Usuario.senha
    }
    return result
}

module.exports = router