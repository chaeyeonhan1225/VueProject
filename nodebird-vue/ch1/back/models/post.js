module.exports = (sequelize,DataTypes) => {
    const Post = sequelize.define('Post',{  // 모델명 대문자 단수형 테이블평 소문자 복수형
        content: {
            type: DataTypes.TEXT,   // 매우 긴 글
            allowNull: false,
        },  // createdAt,updatedAt 자동생성
    },{
        charset: 'utf8mb4', // 한글, 이모티콘 허용
        collate: 'utf8mb4_general_ci'
    });
    // 관계 정의
    Post.associate = (db) => {
        db.Post.belongsTo(db.User); // UserId도 저장해준다.
        db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.Image);
        db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); 
        db.Post.belongsToMany(db.Hashtag, { through : 'PostHashtag' });
        db.Post.belongsTo(db.Post,{ as: 'Retweet'});
    }
    return Post;
}