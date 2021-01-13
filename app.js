/*================================================

==================================================*/

const Needle = require('needle');
const Tress = require('tress');
const Cheerio = require('cheerio');
const fs = require('fs');
const resolve = require('url').resolve;


const result = [];
const query = Tress((types, callback) => {
	Needle.get(types.url, (err, res) => {
		if (err) { throw err; }
		const $ = Cheerio.load(res.body);
		$('.simple.r_box>a').each(function () {
			types.products.push({
				name: $(this).text(),
				url: $(this).attr('href'),
			});
		});
		result.push(types);
		callback();
	});
});

query.drain = () => {
	fs.writeFileSync('./data.json', JSON.stringify(result, null, 4));
};


const start = () => {
	const URL = 'https://agro-ukraine.com/';
	const typeURL = [];
	Needle.get(URL, (err, res) => {
		if (err) { throw err; }
		const $ = Cheerio.load(res.body);
		$('.r_c>.first_rubrics>a').each(function () {
			const types = {
				title: $(this).text(),
				url: URL + $(this).attr('href'),
				products: [],
			};
			typeURL.push(types);
		});
		query.push(typeURL);
	});
};

start();