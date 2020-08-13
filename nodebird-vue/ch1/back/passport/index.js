const passport = require('passport');
const local = require('./local');
const db = require('../models');

module.exports = () => {
    passport.serializeUser((user,done)=>{
        return done(null,user.id);  // id만 저장하는 이유: 메모리 부담을 줄이기 위해
    });
    // 로그인 후 모든 요청마다 실행됨
    // 캐싱을 통해 극복한다.
    // req.user에 저장해주는 정보
    passport.deserializeUser(async(id,done)=>{  // id로 User를 찾는다.
        console.log("deserializeUser실행!");
        try {
            const user = await db.User.findOne({ 
                where: { id },
                attributes: ['id','nickname'],
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
                    attributes: ['id']
                }],
            });
            console.log(user);
            return done(null,user); // req.user, req.isAuthenticated() === true
        } catch(err) {
            console.error(err);
            return done(err);
        }
    });
    local();
}