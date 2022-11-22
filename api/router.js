const {Router} = require('express')
const router = Router()

const pageRouter = require('./router/page')
const usersRouter = require('./router/users')
const authRouter  = require('./router/auth')
const categoryRouter  = require('./router/category')
const subcategoryRouter  = require('./router/subcategory')
const atributRouter  = require('./router/atribut')
const brendRouter  = require('./router/brend')
const productRouter  = require('./router/product')
const profileRouter = require('./router/profile')
const cartRouter = require('./router/cart')
const workerRouter = require('./router/worker')
const spendingRouter = require('./router/spending')
const debtorRouter = require('./router/debtor')
const oneclickRouter = require('./router/oneclick')
const viktorinaRouter = require('./router/viktorina')
const apiRouter = require('./router/api')

router.use(pageRouter)
router.use('/users',usersRouter)
router.use('/auth',authRouter)
router.use('/oneclick',oneclickRouter)
router.use('/category',categoryRouter)
router.use('/subcategory',subcategoryRouter)
router.use('/atribut',atributRouter)
router.use('/brend',brendRouter)
router.use('/product',productRouter)
router.use('/worker',workerRouter)
router.use('/cart',cartRouter)
router.use('/profile',profileRouter)
router.use('/debtor',debtorRouter)
router.use('/spending',spendingRouter)
router.use('/viktorina',viktorinaRouter)
router.use(apiRouter)

module.exports = router