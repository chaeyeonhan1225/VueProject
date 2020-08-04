const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../models');

const router = express.Router();

router.post('/',async(req,res,next)=>{
    try {
        const hash = await bcrypt.hash(req.body.password,12);
        const exUser = await db.User.findOne({
            where: {
                email: req.body.email,    
            }
        });
        if(exUser) {    // 이미 회원가입되어있으면
            return res.status(403).json({
                errorCode: 1,
                message: '이미 회원가입되어있습니다.'
            });
        }
        const newUser = await db.User.create({
            email: req.body.email,
            password: hash,
            nickname: req.body.nickname,
        });
        // HTTP STATUS CODE
        passport.authenticate('local', (err, user, info)=>{
            if(err){
                console.error(err);
                return next(err);
            }
            if(info){
                console.log(info);
                return res.status(401).send(info.reason);
            }
            return req.login(user, async (err) => { // 세션에다 사용자 정보 저장(어떻게? SerializeUser)
                if(err) {
                    console.error(err);
                    return next(err);
                }
                return res.json(user); // 두번 응답을 보내는 것을 막기 위해 return을 사용한다.
            });
        })(req, res, next);
    } catch (err) {
        console.log(err);
        return next(err);
    } 
});

router.post('/login',async (req,res,next) => {
    passport.authenticate('local', (err, user, info)=>{
        if(err){
            console.error(err);
            return next(err);
        }
        if(info){
            console.log(info);
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (err) => { // 세션에다 사용자 정보 저장(어떻게? SerializeUser)
            if(err) {
                console.error(err);
                return next(err);
            }
            return res.json(user);
        });
    })(req, res, next);
    // req.body가 알아서 쿠키를 내려줌
});

router.post('/logout',(req,res)=>{  // 실제 주소는 /user/logout
    console.log('로그아웃 요청');
    if(req.isAuthenticated()){
        console.log('로그아웃!');
        req.logout();
        req.session.destroy();  // 세션을 모두 없앤다. (선택사항)
        return res.status(200).send('로그아웃 되었습니다.');
    } else {
        console.log("로그인이 안되어있습니다!");
    }
});

module.exports = router;