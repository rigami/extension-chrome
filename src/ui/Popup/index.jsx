import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import ConfigurationApp from '@/ui/ConfigurationApp';
import { THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as AppConfigProvider } from '@/stores/app';
import { Provider as BookmarksProvider } from '@/stores/bookmarks';
import PopupContent from './PopupEditor';


function Popup() {
    const [theme, setTheme] = useState(localStorage.getItem('app_theme'));
    const [tabName, setTabName] = useState();
    const [tabUrl, setTabUrl] = useState();
    const [isLoading, setIsLoading] = useState(true);

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
        <ThemeProvider theme={theme === THEME.DARK ? darkTheme : lightTheme}>
            <CssBaseline />
            <Nest components={[
                ConfigurationApp,
                ({ children }) => (
                    <AppConfigProvider onTheme={() => setTheme(localStorage.getItem('app_theme'))}>
                        {children}
                    </AppConfigProvider>
                ),
                BookmarksProvider,
            ]}
            >
                {!isLoading && (
                    <PopupContent tabName={tabName} tabUrl={tabUrl} />
                )}
            </Nest>
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
