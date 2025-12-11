'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('article_versions', 'workspace', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'personal'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('article_versions', 'workspace');
  }
};
