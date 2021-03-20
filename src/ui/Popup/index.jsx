import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import useCoreService, { Provider as BaseStateProvider } from '@/stores/app/BaseStateProvider';
import { Provider as BookmarksProvider } from '@/stores/app/BookmarksProvider';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import initSentry from '@/config/sentry';
import * as Sentry from '@sentry/react';
import Stub from '@/ui-components/Stub';
import Nest from '@/utils/Nest';
import EditorBookmark from '@/ui/Bookmarks/EditBookmarkModal/Editor';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

initSentry(DESTINATION.POPUP);

const useStyles = makeStyles(() => ({
    editor: { padding: 0 },
    editorContent: {
        flexGrow: 1,
        borderRadius: 0,
    },
}));

function LoadStoreWait({ children }) {
    const coreService = useCoreService();

    if (coreService.appState === APP_STATE.WORK) {
        return children;
    }

    return null;
}

const ObserverLoadStoreWait = observer(LoadStoreWait);

function Popup() {
    const classes = useStyles();
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
        <Box
            width={680}
            minWidth={300}
            minHeight={400}
            display="flex"
        >
            <Nest
                components={[
                    ({ children }) => (<ThemeProvider theme={theme}>{children}</ThemeProvider>),
                    ({ children }) => (<BaseStateProvider side={DESTINATION.POPUP}>{children}</BaseStateProvider>),
                    ObserverLoadStoreWait,
                    BookmarksProvider,
                ]}
            >
                <CssBaseline />
                {!isLoading && (
                    <EditorBookmark
                        className={clsx(classes.editor)}
                        classes={{ editor: classes.editorContent }}
                        bringToEditorHeight
                        defaultName={tabName}
                        defaultUrl={tabUrl}
                        marginThreshold={0}
                        onSave={() => {}}
                    />
                )}
            </Nest>
            {isLoading && (
                <Stub message="Loading..." />
            )}
        </Box>
    );
}

const ProfilerPopup = Sentry.withProfiler(Popup);

render(<ProfilerPopup />, document.getElementById('root'));
