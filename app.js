// Main App

/*=======================================
	Start
=======================================*/

const Show = require('./view/show');
Show.StartProcess();

/*======================================*/


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
