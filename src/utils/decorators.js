export const queuingDecorator = (func) => {
	const queue = [];
	let pendingPromise = false;

	const runQueue = () => {
		if (pendingPromise) {
			console.log('Queue is pending. Wait...');
			return;
		}

		if (queue.length === 0) {
			console.log('End queue');
			return;
		}

		pendingPromise = true;
		console.log('Calc from queue');
		queue.shift()().finally(() => {
			console.log('Calc!');
			pendingPromise = false;
			runQueue();
		});
	};

	return (x) => new Promise((resolve) => {
		console.log('Add to queue for file:', x);
		queue.push(() => func(x).finally(resolve));

		runQueue();
	});
};

export const cachingDecorator = (func) => {
	const cache = new Map();

	return (x) => {
		if (cache.has(x)) {
			console.log('FROM CACHE');
			return cache.get(x);
		}

		const result = func(x);
		console.log('CALC');

		cache.set(x, result);
		return result;
	};
};
