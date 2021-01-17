// Controller

/*----------------------------------------------*/
const Database = require('../database/storage/db')
const config = require('../database/configs/server');

const Colors = require('colors');
/*----------------------------------------------*/


/*=======================================
	Constants
=======================================*/

const db = new Database(config);

/*=====================================*/

module.exports = {

	async products(input) {
		const res = await db.getAllProduct(input, { id: 'ASC', date: 'DESC' });
		const products = res.rows;
		print(products);
	},

	async categories(input) {
		const limit = input.limit ? input.limit : 0;
		const offset = input.offset ? input.offset : 0;
		const res = await db.getAllCategories(limit, offset);
		const categories = res.rows;
		print(categories);
	},

	async insert(input) {
		console.log('\nSTART\n'.green);
		await db.insertData(input);
		console.log('\nDONE!\n'.green);
	},

	async search(input) {
		const set = {
			select: {
				unique: 'DISTINCT',
				id: true,
				title: true,
				price: true,
				date: true,
				category: true,
				goods_id: true,
			}
		}

		let isRestrictions = false;
		if (input.restrictions.limit) { 
			if (!isRestrictions) { set.restrictions = {}; }
			set.restrictions.limit = input.restrictions.limit
			isRestrictions = true;
		}
		if (input.restrictions.offset) { 
			if (!isRestrictions) { set.restrictions = {}; }
			set.restrictions.offset = input.restrictions.offset
			isRestrictions = true;
		}

		let isWhere = false;
		if (input.where.category) { 
			if (!isWhere) { set.where = {}; }
			set.where.category = input.where.category
			isWhere = true;
		}
		if (input.where.goods_id) { 
			if (!isWhere) { set.where = {}; }
			set.where.goods_id = input.where.goods_id
			set.select.url = true;
			isWhere = true;
		}
		if (input.where.price) {
			if (!isWhere) { set.where = {}; }
			set.where.price = input.where.price
			isWhere = true;
		}

		let isOrder = false;
		if (input.order.price) {
			if (!isOrder) { set.order = {}; }
			set.order.price = input.order.price;
			isOrder = true;
		}
		if (input.order.date) {
			if (!isOrder) { set.order = {}; }
			set.order.date = input.order.date;
			isOrder = true;
		}

		const res = await db.getSearchProduct(set);
		const products = res.rows;
		print(products);
	}

};


/*=====================================*/

function print(date) {
	if (date.length > 0) { console.table(date); }
	else { console.log('\nThere is nothing!\nTry again.\n'.red) }
}

function printExplain(explain) {
	console.log(`\n=> ${explain.green}\n`.green);
}
