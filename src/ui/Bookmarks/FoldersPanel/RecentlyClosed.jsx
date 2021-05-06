import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    Box,
    List,
    Avatar, Collapse,
} from '@material-ui/core';
import { PublicRounded as WebSiteIcon, UnfoldLess as LessIcon, UnfoldMore as MoreIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Item, ItemAction } from '@/ui/Bookmarks/FoldersPanel/Item';
import Subheader from '@/ui/Bookmarks/FoldersPanel/Subheader';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
        minHeight: 52,
    },
    search: {
        padding: theme.spacing(2),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    avatar: { minWidth: theme.spacing(3) },
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    overflowText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    forceAdd: { marginLeft: theme.spacing(2) },
    primary: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 550,
    },
    subheader: { '&:hover $action': { display: 'flex' } },
    action: { display: 'none' },
}));

function RecentlyClosed({ className: externalClassName }) {
    const { t } = useTranslation(['session']);
    const classes = useStyles();
    const store = useLocalObservable(() => ({
        sessions: [],
        expand: true,
    }));

    const getAllTabs = async () => {
        const queryOptions = { maxResults: 8 };
        const sessions = await new Promise((resolve) => chrome.sessions.getRecentlyClosed(queryOptions, resolve));

        console.log('recently closed:', sessions);

        store.sessions = sessions.slice(0, 8).map(({ tab }) => tab).filter((isExist) => isExist);
    };

    useEffect(() => {
        if (!store.expand) return () => {};

        getAllTabs();

        chrome.sessions.onChanged.addListener(getAllTabs);

        return () => chrome.sessions.onChanged.removeListener(getAllTabs);
    }, [store.expand]);

    return (
        <Box className={externalClassName}>
            <List dense>
                <Subheader
                    title={t('recentlyClosed.title')}
                    className={classes.subheader}
                    disableButton={store.expand}
                    actions={(
                        <React.Fragment>
                            <ItemAction
                                className={classes.action}
                                onClick={() => { store.expand = !store.expand; }}
                            >
                                {open ? <LessIcon /> : <MoreIcon />}
                            </ItemAction>
                        </React.Fragment>
                    )}
                />
                <Collapse in={store.expand} unmountOnExit>
                    {store.sessions.map((tab) => (
                        <Item
                            key={tab.id}
                            button
                            onClick={() => { chrome.sessions.restore(tab.sessionId); }}
                            icon={(
                                <Avatar
                                    variant="rounded"
                                    src={tab.favIconUrl}
                                    className={classes.favicon}
                                >
                                    <WebSiteIcon />
                                </Avatar>
                            )}
                            title={tab.title || tab.url || 'Unknown tab'}
                        />
                    ))}
                </Collapse>
            </List>
        </Box>
    );
}

export default observer(RecentlyClosed);
