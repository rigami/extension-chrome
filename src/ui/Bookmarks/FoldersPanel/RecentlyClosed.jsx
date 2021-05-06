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
    }));

    const getAllTabs = async () => {
        const queryOptions = { maxResults: max };
        const sessions = await new Promise((resolve) => chrome.sessions.getRecentlyClosed(queryOptions, resolve));

        console.log('recently closed:', sessions);

        store.sessions = sessions.map(({ tab }) => tab).filter((isExist) => isExist);
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
                            {store.sessions.slice(offset, offset + max).map((tab) => (
                                <Item
                                    key={tab.id}
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
                                    level={disableItemOffset ? null : 0}
                                    className={clsx(disableItemOffset && classes.disableItemOffset)}
                                />
                            ))}
                            {store.sessions.length > (offset + max) && overloadContent}
                        </List>
                    )}
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
                                    More
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
