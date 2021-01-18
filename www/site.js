
const server = {
	hostname: 'localhost',
	port: 3000,
}


const Express = require('express');
const Consolidate = require('consolidate');
const Path = require('path');


const Database = require('../database/storage/db')
const config = require('../database/configs/server');



/*================================================================================================================
Variables
==================================================================================================================*/

const app = Express();
const db = new Database(config);

// path
const views = Path.join(__dirname, 'views');


/*================================================================================================================
Main
==================================================================================================================*/

app.use(Express.static('www/public'));
app.engine('html', Consolidate.swig);
app.set('views', views);
app.set('view engine', 'html');

const jsonParser = Express.json();



// http
app.get("/", async (req, res) => {
	res.render('index');
});

app.post("/category", jsonParser, async (req, res) => {
	if (!req.body) return res.sendStatus(400);
	const limit = req.body.limit ? req.body.limit : 0;
	const offset = req.body.offset ? req.body.offset : 0;
	const result = await db.getAllCategories(limit, offset);
	res.end(JSON.stringify(result.rows));
});

app.post("/product", jsonParser, async (req, res) => {
	if (!req.body) return res.sendStatus(400);
	const result = await db.getAllProduct(req.body, { id: 'ASC', date: 'DESC' });
	res.end(JSON.stringify(result.rows));
});

app.post("/search", jsonParser, async (req, res) => {
	if (!req.body) return res.sendStatus(400);
	const result = await db.getSearchProduct(req.body);
	res.end(JSON.stringify(result.rows));
});

app.post("/explain", jsonParser, async (req, res) => {
	if(!req.body) return res.sendStatus(400);
	res.end(JSON.stringify(db.EXPLAIN));
});

app.use((err, req, res, next) => { console.log(`On error: ${err.message}`); });

// start
app.listen(server.port, server.hostname, () => {
	console.log(`The server is listening at http://${server.hostname}:${server.port}`);
});