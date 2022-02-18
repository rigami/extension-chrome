import React, { useEffect } from 'react';
import {
    History as EmptyHistoryIcon,
    Launch as OpenWindowIcon,
} from '@material-ui/icons';
import { Box, Button, List } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import Stub from '@/ui-components/Stub';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import HistoryRecord from './HistoryRecord';
import SessionRecord from './SessionRecord';

const useStyles = makeStyles((theme) => ({
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    action: {
        display: 'none',
        marginLeft: theme.spacing(0.5),
    },
    dialog: {
        minWidth: 320,
        maxWidth: 400,
        width: 400,
        minHeight: 400,
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    itemOffset: { paddingLeft: theme.spacing(2) },
    dialogAction: { borderRadius: theme.shape.borderRadiusButton },
}));

function ListRecentlyClosed(props) {
    const {
        offset = 0,
        max = 8,
        disablePadding = false,
        overloadContent,
    } = props;
    const { t } = useTranslation(['session']);
    const classes = useStyles();
    const store = useLocalObservable(() => ({
        loading: true,
        sessions: [],
        openWindowSession: null,
        anchorEl: null,
    }));

    const getAllTabs = async () => {
        const queryOptions = { maxResults: max };
        const sessions = await new Promise((resolve) => chrome.sessions.getRecentlyClosed(queryOptions, resolve));

        console.log('recently closed:', sessions);

        store.sessions = sessions.map(({ tab, window }) => {
            if (window?.sessionId && store.openWindowSession?.sessionId) {
                store.openWindowSession = {
                    ...window,
                    sessionId: window.sessionId,
                    type: 'window',
                };
            }

            return ({
                tab,
                window,
                sessionId: tab ? tab.sessionId : window.sessionId,
                type: tab ? 'tab' : 'window',
            });
        });
        store.loading = false;
    };

    useEffect(() => {
        getAllTabs();

        chrome.sessions.onChanged.addListener(getAllTabs);

        return () => chrome.sessions.onChanged.removeListener(getAllTabs);
    }, []);

    console.log('store.sessions:', store.sessions);

    return (
        <Box component="li" className={classes.listContainer}>
            {store.sessions.length === 0 && !store.loading && (
                <Stub
                    icon={EmptyHistoryIcon}
                    message={t('recentlyClosed.empty')}
                />
            )}
            {store.sessions.length > 0 && !store.loading && (
                <List dense disablePadding={disablePadding} className={classes.list}>
                    {
                        store.sessions
                            .slice(offset, offset + max)
                            .map(({ window: windowSession, tab, ...session }) => (session.type === 'window' ? (
                                <SessionRecord
                                    key={session.sessionId}
                                    selected={store.openWindowSession?.sessionId === session.sessionId}
                                    onClick={(event) => {
                                        store.openWindowSession = {
                                            ...windowSession,
                                            ...session,
                                        };
                                        store.anchorEl = event.currentTarget;
                                    }}
                                    size={windowSession.tabs.length}
                                />
                            ) : (
                                <HistoryRecord
                                    key={tab.sessionId}
                                    sessionId={tab.sessionId}
                                    url={tab.url}
                                    favIconUrl={tab.favIconUrl}
                                    title={tab.title}
                                />
                            )))
                    }
                    {store.sessions.length > (offset + max) && overloadContent}
                </List>
            )}
            <PopperDialog
                open={store.anchorEl}
                onClose={() => {
                    store.anchorEl = null;
                }}
                onExited={() => {
                    store.openWindowSession = null;
                }}
                anchorEl={store.anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{ className: classes.dialog }}
            >
                <PopoverDialogHeader
                    title={t(
                        'recentlyClosed.windowSessionTitle',
                        { count: store.openWindowSession?.tabs?.length },
                    )}
                    action={(
                        <Button
                            color="primary"
                            endIcon={(<OpenWindowIcon />)}
                            onClick={() => {
                                store.anchorEl = null;
                                chrome.sessions.restore(store.openWindowSession?.sessionId);
                            }}
                            className={classes.dialogAction}
                        >
                            {t('recentlyClosed.restoreWindow')}
                        </Button>
                    )}
                />
                <List dense className={classes.list}>
                    {store.openWindowSession?.tabs.map((tab) => (
                        <HistoryRecord
                            key={tab.sessionId}
                            sessionId={tab.sessionId}
                            url={tab.url}
                            favIconUrl={tab.favIconUrl}
                            title={tab.title}
                        />
                    ))}
                </List>
            </PopperDialog>
        </Box>
    );
}

export default observer(ListRecentlyClosed);
