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
import asyncAction from '@/utils/asyncAction';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { first } from 'lodash';
import { captureException } from '@sentry/react';

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
    const [bookmark, setBookmark] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!chrome?.tabs) {
            setIsLoading(false);
            return;
        }

        asyncAction(async () => {
            const data = {};

            await new Promise((resolve, reject) => chrome.tabs.query({ active: true }, ([tab]) => {
                if (!tab) {
                    reject();
                    return;
                }

                data.url = tab.url;
                data.name = tab.title;
                resolve();
            }));

            const res = await BookmarksUniversalService.query(new SearchQuery({ query: data.url }));

            if (res.best && res.best.length !== 0) {
                data.id = first(res.best)?.id;
            }

            setBookmark(data);
            setIsLoading(false);
        }).catch((e) => {
            captureException(e);
            console.error(e);
            setIsLoading(false);
        });
    }, []);

    return (
        <React.Fragment>
            {!isLoading && (
                <EditorBookmark
                    className={clsx(classes.editor)}
                    classes={{ editor: classes.editorContent }}
                    bringToEditorHeight
                    editBookmarkId={bookmark.id}
                    defaultName={bookmark.name}
                    defaultUrl={bookmark.url}
                    marginThreshold={0}
                    onSave={() => {}}
                />
            )}
            {isLoading && (
                <Stub message="Loading..." />
            )}
        </React.Fragment>
    );
}

function PopupRoot() {
    const [theme] = useState(localStorage.getItem('theme') === THEME.LIGHT ? lightTheme : darkTheme);

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
                <Popup />
            </Nest>
        </Box>
    );
}

const ProfilerPopup = Sentry.withProfiler(PopupRoot);

render(<ProfilerPopup />, document.getElementById('root'));
