const merge = (parent, ...childs) => {
	const mergeObject = { ...parent };

	childs.forEach((child) => {
		for (const key in child) {
			if (!Object.prototype.hasOwnProperty.call(child, key)) continue;

			if (mergeObject[key] && typeof child[key] === 'object' && typeof mergeObject[key] === 'object') {
				mergeObject[key] = merge(mergeObject[key], child[key]);
			} else {
				mergeObject[key] = child[key];
			}
		}
	});

	return mergeObject;
};

export default merge;
