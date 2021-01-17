// Model: PostgresSQL

/*------------------------------------*/
const { Pool, Client } = require('pg');
/*------------------------------------*/

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

module.exports = PgSQL;