exports.isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();  // 인수가 없을때 다음 미들웨어로 넘어간다.
    }
    return res.status(401).send('로그인이 필요합니다.');
}

exports.isNotLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        return next();
    }
    return res.status(401).send('로그인한 사람은 이용할 수 없습니다.');
}

// next(abc) 처럼 인수가 있으면 에러 처리로 넘어간다.
// 우선권은 modules.export 가 높다.