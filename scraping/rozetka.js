// Web-site rozenka.com scraping 

/*------------------------------------*/
const Product = require('../database/models/product');

const Needle = require('needle');
const Tress = require('tress');
const Cheerio = require('cheerio');
const fs = require('fs');
/*------------------------------------*/

/*=======================================
	Constants
=======================================*/

const URL = 'https://rozetka.com.ua/';
const path = 'data/data.json';
const results = [];

const query = Tress(GetProducts, 7);
query.drain = Done;


/*=======================================
	Functions
=======================================*/

function GetMenu(url, callback) {
	Needle.get(url, (err, res) => {
		if (err) throw err;
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
					0,
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
	fs.writeFileSync(path, JSON.stringify(results, null, 4));
}

/*=======================================
	Main
=======================================*/

GetMenu(URL, GetCategories);