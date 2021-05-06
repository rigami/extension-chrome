import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable, Observer } from 'mobx-react-lite';
import {
    Box,
    List,
    Avatar,
    CardActions,
    Button,
    Tooltip,
} from '@material-ui/core';
import {
    PublicRounded as WebSiteIcon,
    UnfoldLess as LessIcon,
    UnfoldMore as MoreIcon,
    History as EmptyHistoryIcon,
    ArrowForward as OpenIcon,
    TabRounded as WindowSessionIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Item, ItemAction } from '@/ui/Bookmarks/FoldersPanel/Item';
import Subheader from '@/ui/Bookmarks/FoldersPanel/Subheader';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import Stub from '@/ui-components/Stub';
import clsx from 'clsx';
import { getFaviconUrl } from '@/utils/siteSearch';
import useCoreService from '@/stores/app/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    subheader: { '&:hover $action': { display: 'flex' } },
    action: { display: 'none' },
    dialog: {
        maxWidth: 400,
        width: '100%',
        minHeight: 400,
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    disableItemOffset: { paddingLeft: theme.spacing(2) },
    actions: { padding: '0px 22px' },
}));

function RecentlyClosedList(props) {
    const {
        offset = 0,
        max = 8,
        disableItemOffset = false,
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

        store.sessions = sessions.map(({ tab, window }) => ({
            tab,
            window,
            sessionId: tab ? tab.sessionId : window.sessionId,
            type: tab ? 'tab' : 'window',
        }));
        store.loading = false;
    };

    useEffect(() => {
        getAllTabs();

        chrome.sessions.onChanged.addListener(getAllTabs);

        return () => chrome.sessions.onChanged.removeListener(getAllTabs);
    }, []);

    return (
        <Observer>
            {() => (
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
                                        <Item
                                            key={session.sessionId}
                                            button
                                            selected={store.openWindowSession?.sessionId === session.sessionId}
                                            onClick={(event) => {
                                                store.openWindowSession = {
                                                    ...windowSession,
                                                    ...session,
                                                };
                                                store.anchorEl = event.currentTarget;

                                                console.log('store.openWindowSession:', store.openWindowSession);
                                            }}
                                            icon={(
                                                <WindowSessionIcon className={classes.favicon} />
                                            )}
                                            title={`${windowSession.tabs.length} tabs`}
                                            level={disableItemOffset ? null : 0}
                                            className={clsx(disableItemOffset && classes.disableItemOffset)}
                                        />
                                    ) : (
                                        <Item
                                            key={session.sessionId}
                                            button
                                            onClick={() => { chrome.sessions.restore(session.sessionId); }}
                                            icon={(
                                                <Avatar
                                                    variant="rounded"
                                                    src={tab.favIconUrl || getFaviconUrl(tab.url)}
                                                    className={classes.favicon}
                                                >
                                                    <WebSiteIcon />
                                                </Avatar>
                                            )}
                                            title={tab.title || tab.url || 'Unknown tab'}
                                            level={disableItemOffset ? null : 0}
                                            className={clsx(disableItemOffset && classes.disableItemOffset)}
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
                        <PopoverDialogHeader title={`${store.openWindowSession?.tabs?.length} tabs`} />
                        <List dense className={classes.list}>
                            {store.openWindowSession?.tabs.map((tab) => (
                                <Item
                                    key={tab.sessionId}
                                    button
                                    onClick={() => { chrome.sessions.restore(tab.sessionId); }}
                                    icon={(
                                        <Avatar
                                            variant="rounded"
                                            src={tab.favIconUrl || getFaviconUrl(tab.url)}
                                            className={classes.favicon}
                                        >
                                            <WebSiteIcon />
                                        </Avatar>
                                    )}
                                    title={tab.title || tab.url || 'Unknown tab'}
                                    level={null}
                                    className={classes.disableItemOffset}
                                />
                            ))}
                        </List>
                    </PopperDialog>
                </Box>
            )}
        </Observer>
    );
}

function RecentlyClosed({ className: externalClassName }) {
    const { t } = useTranslation(['session']);
    const classes = useStyles();
    const coreService = useCoreService();
    const subheaderRef = useRef();
    const store = useLocalObservable(() => ({
        expand: typeof coreService.storage.persistent.expandRecentlyClosed === 'undefined'
            ? true
            : coreService.storage.persistent.expandRecentlyClosed,
        openPopover: false,
        anchorEl: null,
    }));

    return (
        <Box className={externalClassName}>
            <List dense>
                <Subheader
                    ref={subheaderRef}
                    title={t('recentlyClosed.title')}
                    className={classes.subheader}
                    disableButton={store.expand}
                    selected={store.openPopover && !store.expand}
                    onClick={(event) => {
                        if (!store.expand) {
                            store.anchorEl = event.currentTarget;
                            store.openPopover = !store.openPopover;
                        }
                    }}
                    actions={(
                        <React.Fragment>
                            <Tooltip title={store.expand ? t('recentlyClosed.collapse') : t('recentlyClosed.expand')}>
                                <ItemAction
                                    className={classes.action}
                                    onClick={() => {
                                        store.expand = !store.expand;
                                        coreService.storage.updatePersistent({ expandRecentlyClosed: store.expand });
                                    }}
                                >
                                    {open ? <LessIcon /> : <MoreIcon />}
                                </ItemAction>
                            </Tooltip>
                        </React.Fragment>
                    )}
                />
                {store.expand && (
                    <RecentlyClosedList
                        max={6}
                        disablePadding
                        overloadContent={(
                            <CardActions className={classes.actions}>
                                <Button
                                    color="primary"
                                    endIcon={(<OpenIcon />)}
                                    onClick={(event) => {
                                        store.anchorEl = event.currentTarget;
                                        store.openPopover = true;
                                    }}
                                >
                                    {t('common:button.more')}
                                </Button>
                            </CardActions>
                        )}
                    />
                )}
            </List>
            <PopperDialog
                open={store.openPopover}
                onClose={() => { store.openPopover = false; }}
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
                <PopoverDialogHeader title={t('recentlyClosed.title')} />
                <RecentlyClosedList offset={store.expand ? 6 : 0} max={25} disableItemOffset />
            </PopperDialog>
        </Box>
    );
}

export default observer(RecentlyClosed);
