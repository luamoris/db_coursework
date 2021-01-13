// Main app

/*----------------------------------------------*/
const Database = require('./database/storage/db');
const config = require('./database/configs/pg');
const fs = require('fs');
/*----------------------------------------------*/


/*=======================================
	Constants
=======================================*/

const path = '../data/data.json';


/*=======================================
	Start
=======================================*/

(async () => {

	const db = await new Database(config);
	db.insertData(path);
})();


