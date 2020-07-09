const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const passport = require("passport")

const app = express()

//import apis
const users = require("./router/api/users")
const profile = require("./router/api/profile")
const posts = require("./router/api/posts")


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//set mongoDB
mongoose.connect('your mongodb address',{useNewUrlParser:true},() =>{
    console.log("MongoDB connected");
})

//使用中间件实现允许跨域
app.use((req,res,next) =>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,DELETE,POST,GET,OPTIONS");
    next();
})

app.use(passport.initialize());
//import passport.js
require("./config/passport")(passport)


app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

//run server
const PORT = process.env.PORT || 3000;
app.listen(PORT,() =>{
    console.log(`Server is running on ${PORT}`);
})
