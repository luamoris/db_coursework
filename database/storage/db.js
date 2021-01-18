// Storage: Database

/*------------------------------------*/
const PgSQL = require('../models/pgsql');
const fs = require('fs');
/*------------------------------------*/

class Database {

	constructor(config) {
		this.db = new PgSQL(config.MASTER, config.SLAVE);
		this.EXPLAIN = [];
	}

	async insert(product) {
		const categoryId = await getCategoryid(this.db, product.category);
		const query = `INSERT INTO products(goods_id, title, price, availability, date, url, category_id) VALUES ($1, $2, $3, $4, $5::timestamp, $6, $7)`;
		const values = [product.goods, product.title, product.price, product.availability, product.date, product.url, categoryId];
		const res = await this.db.requestWithValues(query, values);
	}

	async insertData(path) {
		const storage = await parseJSON(path);
		let i = 0;
		for (const item of storage) {
			await this.insert(item);
			console.log(++i);
		}
		// for(let j = 0; j < 10; j++) {
		// 	await this.insert(storage[j]);
		// 	console.log(j + 1);
		// }
	}

	async getAllProduct(restrictions, order) {
		const query = createQuery({
			select: {
				unique: 'DISTINCT',
				id: true,
				title: true,
				price: true,
				date: true,
				category: true,
				goods_id: true,
			},
			restrictions,
			order,
		});
		const res = await this.db.request(query);
		return res;
	}

	async getAllCategories(limit = 0, offset = 0) {
		const query = `SELECT * FROM categories` + ` ORDER BY category` + (limit != 0 ? ` LIMIT ${limit}` : '') + (offset != 0 ? ` OFFSET ${offset}` : '') + ';';
		const res = await this.db.request(query);
		return res;
	}

	async getSearchProduct(options) {
		const query = createQuery(options);
		await this.getQueryTime(options);
		const res = await this.db.request(query);
		return res;
	}

	async getQueryTime(options) {
		options.explain = true;
		options.scan = {};
		options.scan.seqscan = true;
		options.scan.bitmapscan = false;

		let query = createQuery(options);
		const seq = await this.db.request(query);

		options.scan.seqscan = false;
		options.scan.bitmapscan = true;

		query = createQuery(options);
		const index = await this.db.request(query);

		this.EXPLAIN.push({ seq: getTimeExplain(seq), index: getTimeExplain(index) });
	}

}

async function parseJSON(path) {
	const buffer = fs.readFileSync(path);
	const storage = await JSON.parse(buffer);
	return await storage;
}

module.exports = Database;


async function getCategoryid(db, category) {
	let query = `SELECT id FROM categories WHERE category = $1`;
	let res = await db.requestWithValues(query, [category]);
	let categoryid = res.rowCount == 1 ? res.rows[0].id : null;
	if (!categoryid) {
		query = `INSERT INTO categories(category) VALUES ($1) RETURNING id`;
		categoryid = (await db.requestWithValues(query, [category])).rows[0].id;
	}
	return await categoryid;
}

function createQuery(options) {
	const scan = options.scan ? `SET enable_seqscan = ${options.scan.seqscan === true ? 'ON' : 'OFF'}; SET enable_bitmapscan = ${options.scan.bitmapscan === true ? 'ON' : 'OFF'}; SET enable_indexscan = ${options.scan.bitmapscan === true ? 'ON' : 'OFF'};` : ``;
	const explain = options.explain ? `EXPLAIN ANALYZE` : ``;

	let select = options.select ? 'SELECT' : `SELECT *`;
	let isAttr = false;
	if (options.select) {
		select += options.select.unique ? ' ' + options.select.unique : '';
		select += (isAttr && options.select.id ? ',' : '') + (options.select.id ? ' products.id' : '');
		isAttr = options.select.id ? true : isAttr;
		select += (isAttr && options.select.title  ? ',' : '') + (options.select.title ? ' products.title' : '');
		isAttr = options.select.title ? true : isAttr;
		select += (isAttr && options.select.price ? ',' : '') + (options.select.price ? ' products.price' : '');
		isAttr = options.select.price ? true : isAttr;
		select += (isAttr && options.select.availability ? ',' : '') + (options.select.availability ? ' products.availability' : '');
		isAttr = options.select.availability ? true : isAttr;
		select += (isAttr && options.select.date ? ',' : '') + (options.select.date ? ' products.date' : '');
		isAttr = options.select.data ? true : isAttr;
		select += (isAttr && options.select.url ? ',' : '') + (options.select.url ? ' products.url' : '');
		isAttr = options.select.url ? true : isAttr;
		select += (isAttr && options.select.category ? ',' : '') + (options.select.category ? ` categories.category || '(' || products.category_id || ')' AS category` : '');
		isAttr = options.select.category ? true : isAttr;
		select += (isAttr && options.select.goods_id ? ',' : '') + (options.select.goods_id ? ' products.goods_id' : '');
		isAttr = options.select.goods_id ? true : isAttr;
	}
	select += ` FROM products INNER JOIN categories ON products.category_id = categories.id`

	let where = options.where ? 'WHERE' : '';
	let isWhere = false;
	if (options.where) {
		where += (isWhere && options.where.date ? ' AND' : '') + (options.where.date && options.where.date.length === 1 ? ` products.date = '${createDate(options.where.date[0])}'::timestamp` : (options.where.date && options.where.date.length === 2 ? ` products.date BETWEEN '${createDate(options.where.date[0])}'::timestamp AND '${createDate(options.where.date[1])}'::timestamp` : ''));
		isWhere = options.where.date ? true : isWhere;
		where += (isWhere && options.where.price ? ' AND' : '') + (options.where.price && options.where.price.length === 1 ? ` products.price = ${options.where.price[0]}` : (options.where.price && options.where.price.length === 2 ? ` products.price BETWEEN ${options.where.price[0]} AND ${options.where.price[1]}` : ''));
		isWhere = options.where.price ? true : isWhere;
		where += (isWhere && options.where.goods_id ? ' AND' : '') + (options.where.goods_id ? ` products.goods_id = ${options.where.goods_id}` : '');
		isWhere = options.where.goods_id ? true : isWhere;
		where += (isWhere && options.where.category ? ' AND' : '') + (options.where.category ? ` products.category_id = ${options.where.category}` : '');
		isWhere = options.where.category ? true : isWhere;
	}

	let order = options.order ? 'ORDER BY' : '';
	let isOrder = false;
	if (options.order) {
		order += (isOrder && options.order.id ? ',' : '') + (options.order.id ? ` products.id ${options.order.id}` : '');
		isOrder = options.order.id ? true : isOrder;
		order += (isOrder && options.order.price ? ',' : '') + (options.order.price ? ` products.price ${options.order.price}` : '');
		isOrder = options.order.price ? true : isOrder;
		order += (isOrder && options.order.date ? ',' : '') + (options.order.date ? ` products.date ${options.order.date}` : '');
		isOrder = options.order.date ? true : isOrder;
		order += (isOrder && options.order.category ? ',' : '') + (options.order.category ? ` products.category_id ${options.order.category}` : '');
		isOrder = options.order.category ? true : isOrder;
	}

	const limit = (options.restrictions && options.restrictions.limit ? `LIMIT ${options.restrictions.limit}` : '');
	const offset = (options.restrictions && options.restrictions.offset ? `OFFSET ${options.restrictions.offset}` : '');

	return `${scan ? scan + ' ' : ''}${explain ? explain + ' ' : ''}${select}${where ? ' ' + where : ''}${order ? ' ' + order : ''}${limit ? ' ' + limit : ''}${offset ? ' ' + offset : ''};`;
}

function createDate(date) {
	const month = date.month ? (date.month >= 10 ? date.month : ('0' + date.month)) : '01';
	const day = date.day ? (date.day >= 10 ? date.day : ('0' + date.day)) : '01';
	const fullDate = `${date.year}-${month}-${day}`;
	const d = new Date(fullDate);
	return d.toISOString();
}

function getTimeExplain(res) {
	const rows = res[res.length - 1].rows;
	const plan = rows[rows.length - 1]['QUERY PLAN'];
	return plan.slice(16, plan.length);
}
