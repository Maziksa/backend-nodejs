export default (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'attachments',
    timestamps: true,
    underscored: false,
    createdAt: 'uploadedAt',
    updatedAt: false
  });

  return Attachment;
};
