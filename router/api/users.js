const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const gravatar = require('gravatar');
const jwt = require("jsonwebtoken")
const passport = require("passport")
const validRegisterInput = require("../../validation/register")
const validLoginInput = require("../../validation/login")

//import models
const User = require("../../model/User")

router.get('/test',(req,res) =>{
    res.json({
        msg:"hello test!"
    })
})

//register
router.post('/register',(req,res) =>{
    const { errors,isValid } = validRegisterInput(req.body)
    if(!isValid){
        res.status(400).json(errors)
    }

    User.findOne({
        email:req.body.email
    }).then(user =>{
        if(user){
            res.status(400).json({
                error_msg: "此邮箱已被注册"
            });
        }else{
            let avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
            const newUser = new User({
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                avatar
            })
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.password, salt, (err, hash) =>{
                    if(err){
                        throw err
                    }else{
                        newUser.password = hash;
                        newUser.save();
                        res.json(newUser);
                    }
                });
            });
        }
    })
})
//login
router.post("/login",(req,res) =>{
    const { errors,isValid } = validLoginInput(req.body)
    if(!isValid){
        res.status(400).json(errors)
    }

    let email = req.body.email;
    let password = req.body.password;
    User.findOne({ email }).then(user =>{
        if(!user){
            res.status(404).json({
                error_msg: "用户不存在"
            })
        }else{
            bcrypt.compare(password, user.password).then(isMatch =>{
                if(!isMatch){
                    res.status(400).json({
                        error_msg: "密码错误"
                    })
                }else{
                    const rule = {name: user.name, id:user.id}
                    jwt.sign(rule, 'secret', { expiresIn: 3600}, (err,token) =>{
                        if(err) throw err
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        })
                    });
                }
            })
        }
    })
})

router.get("/current",passport.authenticate(('jwt')),(req,res) =>{
    res.json({
        id:req.user.id,
        email:req.user.email,
        name: req.user.name,
        password: req.user.password
    })
})
module.exports = router