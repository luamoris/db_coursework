// Main app

/*----------------------------------------------*/
const Database = require('./database/storage/db');
const config = require('./database/configs/pg');
const fs = require('fs');
/*----------------------------------------------*/


/*=======================================
	Constants
=======================================*/

const path = './data/data.json';


/*=======================================
	Start
=======================================*/



const options = {
	scan: {
		seqscan: true,
		bitmapscan: false,
	},
	explain: true,
	select: {
		unique: 'DISTINCT',
		id: true,
		title: true,
		price: true,
		availability: true,
		data: true,
		url: true,
		category: true,
		goods_id: true,
	},
	restrictions: {
		limit: 10,
		offset: 0
	},
	where: {
		date: [
			{
				year: 2021,
				month: 1,
				day: 13,
			},
			{
				year: 2021,
				month: 1,
				day: 14,
			},
		],
		price: [12, 24],
		goods_id: 10,
		category: 138,
	},
	order: {
		price: 'DESC',
		date: 'DESC',
		category: 'ASC'
	}
}


async function start() {

	// await db.insertData(path);

	// const res = await db.getAll(10, { price: 'DESC', date: 'DESC' })

	const res = await db.getSearch({
		select: {
			unique: 'DISTINCT',
			id: true,
			title: true,
			price: true,
			date: true,
			category: true,
			goods_id: true,
		},
		restrictions: {
			limit: 10,
		},
		where: {
			category: 528, // 401 - 619
		},
		order: {
			price: 'DESC',
			date: 'DESC'
		}
	});
	console.table(res.rows);
}

const db = new Database(config);
start();