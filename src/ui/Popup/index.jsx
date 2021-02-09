import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import useCoreService, { Provider as BaseStateProvider } from '@/stores/app/BaseStateProvider';
import { Provider as BookmarksProvider } from '@/stores/app/BookmarksProvider';
import PopupContent from './PopupEditor';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';

function LoadStoreWait({ children }) {
    const coreService = useCoreService();

    if (coreService.appState === APP_STATE.WORK) {
        return children;
    }

    return null;
}

const ObserverLoadStoreWait = observer(LoadStoreWait);

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
            {!isLoading && (
                <BaseStateProvider side={DESTINATION.POPUP}>
                    <ObserverLoadStoreWait>
                        <BookmarksProvider>
                            <PopupContent tabName={tabName} tabUrl={tabUrl} />
                        </BookmarksProvider>
                    </ObserverLoadStoreWait>
                </BaseStateProvider>
            )}
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
