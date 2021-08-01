import React from 'react';

function Nest({ components, children }) {
    return components.reverse().reduce((acc, ComponentProvider) => (
        <ComponentProvider>{acc}</ComponentProvider>
    ), children);
}

export default Nest;
