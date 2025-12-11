export default (sequelize, DataTypes) => {
  const ArticleVersion = sequelize.define('ArticleVersion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    workspace: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'article_versions',
    timestamps: true
  });

  return ArticleVersion;
};
