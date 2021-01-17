// Router

class Router {

	constructor() {
		this.router = {};
	}

	use(command, executor) {
		this.router[command] = executor;
	}

	async handle(command, input = '') {
		const executor = this.router[command];
		if (executor) {
			await executor(input);
		} else {
			console.log(`\nRouter executor not found: '${command}'\n`);
		}
	}

};

module.exports = Router;