module.exports = (sequelize,DataTypes) => {
    const User = sequelize.define('User',{
        email: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true,
        },
        nickname: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // id, createdAt, updatedAt 자동 추가
    },{
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });
    User.associate = (db) => {

    };
    return User;
}