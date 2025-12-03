'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('articles', 'workspace', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'personal',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('articles', 'workspace')
	},
}
