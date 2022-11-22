const {Router} = require('express')
const router = Router()
const User = require('../modeles/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer') // !
const { reset } = require('nodemon')
const keys = require('../keys/dev')
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: keys.SYSTEM_EMAIL,
        pass: keys.PASSWORD_EMAIL
    }
});

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        layout:'nohead',
        error: req.flash('error'),
        success: req.flash('success'),

    })
})

router.get('/panda',async(req,res)=>{
    const panda = await User.findOne({email:'admin@uysotuv.com'})
    panda.role = 0
    await panda.save()
    res.redirect('/')
})

router.get('/reg', async (req, res) => {
    res.redirect('/auth/login')
    res.render('auth/reg', {
        title: 'Регистрация',
        layout:'nohead',
        error: req.flash('error'),
        success: req.flash('success'),

    })
})

// router.get('/meneger',async (req,res)=>{
//     const hashPass = await bcrypt.hash('info3223altech', 10)
//     const really = await new User({name:'manager',email:'info@altech.uz',phone:'998993222223',password: hashPass,role:1})
//     await really.save()
//
//     const hashPass1 = await bcrypt.hash('r00taltech', 10)
//     const really1 = await new User({name:'admin',email:'admin@altech.uz',phone:'998712003223',password: hashPass1,role:0})
//     await really1.save()
//     res.redirect('/auth/login')
// })
router.get('/resave',async (req,res)=>{
    const hashPass = await bcrypt.hash('sariqtoshbaqa1120', 10)
    let infoMen = await User.findOne({email:'info@altech.uz'})
    await User.findByIdAndUpdate(infoMen._id,{name:'manager',email:'info@altech.uz',phone:'998993222223',password: hashPass,role:1})


    const hashPass1 = await bcrypt.hash('kokking1123', 10)
    let infoMen1 = await User.findOne({email:'admin@altech.uz'})
    await User.findByIdAndUpdate(infoMen1._id,{name:'admin',email:'admin@altech.uz',phone:'998712003223',password: hashPass1,role:1})

    res.redirect('/auth/login')
})

router.get('/fmeneger',async (req,res)=>{
    let infoMen1 = await User.findOne({email:'admin@altech.uz'})
    await User.findByIdAndUpdate(infoMen1._id,{role:0})
    res.redirect('/auth/login')
})

// router.post('/reg', async (req, res) => {
//     const {name,email,phone,pass} = req.body
//     const reallyMen = await User.findOne({email})
//     if (reallyMen) {
//         req.flash('error', 'Пользователь с таким почтой уже имеется!')
//         res.redirect('/auth/reg')
//     } else {
//         const hashPass = await bcrypt.hash(pass, 10)
//         const really = await new User({name,email,phone,password: hashPass})
//         await really.save()
//         // await transporter.sendMail({
//         //     from: keys.SYSTEM_EMAIL,
//         //     to: email,
//         //     subject: 'Ro`yhatdan o`tildi',
//         //     html: `<h1>Hurmatli ${name}, siz tizimda ro'yhatdan o'tdingiz!</h1>`
//         // });
//         req.flash('success', 'Успешно!')
//         res.redirect('/auth/login')
//
//     }
// })

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err
        res.redirect('/auth/login')
    })
})

router.get('/getcookie',(req,res)=>{
    
})

router.post('/login', async (req, res) => {
    const {email,password} = req.body
    const maybeUser = await User.findOne({email})
    if (maybeUser) {
        const comparePass = await bcrypt.compare(password, maybeUser.password)
        if (comparePass) {
            req.session.user = maybeUser
            req.session.isAuthed = true
            req.session.save((err) => {
                if (err) throw err
                else res.redirect('/')
            })
        } else {
            req.flash('error', 'Пароль не правильно')
            res.redirect('/auth/login')
        }
    } else {
        req.flash('error', 'Пользователь с таким почтой нету брат')
        res.redirect('/auth/login')
    }
})

router.get('/reset',(req,res)=>{
    res.render('auth/reset',{
        layout: 'nohead',
        title: 'Mahfiy kalitni tiklash'
    })
})

router.post('/reset',async(req,res)=>{
    try {
        const email = req.body.email
        const resetBoy = await User.findOne({email})
        if (resetBoy){
                crypto.randomBytes(30,async(err,buffer)=>{
                if (err){
                    req.flash('error','Tizimda xatolik bo`ldi')
                    res.redirect('/auth/login')
                } else {
                    const token = buffer.toString('hex')
                    resetBoy.resetToken = token
                    resetBoy.resetTokenExp = Date.now() + 60 * 60 * 1000
                    await resetBoy.save()
                    await transporter.sendMail({
                            from: keys.SYSTEM_EMAIL,
                            to: email,
                            subject: 'Mahfiy kalitni tiklash',
                            html: `<h1>Hurmatli foydalanuvchi tizimda mahfiy kalitni tiklash holati bo'lyapdi!</h1>
                                <a href="http://localhost:3000/auth/password/${token}">Tizimga o'tish</a>`
                        })
                        req.flash('success','Mahfiy kalitni tiklash ko`rsatmasi emailga jo`natildi!')
                        res.redirect('/auth/login')
                }
            })
        } else {
            req.flash('error','Bunday email tizimda yo`q')
            res.redirect('/auth/login')
        }
    } catch (error) { console.log(e) }
})

router.get('/password/:token',async(req,res)=>{
    if (!req.params.token){
        req.flash('error','Havoladaga gap bor')
        res.redirect('/auth/login')
    } else {
        const token = req.params.token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user){
            res.render('auth/password',{
                layout: 'nohead',
                title: 'Yangi mahfiy kalitni yozing!',
                userId: user._id,
                token: token,
            })
        } else {
            req.flash('error','Havola muddati tugagan!')
            res.redirect('/auth/login')
        }
    }
})

router.post('/password',async(req,res)=>{
    try {
        const user = await User.findOne({
            _id: req.body._id,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            req.flash('success','Mahfiy kalit muvafaqqiyatli o`zgardi')
            res.redirect('/auth/login')
        } else {
            req.flash('error','Mahfiy kalitni o`zgartirish xatolik bo`ldi')
            res.redirect('/auth/login')
        }
    } catch (error) {
        
    }
})


module.exports = router