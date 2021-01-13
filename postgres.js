
const { Pool } = require('pg');

class Postgres {

	constructor(config) {
		this.config = config;
		this.pool = null;
	}

	async connect() {
		try { this.pool = await new Pool(this.config); }
		catch (ex) { console.log(`Error connection.\n${ex.stack}`); }
	}

	async disconnected() {
		try { await this.pool.end(); }
		catch (ex) { console.log(`Error disconnection.\n${ex.stack}`); }
	}

	async request(query) {
		let result = null;
		try {
			await this.connect();
			result = await this.pool.query(query);
		}
		catch (ex) { console.log(`Error query.\n${ex.stack}`); }
		finally {
			await this.disconnected();
			return result;
		}
	}

	async requestValue(query, values) {
		let result = null;
		try {
			await this.connect();
			result = await this.pool.query(query, values);
		}
		catch (ex) { console.log(`Error query.\n${ex.stack}`); }
		finally {
			await this.disconnected();
			return result;
		}
	}

	async requestWithoutCatch(query) {
		let result = null;
		try {
			await this.connect();
			result = await this.pool.query(query);
		}
		catch (ex) { throw ex; }
		finally {
			await this.disconnected();
			return result;
		}
	}

}

module.exports = Postgres;