const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const db = require('../models');
const user = require('../models/user');
const { Post } = require('../models');

const router = express.Router();

router.get('/',isLoggedIn, async(req,res,next)=>{
    const user = req.user;
    res.json(user);
});

router.get('/:id', async (req,res,next)=>{
    try {
        const user = await db.User.findOne({
            where: { id: parseInt(req.params.id,10) },
            include: [{
                model: db.Post,
                as: 'Posts',
                attributes: ['id'],
            },{
                model: db.User,
                as: 'Followings',
                attributes: ['id'],
            },{
                model: db.User,
                as: 'Followers',
                attributes: ['id'],
            }],
            attributes: ['id','nickname']
        });
        res.json(user);
    } catch(err){
        console.error(err);
        next(err);
    }
})

router.post('/',isNotLoggedIn, async(req,res,next)=>{
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
                const fullUser = await db.User.findOne({
                    where: { id: user.id },
                    attributes: ['id','email','nickname'],
                    include: [{
                        model: db.Post,
                        attributes: ['id'],
                    },{
                        model: db.User,
                        as: 'Followings',
                        attributes: ['id'],
                    },{
                        model: db.User,
                        as: 'Followers',
                        attributes: ['id'],
                    }],
                });
                console.log("유저!");
                console.log(fullUser);
                return res.json(fullUser); // 두번 응답을 보내는 것을 막기 위해 return을 사용한다.
            });
        })(req, res, next);
    } catch (err) {
        console.log(err);
        return next(err);
    } 
});

router.post('/login', isNotLoggedIn, async (req,res,next) => {
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
            const fullUser = await db.User.findOne({
                where: { id: user.id },
                attributes: [ 'id', 'email', 'nickname' ],
                include: [{
                    model: db.Post,
                    attributes: ['id'],
                },{
                    model: db.User,
                    as: 'Followings',
                    attriubtes: ['id'],
                },{
                    model: db.User,
                    as: 'Followers',
                    attributes: ['id'],
                }]
            });
            console.log("로그인!");
            console.log(fullUser);
            return res.json(fullUser);
        });
    })(req, res, next);
    // req.body가 알아서 쿠키를 내려줌
});

router.post('/logout', isLoggedIn, (req,res)=>{  // 실제 주소는 /user/logout
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

router.get('/:id/posts',async (req,res,next)=>{
    try {
        let where = {
            userId: parseInt(req.params.id,10),
            RetwwetId: null,
        };
        if(parseInt(req.query.lastId,10)){
            where[db.Sequelize.Op.lt] = parseInt(req.query.lastId,10);
        }
        const posts = await db.Post.findAll({
            where,
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            },{
                model: db.Image,
            },{
                model: db.User,
                through: 'Like',
                as: 'Likers',
                attributes: ['id'],
            }],
        });
        res.json(posts);
    } catch (e) {
        console.error(e);
    }
});

router.post('/:id/follow',isLoggedIn, async(req,res,next)=>{
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });
        await me.addFollowing(req.params.id);
        res.send(req.params.id);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/:id/follow',isLoggedIn,async (req,res,next)=>{
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });
        await me.removeFollowing(req.params.id);
        res.send(req.params.id);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.patch('/nickname',async(req,res,next)=>{
    try {
        // 1. 바꿀내용 2. 찾을내용
        await db.User.update({
            nickname: req.body.nickname 
        },{
            where: { id: req.user.id }
        });
        res.send(req.body.nickname);
    } catch(e){
        console.error(e);
        next(e);
    }
});

router.get('/:id/followings',isLoggedIn, async(req,res,next)=>{
    try {
        const user = await db.User.findOne({
            where: { id: req.user.id },
        });
        const followings = await user.getFollowings({
            attributes: ['id','nickname'],
            limit: parseInt(req.query.limit || 3,10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        res.json(followings);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:id/followers',isLoggedIn, async(req,res,next)=>{
    try {
        const user = await db.User.findOne({
            where: { id: req.user.id },
        });
        const followers = await user.getFollowers({
            attributes: ['id','nickname'],
            limit: parseInt(req.query.limit || 3,10),
            offset: parseInt(req.query.offset || 0, 10),
        });
        res.json(followers);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/:id/follower',isLoggedIn, async (req,res,next)=>{
    try {
        const me = await db.User.findOne({
            where: { id:req.user.id }
        });
        await me.removeFollower(req.params.id);
        res.send(req.params.id);
    } catch (err) {
        console.error(err);
        next(err);
    }
});


module.exports = router;