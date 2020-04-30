module.exports = (prefix = './') => ({
	'react': 'preact/compat',
	'react-dom': 'preact/compat',
	'@': `${prefix}`,
});
