'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('articles', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.createTable('article_versions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('article_versions', ['articleId', 'version']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('article_versions');
    await queryInterface.removeColumn('articles', 'version');
  }
};
