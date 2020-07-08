const express = require("express")
const router = express.Router()
const passport = require("passport")
const validPostInput = require("../../validation/post")

//import models
const Post = require("../../model/Post")
const Profile = require("../../model/Profile")

// $route POST api/posts
// desc 创建评论信息
// access private
router.post('/',passport.authenticate('jwt'),(req,res) =>{
    const { errors,isValid } = validPostInput(req.body)
    if(!isValid){
        res.status(400).json(errors);
    }
    const newPost = new Post({
        text:req.body.text,
        name:req.body.name,
        avatar:req.body.avatar,
        user:req.user.id
    })
    newPost.save().then(post =>res.json(post))
}) 

// $route GET api/posts
// desc 获取评论信息
// access public
router.get('/',(req,res) =>{
    Post.find().sort({date:-1}).then(posts =>{
        res.json(posts)
    }).catch(e =>{
        res.status(404).json({msg:"找不到任何评论信息"})
    })
}) 

// $route GET api/posts/:id
// desc 通过id获取评论信息
// access public
router.get('/:id',(req,res) =>{
    Post.findById({_id:req.params.id}).then(post =>{
        res.json(post)
    }).catch(e =>{
        res.status(404).json({msg:"找不到该评论信息"})
    })
}) 

// $route DELETE api/posts/:id
// desc 通过id删除评论信息
// access private
router.delete('/:id',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOne({user:req.user.id}).then(profile =>{
        Post.findById({_id:req.params.id}).then(post =>{
            if(post.user.toString() !== req.user.id){
                res.status(401).json({msg:"非法操作！"})
            }else{
                post.remove().then(() =>{
                    res.json({msg:"删除成功！"})
                })
            }
        }).catch(e =>{
            res.status(404).json({msg:"找不到该评论信息"})
        })
    })
}) 

// $route POST api/posts/like/:id
// desc 点赞
// access private
router.post('/like/:id',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOne({user:req.user.id}).then(profile =>{
        Post.findById({_id:req.params.id}).then(post =>{
            if(post.likes.filter(like =>like.user.toString() === req.user.id).length>0){
                res.status(400).json({msg:"该用户已赞过"})
            }else{
                post.likes.unshift({user:req.user.id})
                post.save().then(post => res.json(post))
            }
        }).catch(e =>{
            res.status(404).json({msg:"找不到该评论信息"})
        })
    })
}) 

// $route POST api/posts/unlike/:id
// desc 取消点赞
// access private
router.post('/unlike/:id',passport.authenticate('jwt'),(req,res) =>{
    Profile.findOne({user:req.user.id}).then(profile =>{
        Post.findById({_id:req.params.id}).then(post =>{
            if(post.likes.filter(like =>like.user.toString() === req.user.id).length===0){
                return res.status(400).json({msg:"该用户没有点过赞"})
            }
            //获取要删掉的user id
            const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id)
            post.likes.splice(removeIndex,1)
            post.save().then(post => res.json(post))
        }).catch(e =>{
            res.status(404).json({msg:"找不到该评论信息"})
        })
    })
}) 

// $route POST api/posts/comment/:id
// desc 添加评论
// access private
router.post('/comment/:id',passport.authenticate('jwt'),(req,res) =>{
    const { errors,isValid } = validPostInput(req.body)
    if(!isValid){
        res.status(400).json(errors);
    }
    Post.findById({_id:req.params.id}).then(post =>{
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar:req.body.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        post.save().then(post => res.json(post))
    })
}) 

// $route DELETE api/posts/comment/:id/:comment_id
// desc 删除评论
// access private
router.delete('/comment/:id/:comment_id',passport.authenticate('jwt'),(req,res) =>{
    Post.findById({_id:req.params.id}).then(post =>{
        if(post.comments.filter(comment =>comment._id.toString() === req.params.comment_id).length===0){
            return res.status(400).json({msg:"该评论不存在"})
        }
        //获取要删掉的user id
        const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)
        post.comments.splice(removeIndex,1)
        post.save().then(post => res.json(post))
    })
}) 
module.exports = router