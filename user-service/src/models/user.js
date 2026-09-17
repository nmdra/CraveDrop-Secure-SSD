import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: { type: DataTypes.STRING, allowNull: false },
    birthday: { type: DataTypes.DATEONLY, allowNull: true },
    pic: { type: DataTypes.STRING, allowNull: true },
    oidcIssuer: { type: DataTypes.STRING, allowNull: true },
    oidcSubject: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: 'users',
    timestamps: true
});

// hash passwords
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    if (user.password) user.password = await bcrypt.hash(user.password, salt);
});
User.beforeUpdate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    if (user.changed('password')) user.password = await bcrypt.hash(user.password, salt);
});

export default User;

