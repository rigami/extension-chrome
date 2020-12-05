import React from 'react';
import { Observer } from 'mobx-react-lite';

function ObserverComponent({ children }) {
    return (
        <Observer>
            {() => (
                <React.Fragment>
                    {children}
                </React.Fragment>
            )}
        </Observer>
    );
}

export default ObserverComponent;
