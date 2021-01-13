/*================================================

==================================================*/

const Needle = require('needle');
const Tress = require('tress');
const Cheerio = require('cheerio');
const fs = require('fs');

const Product = require('./product');

/*----------------------------------------------
------------------------------------------------*/

// database
const config = {
	host: 'localhost',
	port: 5432,
	user: 'postgres',
	password: 'qjcbr0509',
	database: 'Products'
};

const Postgres = require('./postgres');

class Database {

	constructor(config) {
		this.db = new Postgres(config);
	}

	async insert(product) {
		const categoryid = await getCategoryid(this.db, product.category);
		const query = `INSERT INTO products(id, title, price, availability, date, url, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
		const values = [product.id, product.title, product.price, product.availability, product.date, product.url, categoryid];
		const res = await this.db.requestValue(query, values);
	}
}

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


(async () => {
	const db = await new Database(config);

	const filaPath = './data.json';
	const buffer = fs.readFileSync(filaPath);
	const storage = JSON.parse(buffer);
	let i = 0;

	// for(let i = 0; i < storage.length; i++)
	// {
	// 	if (storage[i].id === 107804316)
	// 	{
	// 		console.log('id: ', i);
	// 		console.log(storage[i]);
	// 	}
	// }

	/*
	for(const item of storage) {
		await db.insert(item);
		console.log(++i);
	}
	*/
	console.log('\n\nDONE!\n\n');
})();





/*----------------------------------------------
------------------------------------------------*/


const URL = 'https://rozetka.com.ua/';
const results = [];

const query = Tress(GetProducts, 7);
query.drain = Done;

/*
	1. Выбрать категорию
	2. Выбрать подкатегорию
	3. Извлечь продукты из под категории
	4. Вернуться в подкатегории
	5. Вернуться в категории
*/

function GetMenu(url, callback) {
	Needle.get(url, (err, res) => {
		if(err) throw err;
		const $ = Cheerio.load(res.body);
		$('.menu-categories__item>a')
			.each(function () {
				const menu = {
					group: $(this).text().trim(),
					url: $(this).attr('href'),
				}
				callback(menu, GetProducts);
			})
	})
}

function GetCategories(menu) {
	Needle.get(menu.url, (err, res) => {
		if (err) throw err;
		const $ = Cheerio.load(res.body);
		$('.tile-cats>.tile-cats__heading')
			.each(function () {
				query.push({
					category: $(this).text().trim(),
					url: $(this).attr('href'),
				});
			});
	});
}


function GetProducts(category, callback) {
	Needle.get(category.url, (err, res) => {
		if (err) { throw err; }
		const $ = Cheerio.load(res.body);
		$('.goods-tile__inner')
			.each(async function () {
				const product = await new Product(
					parseInt($(this).attr('data-goods-id')),
					$(this).find('.goods-tile__heading').attr('title'),
					parseInt($(this).find('.goods-tile__price>p').text().replace(/\s+/g, '').replace(/\₴$/, '')),
					$(this).find('.goods-tile__availability').text().trim() === 'Нет в наличии' ? false : true,
					new Date(),
					$(this).find('.goods-tile__heading').attr('href'),
					category.category
				);
				results.push(product);
				console.log(product);
			});
		callback();
	});
}


function Done() {
	fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}

GetMenu(URL, GetCategories);