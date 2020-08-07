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
        if (req.body.image) {
            if(Array.isArray(req.body.image)) {
                await Promise.all(req.body.image.map((image)=>{
                    return db.Image.create({ src: image, PostId: newPost.id });
                    // newPost.addImages(images); 비효율적
                }));
            } else {
                await db.Image.create({ src: req.body.image, PostId: newPost.id });
            }
        }
        const fullPost = await db.Post.findOne({
            where: { id: newPost.id },
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            },{
                model: db.Image,
            },{
                model: db.User,
                as: 'Likers',
                attributes: ['id'],
            }],
        });
        return res.json(fullPost);
    } catch (err) {
        console.error(err);
        next(Err);
    }
});

router.delete('/:id', async (req,res,next)=>{
    try {
        await db.Post.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.send('삭제했습니다.');
    } catch(err) {
        console.error(err);
        return next(err);
    }
})

router.get('/:id/comments',async (req,res,next) => {
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        if(!post){
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const comments = await db.Comment.findAll({
            where: {
                PostId: req.params.id,
            },
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            }],
            order: [['createdAt','ASC']],   // 무조건 이차원 배열 (또 다른 조건이 있을 수 있기 때문)
        });
        return res.json(comments);
    } catch(err) {
        console.error(err);
        next(err);        
    }
});

router.post('/:id/comment',isLoggedIn, async (req,res,next) => {    // POST /post/:id/comment id: 게시글의 id
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const newComment = await db.Comment.create({
            PostId: post.id,
            UserId: req.user.id,
            content: req.body.content,
        });
        // await post.addComment(newComment.id);   // 단수형으로 써주면 하나만 등록되는 것이다.
        const comment = await db.Comment.findOne({
            where: {
                id: newComment.id,
            },
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            }]
        });
        console.log("comment:",comment);
        return res.json(comment);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/retweet',isLoggedIn, async (req,res,next)=>{
    try {
        const post = await db.Post.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.Post,
                as: 'Retweet',  // 리트윗한 게시글이면 원본 게시글이 됨
            }],
        });
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        if(req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)){
            return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
        }
        const retweetTargetId = post.RetweetId || post.id;
        const exPost = await db.Post.findOne({
            where: {
                UserId: req.user.id,
                RetweetId: retweetTargetId,
            }
        });
        if(exPost) {
            return res.status(403).send('이미 리트윗했습니다.');
        }
        const retweet = await db.Post.create({
            UserId: req.user.id,
            RetweetId: retweetTargetId, // 원본 아이디
            content: 'retweet',
        });
        const retweetwithPrevPost = await db.Post.findOne({
            where: { id: retweet.id },
            include: [{
                model: db.User,
                attributes: ['id','nickname'],
            },{
                model: db.User,
                as: 'Likers',
                attributes: ['id'],
            },{
                model: db.Post,
                as: 'Retweet',
                include: [{
                    model: db.User,
                    attributes: ['id','nickname'],
                },{
                    model: db.Image,
                }],
            }],
        });
        return res.json(retweetWithPrevPost);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:id/like',isLoggedIn, async (req,res,next)=>{
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        await post.addLiker(req.user.id);
        return res.json({ userId: req.user.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/:id/like',isLoggedIn, async(req,res,next)=>{
    try {
        const post = await db.Post.findOne({ where: { id: req.params.id }});
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        await post.removeLiker(req.user.id);
        return res.json({ userId: req.user.id });
    } catch (err) {
        console.error(err);
        next(err);
    }
})
module.exports = router;