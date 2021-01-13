// Model: Product

class Product {
	constructor(id, goods, title, price, availability, date, url, category) {
		this.id = id;
		this.goods = goods;
		this.title = title;
		this.price = price;
		this.availability = availability;
		this.date = date;
		this.url = url;
		this.category = category;
	}
}

module.exports = Product;