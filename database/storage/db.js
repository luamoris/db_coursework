// Storage: Database

/*------------------------------------*/
const PgSQL = require('../models/pgsql');
const fs = require('fs');
/*------------------------------------*/

class Database {

	constructor(config) {
		this.db = new PgSQL(config);
	}

	async insert(product) {
		const categoryId = await getCategoryid(this.db, product.category);
		const query = `INSERT INTO products(goods_id, title, price, availability, date, url, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
		const values = [product.goods, product.title, product.price, product.availability, product.date, product.url, categoryId];
		const res = await this.db.requestValue(query, values);
	}

	async insertData(path) {
		const buffer = fs.readFileSync(filaPath);
		const storage = JSON.parse(buffer);
		let i = 0;
		for (const item of storage) {
			await this.insert(item);
			console.log(++i);
		}
		console.log('\n\nDONE!\n\n');
	}
}

module.exports = Database;


async function getCategoryid(db, category) {
	let query = `SELECT id FROM categories WHERE category = $1`;
	let res = await db.requestValue(query, [category]);
	let categoryid = res.rowCount == 1 ? res.rows[0].id : null;
	if (!categoryid) {
		query = `INSERT INTO categories(category) VALUES ($1) RETURNING id`;
		categoryid = (await db.requestValue(query, [category])).rows[0].id;
	}
	return await categoryid;
}
