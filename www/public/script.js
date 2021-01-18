"use strict"

document.addEventListener('DOMContentLoaded', () => {

	const categories = document.querySelector("select[name='category']");
	const butSearchCategory = document.getElementById("search-category");
	const butSearchGoods = document.getElementById("search-goods");
	const butSearchExplain = document.getElementById("search-explain");

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
	butSearchExplain.addEventListener("click", SearchExplain);

});



function SearchExplain(event) {
	event.preventDefault();
	Search('/explain', {}, res => {
		const ChartGoods = document.querySelector('#chart-goods');
		const Product = document.querySelector('.product');
		ChartGoods.innerHTML = '';
		Product.innerHTML = '';
		console.log(res);
		CreateChartExplain('#chart-goods', res);
	});
}


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
	Search('/search', options, res => {
		const ChartGoods = document.querySelector('#chart-goods');
		const Product = document.querySelector('.product');
		ChartGoods.innerHTML = '';
		Product.innerHTML = '';
		CreateChartOfProduct('#chart-goods', res);
		Product.appendChild(createProductItemFull(res[0]));
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
	Search('/search', options, res => {
		const ChartCategory = document.querySelector('#chart-category');
		const ProductsList = document.querySelector('.products_list');
		ChartCategory.innerHTML = '';
		ProductsList.innerHTML = '';
		CreateChartCategory('#chart-category', res);
		for (const p of res) { ProductsList.appendChild(createProductItem(p)); }
		ProductsList.parentElement.scrollTop = 0;
	});
}

function Search(post, options, handle) {
	const query = JSON.stringify(options);
	let req = new XMLHttpRequest();
	req.open('POST', post, true);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(query);
	req.addEventListener('load', () => {
		const res = JSON.parse(req.response);
		handle(res);
	});
}

function CreateChartCategory(chart_id, data) {
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
		.attr("x", function (d) { return x(d.goods_id.toString()); })
		.attr("y", function (d) { return y('0'); })
		.transition()
		.duration(1000)
		.attr("y", function (d) { return y(d.price); })
		.attr("width", x.bandwidth())
		.attr("height", function (d) { return height - y(d.price); })
		.attr("fill", "rgba(255, 146, 102, 0.9)")
	;

	let Tooltip = d3
		.select(chart_id)
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("top", "0px")
		.style("left", "0px")
		.style("background-color", "#434343")
		.style("color", "white")
		.style("border-width", "2px")
		.style("border-radius", "3px")
		.style("padding", "5px")
		.style("font-family", "system-ui")
		;

	let mouseover = d => { Tooltip.style("opacity", 1); };

	let mousemove = d => {
		Tooltip
			.html(`${d.title}.<br><br>Price: ${d.price} ₴`)
			.style('width', '150px')
			.style("left", (d3.event.pageX + 20) + "px")
			.style("top", (d3.event.pageY) + "px")
			;
	};

	let mouseleave = d => { Tooltip.style("opacity", 0); };

	svg
		.selectAll("rect")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave)
	;

	svg
		.selectAll("text")
		.attr("fill", "#c6c6c6")
		.attr("font-size", "10px")
		;

	svg
		.selectAll("line")
		.attr("stroke", "#c6c6c6")
		;

}

function CreateChartOfProduct(chart_id, data) {
	const margin = { top: 10, right: 40, bottom: 40, left: 40 };
	const width = 700 - margin.left - margin.right;
	const height = 470 - margin.top - margin.bottom;

	let svg = d3
		.select(chart_id)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")")
	;

	data.map(d => { d.date = d3.timeParse("%Y-%m-%d")((d.date.split('T'))[0]) })

	let x = d3
		.scaleTime()
		.domain(d3.extent(data, function (d) { return d.date; }))
		.range([0, width])
	;

	let y = d3
		.scaleLinear()
		.domain([0, d3.max(data, function (d) { return + d.price })])
		.range([height, 0])
	;

	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
	;

	svg
		.append("g")
		.call(d3.axisLeft(y))
	;

	svg
		.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "tomato")
		.attr("stroke-width", 2)
		.attr("d", d3.line()
			.curve(d3.curveBasis)
			.x(function (d) { return x(d.date) })
			.y(function (d) { return y(d.price) })
		)
	;

	let Tooltip = d3
		.select(chart_id)
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("top", "0px")
		.style("left", "0px")
		.style("background-color", "#434343")
		.style("color", "white")
		.style("border-width", "2px")
		.style("border-radius", "3px")
		.style("padding", "5px")
	;

	let mouseover = d => { Tooltip.style("opacity", 1); };

	let mousemove = d => {
		Tooltip
			.html(d.price + " ₴")
			.style("left", (d3.event.pageX + 20) + "px")
			.style("top", (d3.event.pageY) + "px")
		;
	};

	let mouseleave = d => { Tooltip.style("opacity", 0); };

	svg
		.append("g")
		.selectAll("dot")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "myCircle")
		.attr("cx", function (d) { return x(d.date) })
		.attr("cy", function (d) { return y(d.price) })
		.attr("r", 8)
		.attr("stroke", "white")
		.attr("stroke-width", 3)
		.attr("fill", "tomato")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave)
	;

	svg
		.selectAll("text")
		.attr("fill", "#c6c6c6")
		.attr("font-size", "10px")
	;

	svg
		.selectAll("line")
		.attr("stroke", "#c6c6c6")
	;

}

function CreateChartExplain(chart_id, data) {
	if (data.length < 2) return;
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


	let parsems = str => { return parseFloat(str.slice(0, str.length - 2).trim()) };
	data.map(x => { x.seq = parsems(x.seq); x.index = parsems(x.index); });

	let allGroup = ["seq", "index"];

	let dataReady = allGroup.map(grpName => {
		return {
			name: grpName,
			values: data.map(function (d, id) {
				return { id: id + 1, value: d[grpName] };
			})
		};
	});

	let myColor = d3
		.scaleOrdinal()
		.domain(allGroup)
		.range(["orange", "steelblue"])
	;

	let x = d3
		.scaleLinear()
		.domain([0, data.length + 1])
		.range([0, width])
	;

	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
	;

	let y = d3
		.scaleLinear()
		.domain([0, d3.max(data, function (d) { return d.seq > d.index ? + d.seq : d.index; })])
		.range([height, 0])
	;

	svg
		.append("g")
		.call(d3.axisLeft(y))
	;

	let line = d3
		.line()
		.x(function (d) { return x(+d.id) })
		.y(function (d) { return y(+d.value) })
	;

	svg
		.selectAll("myLines")
		.data(dataReady)
		.enter()
		.append("path")
		.attr("d", function (d) { return line(d.values) })
		.attr("stroke", function (d) { return myColor(d.name) })
		.style("stroke-width", 4)
		.style("fill", "none")
	;

	svg
		.selectAll("myDots")
		.data(dataReady)
		.enter()
		.append('g')
		.style("fill", function (d) { return myColor(d.name) })
		.selectAll("myPoints")
		.data(function (d) { return d.values })
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.id) })
		.attr("cy", function (d) { return y(d.value) })
		.attr("r", 5)
		.attr("stroke", "white")
	;

	svg
		.selectAll("myLabels")
		.data(dataReady)
		.enter()
		.append('g')
		.append("text")
		.datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; }) 
		.attr("transform", function (d) { return "translate(" + x(d.value.id) + "," + y(d.value.value) + ")"; }) 
		.attr("x", 12) 
		.text(function (d) { return d.name; })
		.style("fill", function (d) { return myColor(d.name) })
		.style("font-size", 15)
	;

	svg
		.selectAll("text")
		.attr("fill", "#c6c6c6")
		.attr("font-size", "10px")
		;

	svg
		.selectAll("line")
		.attr("stroke", "#c6c6c6")
		;

}

function createItemContent(product) {
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

	return item_content;
}

function createProductItem(product) {
	const item_content = createItemContent(product);

	const link = document.createElement('a');
		link.href = product.url;
		link.target = "_blank";
	link.appendChild(item_content);

	const products_item = document.createElement('li');
		products_item.classList.add('products_item');
	products_item.append(link);

	return products_item;
}

function createProductItemFull(product) {
	const link = document.createElement('a');
		link.href = product.url;
		link.target = '_blank';
	const link_text = document.createElement('span');
		link_text.innerText = 'Приобрести';
	link.appendChild(link_text);

	const img = document.createElement('div');
	img.classList.add('products_img');

	const item_content = createItemContent(product);
	item_content.appendChild(link);
	item_content.appendChild(img);

	return item_content;
}

