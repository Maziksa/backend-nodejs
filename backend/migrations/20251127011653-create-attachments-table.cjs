'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      originalName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uploadedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('attachments', ['articleId'], {
      name: 'attachments_article_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  }
};
