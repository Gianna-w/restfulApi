const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require("mongoose")
const User = mongoose.model("users")
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

module.exports = passport =>{
    passport.use(new JwtStrategy(opts, (jwt_payload, done) =>{
        User.findById(jwt_payload.id).then(user =>{
            if(user){
                return done(null,user,);
            }else{
                return done(null,false);
            }
        })
    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}