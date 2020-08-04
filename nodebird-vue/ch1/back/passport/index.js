const passport = require('passport');
const local = require('./local');
const db = require('../models');

module.exports = () => {
    passport.serializeUser((user,done)=>{
        return done(null,user.id);  // id만 저장하는 이유: 메모리 부담을 줄이기 위해
    });
    // 로그인 후 모든 요청마다 실행됨
    // 캐싱을 통해 극복한다.
    passport.deserializeUser(async(id,done)=>{  // id로 User를 찾는다.
        console.log("deserializeUser실행!");
        try {
            const user = await db.User.findOne({ where: { id }});
            console.log(user);
            return done(null,user); // req.user, req.isAuthenticated() === true
        } catch(err) {
            console.log('왜 오류가 나지 ㅠ');
            console.error(err);
            return done(err);
        }
    });
    local();
}