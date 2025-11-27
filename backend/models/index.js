import Sequelize from 'sequelize';
import { CONFIG } from '../config/constants.js';
import ArticleModel from './article.js';
import AttachmentModel from './attachment.js';

const sequelize = new Sequelize(
  CONFIG.DB_NAME,
  CONFIG.DB_USER,
  CONFIG.DB_PASSWORD,
  {
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    dialect: 'postgres',
    logging: CONFIG.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const Article = ArticleModel(sequelize, Sequelize.DataTypes);
const Attachment = AttachmentModel(sequelize, Sequelize.DataTypes);

Article.hasMany(Attachment, {
  foreignKey: 'articleId',
  as: 'attachments',
  onDelete: 'CASCADE'
});

Attachment.belongsTo(Article, {
  foreignKey: 'articleId',
  as: 'article'
});

export const db = {
  sequelize,
  Sequelize,
  Article,
  Attachment
};

export default db;
