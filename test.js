const { Pool, Client } = require('pg');

/*
class PgSQL {

	constructor(master, slave) {
		this.master = master;
		this.slave = slave;
		this.pool = null;
		this.client = null;
		this.status = 0;
	}

	async connect() {
		try {
			this.status = 1;
			this.pool = new Pool(this.master);
			this.client = await this.pool.connect();
			// await this.client.end();
		} catch (e) {
			try {
				this.pool = await new Pool(this.slave);
				this.client = await this.pool.connect();
				this.status = 2;
				this.client.end();
			} catch (er) {
				console.error(`No connection servers.\n${er.stack}`);
				this.status = 3;
			}
		}
	}

	async disconnected() {
		console.log(555);
		try { await this.pool.end(); await this.client.end(); }
		catch (ex) { console.log(`Error disconnection.\n${ex.stack}`); }
		// try {
		// 	if (this.status != 0 && this.status != 3) {
		// 		await this.pool.end();
		// 		// this.client = null;
		// 		// this.status = 0;
		// 	}
		// }
		// catch (e) { console.log(`Error disconnection.\n${e.stack}`); }
	}

	async request(query) {
		let res = null;
		console.log(this.status);
		await this.connect();
		console.log(this.status);
		try {
			if (this.status == 0 || this.status == 3) {
				console.error('Request impossible.\n');
				// return res;
			} else {

				console.log(33);
				res = await this.pool.query(query);
				console.log(res);
				
				// await this.disconnected();
				// if (this.status == 1 || this.status == 2) {
				// }
				// return res;
				// console.log(res);
			}
		}
		catch (ex) {
			console.log(`Error request.\n${ex.stack}`);
		}
		finally {
			console.log(444);
			await this.disconnected();
			return res;
		}
	}

	async requestWithValues(query, values) {
		let res = null;
		try {
			await this.connect();
			if (this.status === 0 || this.status === 3) {
				console.error('Request impossible.\n');
			} else {
				res = await this.pool.query(query, values);
			}
		}
		catch (ex) {
			console.log(`Error request with values.\n${ex.stack}`);
		}
		finally {
			if (this.status === 1 || this.status === 2) {
				await this.disconnected();
			}
			return res;
		}
	}
}
*/


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


class PgSQL {

	constructor(master, slave) {
		this.master = master;
		this.slave = slave;
		this.pool = null;
	}

	async connect(host) {
		try { 
			this.pool = await new Pool(host);
		}
		catch (ex) { console.log(`Error connection.\n${ex.stack}`); }
	}

	async disconnected() {
		try { await this.pool.end(); }
		catch (ex) { console.log(`Error disconnection.\n${ex.stack}`); }
	}

	async requestHost(query, host) {
		let result = null;
		try {
			await this.connect(host);
			result = await this.pool.query(query);
		}
		catch (ex) { console.error(`Error query.\n${ex.stack}`); }
		finally {
			await this.disconnected();
			return result;
		}
	}

	async request(query) {
		const res_m = await this.requestHost(query, this.master);
		if (!res_m) {
			const res_s = await this.requestHost(query, this.slave);
			if (!res_s) {
				return null;
			}
			return res_s;
		}
		return res_m;
	}

	async requestWithValuesHost(query, values, host) {
		let result = null;
		try {
			await this.connect(host);
			result = await this.pool.query(query, values);
		}
		catch (ex) { console.log(`Error query.\n${ex.stack}`); }
		finally {
			await this.disconnected();
			return result;
		}
	}

	async requestWithValues(query, values) {
		const res_m = await this.requestWithValuesHost(query, values, this.master);
		if (!res_m) {
			const res_s = await this.requestWithValuesHost(query, values, this.slave);
			if (!res_s) {
				return null;
			}
			return res_s;
		}
		return res_m;
	}
}


const db = new PgSQL(CONFIG.MASTER, CONFIG.SLAVE);

(async () => {

	// const res = await db.request(`SELECT * FROM categories;`);
	// console.log(await db.request(`SELECT * FROM categories;`));
	// await db.connect();


	const date = new Date();
	console.log(date.toISOString());




})();