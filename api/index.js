const express = require('express') 
const exphbs = require('express-handlebars')
const fs = require("fs");
const https = require("https");
const http = require("http");
const mongoose = require('mongoose')
const session = require('express-session')
const csrf = require('csurf')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongodb-session')(session)
const  xlsx = require('xlsx')
// const cors = require('cors')
const flash = require('connect-flash') // !
// const path = require('path')
// const options = {
//     key: fs.readFileSync(`/etc/letsencrypt/live/wt.altech.uz/privkey.pem`),
//     cert: fs.readFileSync(`/etc/letsencrypt/live/wt.altech.uz/fullchain.pem`),
// };
// Routerlar
const routerList = require('./router.js')

// middleWare lar
const varMid = require('./middleware/var')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys/dev')


const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})
app.engine('hbs',hbs.engine)
app.set('view engine','hbs')
app.set('views','views')
app.use(express.urlencoded({extended:true})) 
app.use(express.static(__dirname+'/public')) 
app.use('/images',express.static('images')) // !


app.use(cors({
    origin: ['https://www.altech.uz','http://altech.uz','http://localhost:2025','https://localhost:2025','https://altech.uz','http://localhost:8080','https://localhost:8080']
}));

// app.use(function (req, res, next) {
//
//     res.setHeader('Access-Control-Allow-Origin', '*');
//
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-CSRF-Token');
//     // res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URI
})
app.use(session({
    secret: keys.SESSION_SECRET,
    saveUninitialized:false,
    resave:false,
    store
}))

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrf())

app.use((error,req,res,next)=>{
    const message = `This is the unexpected field -> ${error.field}`
    console.log(message)
    next()
})

app.use(flash()) // !
app.use(varMid)
// app.use(helmet())
// app.use(compression())


app.use(routerList)
// app.use('/genre',genreRouter)

const PORT = process.env.PORT || 2023
mongoose.connect(keys.MONGODB_URI,{useNewUrlParser:true})
.then(()=>{console.log("server is run");})
.catch((err)=>{console.log("err");})



app.listen(PORT, () => {
                console.log("serever is runing at port 2023");
            });
// async function dev(){
//     try {
//         await mongoose.connect(keys.MONGODB_URI,{useNewUrlParser:true})
//         // http.createServer(app).listen(2024);
// // Create an HTTPS service identical to the HTTP service.
//         https.createServer(options, app).listen(2023);
//         // app.listen(PORT, () => {
//         //         console.log("serever is runing at port 2023");
//         //     });
//     } catch (error) {
//         console.log(error)
//     }
// }
// dev()