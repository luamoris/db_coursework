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


// localhost
/*

const Config = {
	host: 'localhost',
	port: 5432,
	user: 'postgres',
	password: 'qjcbr0509',
	database: 'Products'
};

*/