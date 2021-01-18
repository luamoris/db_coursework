
/*=======================================================
	Require
=========================================================*/

const Controller = require('../controllers/controller');
const Router = require('../routers/router');


/*=======================================================
	Global Variables
=========================================================*/

const commands = {
	product: ['products', {
		l: '-l',
		f: '-f',
	}],
	category: ['categories', {
		l: '-l',
		f: '-f',
	}],
	search: ['search', {
		l: '-l', // limit
		f: '-f', // offset
		c: '-c', // category
		g: '-g', // goods_id
		p: '-p', // price (number, interval format 12-14)
		obp: '-obp', // prica (ASC, DESC)
		obd: '-obd', // date (ASC, DESC)
	}],
	insert: 'insert',
	exit: {
		word: 'exit',
		null: '',
	}
};

const router = new Router();
router.use(commands.product[0], Controller.products);
router.use(commands.category[0], Controller.categories);
router.use(commands.search[0], Controller.search);
router.use(commands.insert, Controller.insert);

const path = './data/data.json';


/*=======================================================
	Start
=========================================================*/

function StartProcess() {
	process.stdin.on('data', Execute);
	process.stdout.write('\ncommand: '.cyan);
}

function EndProcess() {
	console.log("\nBye!\n".yellow);
	process.exit(0);
}


/*=======================================================
	Main
=========================================================*/

module.exports = {
	StartProcess,
}



/*=======================================================
	Functions
=========================================================*/

async function Execute(data) {
	const text = data.toString().trim();
	const parts = text.split(' ');
	const com = (parts.slice(0, 1)).join('');
	const params = parts.slice(1, parts.length);

	let input = null;
	input = com === commands.product[0] ? ModelInput(params) : input;
	input = com === commands.category[0] ? ModelInput(params) : input;
	input = com === commands.search[0] ? SearchProductInput(params) : input;
	input = com === commands.insert && params.length === 0 ? path : input;

	// console.clear();
	if ((com === commands.exit.word && input === null) || com === commands.exit.null) { EndProcess(); }
	else {
		if (input === null) { console.error('\nError with parameters.\n') }
		else { await router.handle(com, input); }
		process.stdout.write('command: '.cyan);
	}
}




function ModelInput(input) {
	const res = {};
	if (input.length > 0 && input.length % 2 != 0) { return null; }
	else if (input.length != 0) {
		const titles = input.filter((item, index) => index % 2 === 0);
		const values = input.filter((item, index) => index % 2 === 1);
		for (let i = 0; i < titles.length; i++) {
			if (isNaN(values[i])) { return null; }
			if (titles[i] == commands.product[1].l) { res.limit = values[i]; }
			else if (titles[i] == commands.product[1].f) { res.offset = values[i]; }
			else { return null; }
		}
	}
	return res;
}

function SearchProductInput(input) {
	const res = {};
	res.restrictions = {};
	res.where = {};
	res.order = {};
	if (input.length > 0 && input.length % 2 != 0) { return null; }
	else if (input.length != 0) {
		const titles = input.filter((item, index) => index % 2 === 0);
		const values = input.filter((item, index) => index % 2 === 1);
		for (let i = 0; i < titles.length; i++) {
			if (isNaN(values[i])) {
				if (values[i] === 'DESC' || values[i] === 'ASC') {
					if (titles[i] == commands.search[1].obp) { res.order.price = values[i]; }
					else if (titles[i] == commands.search[1].obd) { res.order.date = values[i]; }
					else { return null; }
				}
				else if (titles[i] == commands.search[1].p && values[i].indexOf('-') != -1 && values[i].indexOf('-') === values[i].lastIndexOf('-')) {
					const arrPrice = values[i].split('-');
					if (isNaN(arrPrice[0])) { return null; }
					if (isNaN(arrPrice[1])) { return null; }
					res.where.price = arrPrice.map(x => parseInt(x));
				}
				else { return null; }
			}
			else if (titles[i] == commands.search[1].l) { res.restrictions.limit = values[i]; }
			else if (titles[i] == commands.search[1].f) { res.restrictions.offset = values[i]; }
			else if (titles[i] == commands.search[1].c) { res.where.category = values[i]; }
			else if (titles[i] == commands.search[1].g) { res.where.goods_id = values[i]; }
			else if (titles[i] == commands.search[1].p) { res.where.price = [parseInt(values[i])]; }
			else { return null; }
		}
	}
	if (!res.where.category && !res.where.goods_id) { return null; }
	return res;
}


/*--------------------------END--------------------------*/