const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const passport = require("passport")
const validProfileInput = require("../../validation/profile")
const validExperienceInput = require("../../validation/experience")
const validEducationInput = require("../../validation/education")

mongoose.set('useFindAndModify', false);

//import models
const User = require("../../model/User")
const Profile = require("../../model/Profile")

// $route GET api/profile
// desc 返回登录用户的个人信息`
// access private
router.get('/',passport.authenticate(('jwt')),(req,res) =>{
    const errors = {};
    Profile.findOne({user: req.user.id}).populate('user',[
        "name","avatar"
    ]).then((profile) =>{
        if(!profile){
            errors.noprofile = "该用户信息不存在"
            return res.status(404).json(errors)
        }
        res.json(profile)
    })
})
// $route GET api/profile
// desc 通过handle获取登录用户的个人信息
// access public
router.get('/handle/:handle',(req,res) =>{
    const errors = {};
    Profile.findOne({handle: req.params.handle}).populate('user',[
        "name","avatar"
    ]).then((profile) =>{
        if(!profile){
            errors.noprofile = "该用户信息不存在"
            return res.status(404).json(errors)
        }
        res.json(profile)
    })
})

// $route GET api/profile
// desc 通过user_id获取登录用户的个人信息
// access public
router.get('/user/:user_id',(req,res) =>{
    const errors = {};
    Profile.findOne({user: req.params.user_id}).populate('user',[
        "name","avatar"
    ]).then((profile) =>{
        if(!profile){
            errors.noprofile = "该用户信息不存在"
            return res.status(404).json(errors)
        }
        res.json(profile)
    })
})

// $route GET api/profile/all
// desc 获取所有用户个人信息
// access public
router.get('/all',(req,res) =>{
    const errors = {};
    Profile.find().populate('user',[
        "name","avatar"
    ]).then((profiles) =>{
        if(!profiles){
            errors.noprofile = "没有任何用户信息"
            return res.status(404).json(errors)
        }
        res.json(profiles)
    })
})

// $route POST api/profile
// desc 创建和编辑登录用户的个人信息
// access private
router.post('/',passport.authenticate(('jwt')),(req,res) =>{
    const { errors,isValid } = validProfileInput(req.body)
    if(!isValid){
        res.status(400).json(errors)
    }
    //从前端获取数据
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    //skills - 数组转换
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',')
    }
    //social 对象
    profileFields.social = {};
    if(req.body.wechat) profileFields.social.wechat = req.body.wechat;
    if(req.body.QQ) profileFields.social.QQ = req.body.QQ;

    Profile.findOne({user:req.user.id}).then(profile =>{
        if(profile){
            console.log(profileFields)
            //用户信息存在，更新
            Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true}).then(profile =>{
                res.json(profile)
            })
        }else{
            //用户不存在，创建
            Profile.findOne({handle:profileFields.handle}).then(profile =>{
                if(profile){
                    errrors.handle = "该用户的handle个人信息已经存在，请勿重新创建"
                    res.status(400).json(errors)
                }
                new Profile(profileFields).save().then(profile =>{
                    res.json(profile)
                })
            })
        }
    })
    
})

// $route POST api/profile/experience
// desc 添加工作经历
// access private
router.post('/experience',passport.authenticate('jwt'),(req,res) =>{
    const { errors,isValid } = validExperienceInput(req.body)
    if(!isValid){
        res.status(400).json(errors)
    }
    Profile.findOne({user:req.user.id}).then((profile) =>{
        const newExp = {
            title:req.body.title,
            company:req.body.company,
            from:req.body.from,
            to:req.body.to,
            location:req.body.location,
            description:req.body.description,
            current:req.body.current,
        }
        profile.experience.unshift(newExp)
        profile.save().then(profile => res.json(profile))
    })
})

// $route POST api/profile/education
// desc 添加教育经历
// access private
router.post('/education',passport.authenticate('jwt'),(req,res) =>{
    const { errors,isValid } = validEducationInput(req.body)
    if(!isValid){
        res.status(400).json(errors)
    }
    Profile.findOne({user:req.user.id}).then((profile) =>{
        const newEdu = {
            school:req.body.school,
            degree:req.body.degree,
            from:req.body.from,
            to:req.body.to,
            fieldofstudy:req.body.fieldofstudy,
            description:req.body.description,
            current:req.body.current,
        }
        profile.education.unshift(newEdu)
        profile.save().then(profile => res.json(profile))
    })
})

// $route DELETE api/profile/experience/:exp_id
// desc 删除工作经历
// access private
router.delete('/experience/:exp_id',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOne({user:req.user.id}).then((profile) =>{
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex,1)
        profile.save().then(profile => res.json(profile))
    }).catch(e => console.log(e))
})
// $route DELETE api/profile/education/:edu_id
// desc 删除教育经历
// access private
router.delete('/education/:edu_id',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOne({user:req.user.id}).then((profile) =>{
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex,1)
        profile.save().then(profile => res.json(profile))
    }).catch(e => console.log(e))
})
// $route DELETE api/profile
// desc 删除整个用户个人信息
// access private
router.delete('/',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOneAndRemove({user:req.user.id}).then(() =>{
        User.findOneAndRemove({_id:req.user.id}).then(() =>{
            res.json({success: true})
        })
    }).catch(e => console.log(e))
})

module.exports = router