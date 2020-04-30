import React from 'preact/compat';
import { h } from 'preact';

function Nest({ components, children }) {
	return components.reverse().reduce((acc, ComponentProvider) => (
		<ComponentProvider>{acc}</ComponentProvider>
	), children);
}

export default Nest;
