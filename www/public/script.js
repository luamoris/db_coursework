"use strict"

document.addEventListener('DOMContentLoaded', () => {

	const categories = document.querySelector("select[name='category']");
	const butSearchCategory = document.getElementById("search-category");
	const butSearchGoods = document.getElementById("search-goods");

	const ChartGoods = document.querySelector('#chart-goods');


	function addCategories() {
		const query = JSON.stringify({});
		let req = new XMLHttpRequest();
		req.open('POST', '/category', true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(query);
		req.addEventListener('load', () => {
			const res = JSON.parse(req.response);
			for (let i = 0; i < res.length; i++) {
				let option = document.createElement('option');
				option.value = res[i].id;
				option.innerText = res[i].category;
				if (i === 1) { option.selected = true; }
				categories.appendChild(option);
			}
		});
	}


	addCategories();
	butSearchCategory.addEventListener("click", SearchCategory);
	butSearchGoods.addEventListener("click", SearchGoods);

});



function SearchGoods(event) {
	event.preventDefault();
	const goods = document.querySelector("input[name='goods']");
	const options = {
		select: {
			unique: 'DISTINCT',
			id: true,
			title: true,
			price: true,
			date: true,
			category: true,
			url: true,
			goods_id: true,
		},
		restrictions: { limit: 10, offset: 0,},
		where: { goods_id: parseInt(goods.value) },
		order: { date: 'DESC' }
	};
	Search(event, options, res => {
		console.log(res);
	});
}

function SearchCategory(event) {
	event.preventDefault();
	const category = document.querySelector("select[name='category']")
	const price = document.querySelector("select[name='price']");
	const date = document.querySelector("select[name='date']");
	const options = {
		select: {
			unique: 'DISTINCT',
			id: true,
			title: true,
			price: true,
			date: true,
			category: true,
			url: true,
			goods_id: true,
		},
		restrictions: { limit: 10, offset: 0 },
		where: { category: category.value },
		order: { date: date.value, price: price.value }
	};
	Search(event, options, res => {
		const ChartCategory = document.querySelector('#ch');
		const ProductsList = document.querySelector('.products_list');
		ChartCategory.innerHTML = '';
		ProductsList.innerHTML = '';
		CreateChartCategory2('#ch', res);
		for (const p of res) { ProductsList.appendChild(createProductItem(p)); }
	});
}

function Search(event, options, handle) {
	const query = JSON.stringify(options);
	let req = new XMLHttpRequest();
	req.open('POST', '/search', true);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(query);
	req.addEventListener('load', () => {
		const res = JSON.parse(req.response);
		handle(res);
	});
}

function CreateChartCategory2(chart_id, data) {
	const margin = { top: 10, right: 40, bottom: 40, left: 40 };
	const width = 700 - margin.left - margin.right;
	const height = 470 - margin.top - margin.bottom;

	let svg = d3
		.select(chart_id)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	;


	let x = d3
		.scaleBand()
		.range([0, width])
		.padding(0.2)
	;

	let y = d3
		.scaleLinear()
		.range([height, 0])
	;

	let xAxis = svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
	;

	let yAxis = svg
		.append("g")
		.attr("class", "myYaxis")
	;

	// const data = [
	// 	{ group: "A", var1: 12, var2: 3},
	// 	{ group: "B", var1: 23, var2: 3 },
	// 	{ group: "C", var1: 4, var2: 3 },
	// 	{ group: "D", var1: 8, var2: 3 },
	// 	{ group: "E", var1: 9, var2: 3 },
	// 	{ group: "F", var1: 10, var2: 3 },
	// 	{ group: "G", var1: 2, var2: 3 },
	// 	{ group: "H", var1: 3, var2: 3 },
	// 	{ group: "I", var1: 12, var2: 3 },
	// 	{ group: "J", var1: 22, var2: 3 },
	// ];

	x.domain(data.map(function (d) { return d.goods_id.toString(); }))
	xAxis.transition().duration(1000).call(d3.axisBottom(x))

	y.domain([0, d3.max(data, function (d) { return +d.price })]);
	yAxis.transition().duration(1000).call(d3.axisLeft(y));

	let u = svg
		.selectAll("rect")
		.data(data)
	;

	u
		.enter()
		.append("rect")
		.merge(u)
		.transition()
		.duration(1000)
		.attr("x", function (d) { return x(d.goods_id.toString()); })
		.attr("y", function (d) { return y(d.price); })
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return height - y(d.price); })
		.attr("fill", "rgb(255 146 102)")
	;



}

function createProductItem(product) {
	const item_content_top = document.createElement('div');
		item_content_top.classList.add('item-content-top')
	const products_title = document.createElement('span');
		products_title.classList.add('products_title');
		products_title.innerText = product.title;
	const products_goods = document.createElement('span');
		products_goods.classList.add('products_goods');
		products_goods.innerText = 'id: ' + product.goods_id;
	item_content_top.appendChild(products_title);
	item_content_top.appendChild(products_goods);

	const item_content_bottom = document.createElement('div');
		item_content_bottom.classList.add('item-content-bottom')
	const products_price = document.createElement('span');
		products_price.classList.add('products_price');
		products_price.innerText = product.price + ' ₴';
	const products_date = document.createElement('span');
		products_date.classList.add('products_date');
		products_date.innerText = '[' + (new Date(product.date)).toLocaleDateString() + ']';
	item_content_bottom.appendChild(products_price);
	item_content_bottom.appendChild(products_date);

	const item_content = document.createElement('div');
		item_content.classList.add('item-content')
	item_content.appendChild(item_content_top);
	item_content.appendChild(item_content_bottom);

	const link = document.createElement('a');
		link.href = product.url;
		link.target = "_blank";
	link.appendChild(item_content);

	const products_item = document.createElement('li');
		products_item.classList.add('products_item');
	products_item.append(link);

	return products_item;
}
