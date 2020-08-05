const express = require('express');
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('./middlewares');
const db = require('../models');

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination(req,file,done) {
            done(null,'uploads');
        },
        filename(req,file,done) {
            const ext = path.extname(file.originalname);    // 확장자 이름
            const basename = path.basename(file.originalname,ext);  // 확장자를 제외한 이름
            done(null,basename + Date.now() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 },
});
// upload.
// single: 파일 하나
// array: 같은 키로 여러 개
// fields: 다른 키로 여러게
// node: 파일 업로드 x

router.post('/images', isLoggedIn, upload.array('image'),(req,res) => {
    console.log(req.files);
    res.json(req.files.map(v=>v.filename));
});

router.post('/',isLoggedIn,async (req,res)=>{
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const newPost = await db.Post.create({
            content: req.body.content,
            UserId: req.user.id
        });
        if(hashtags) {
            // findOrCrate: 있으면 찾고, 없으면 만든다.
            const result = await Promise.all(hastags.map(tag => db.Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            })));
            await newPost.addHashtags(result.map(r => r[0]));
        }
        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            }],
        });
        return res.json(fullPost);
    } catch (err) {
        console.error(err);
        next(Err);
    }
});

module.exports = router;