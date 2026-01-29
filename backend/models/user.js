import { CONFIG } from '../config/constants.js';
import { ROLES, ROLE_VALUES } from '../config/roles.js';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [CONFIG.MIN_PASSWORD_LENGTH, CONFIG.MAX_PASSWORD_LENGTH]
      }
    },
    role: {
      type: DataTypes.ENUM(...ROLE_VALUES),
      allowNull: false,
      defaultValue: ROLES.USER,
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async user => {
        const bcrypt = await import('bcryptjs');
        user.password = await bcrypt.default.hash(user.password, 10);
      }
    }
  });

  return User;
};