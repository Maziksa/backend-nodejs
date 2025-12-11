export default (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    workspace: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'personal',
      validate: {
        isIn: [['personal', 'university', 'work']]
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'articles',
    timestamps: true
  });

  return Article;
};
