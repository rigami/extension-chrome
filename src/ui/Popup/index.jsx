import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import InitAppProvider from '@/stores/InitApp';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as BaseStateProvider } from '@/stores/BaseStateProvider';
import { Provider as BookmarksProvider } from '@/stores/BookmarksProvider';
import { Provider as AppStateProvider } from '@/stores/AppStateProvider';
import PopupContent from './PopupEditor';

function Popup() {
    const [tabName, setTabName] = useState();
    const [tabUrl, setTabUrl] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [theme] = useState(localStorage.getItem('theme') === THEME.LIGHT ? lightTheme : darkTheme);

    useEffect(() => {
        if (!chrome?.tabs) {
            setIsLoading(false);
            return;
        }

        chrome.tabs.query({ active: true }, ([tab]) => {
            if (!tab) {
                setIsLoading(false);
                return;
            }

            console.log('Found tab', tab);

            setTabName(tab.title);
            setTabUrl(tab.url);
            setIsLoading(false);
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Nest
                components={[
                    ({ children }) => (<BaseStateProvider side={DESTINATION.POPUP}>{children}</BaseStateProvider>), InitAppProvider,
                    // AppStateProvider,
                    BookmarksProvider,
                ]}
            >
                {!isLoading && (<PopupContent tabName={tabName} tabUrl={tabUrl} />)}
            </Nest>
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
