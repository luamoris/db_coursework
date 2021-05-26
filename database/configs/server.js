// Config: Postges

const CONFIG = {
	MASTER: {
		host: '192.168.0.115',
		port: 5432,
		user: 'master',
		password: '1111',
		database: 'products'
	},
	SLAVE: {
		host: '192.168.0.116',
		port: 5432,
		user: 'master',
		password: '1111',
		database: 'products'
	}
}

module.exports = CONFIG;
