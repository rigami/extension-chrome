import React, { useEffect, useState } from 'react';
import {
    Button,
    Avatar,
    List,
    ListSubheader,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Fade,
    Collapse,
    Box,
} from '@material-ui/core';
import { PublicRounded as WebSiteIcon } from '@material-ui/icons';
import { AbortController } from '@/utils/xhrPromise';
import { getFaviconUrl, getSiteInfo, search } from '@/utils/siteSearch';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

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
    avatar: { minWidth: theme.spacing(4.5) },
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
    subheader: {
        backgroundColor: theme.palette.background.paper,
        top: 72,
    },
}));

function Search({ query = '', onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [timer, setTimer] = useState(undefined);
    const [globalResults, setGlobalResults] = React.useState([]);
    const [straightResults, setStraightResults] = React.useState(null);
    const [globalLoading, setGlobalLoading] = React.useState(false);
    const [straightLoading, setStraightLoading] = React.useState(false);
    const [controller, setController] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (option, forceAdded = false) => {
        onSelect({
            ...option,
            forceAdded,
        });
    };

    useEffect(() => {
        setStraightLoading(true);
        setGlobalLoading(true);
        if (controller) {
            controller.abort();
            setController(null);
        }
        if (timer) {
            clearTimeout(timer);
        }

        if (query.trim() === '') {
            setGlobalResults([]);
            setStraightResults(null);
            setStraightLoading(false);
            setGlobalLoading(false);
            setIsOpen(false);
            return;
        }

        setTimer(setTimeout(() => {
            setTimer(null);
            const controller = new AbortController();
            setController(controller);

            getSiteInfo(query.trim(), controller)
                .then((siteData) => {
                    setStraightResults({
                        ...siteData,
                        title: siteData.name,
                        url: siteData.url,
                    });
                })
                .catch(() => {
                    setStraightResults(null);
                })
                .finally(() => {
                    setIsOpen(true);
                    setStraightLoading(false);
                });

            search(query, controller)
                .then((foundResults) => {
                    setGlobalResults(foundResults);
                })
                .catch(() => {
                    setGlobalResults([]);
                })
                .finally(() => {
                    setIsOpen(true);
                    setGlobalLoading(false);
                });
        }, 1300));
    }, [query]);

    return (
        <Fade in={straightLoading || globalLoading || isOpen} unmountOnExit>
            <Box className={classes.root}>
                <Fade in={straightLoading && globalLoading}>
                    <Box className={clsx(classes.search)}>
                        {t('search')}
                        ...
                    </Box>
                </Fade>
                <Collapse in={(!globalLoading || !straightLoading) && isOpen}>
                    <List disablePadding>
                        <ListSubheader className={classes.subheader}>{t('bookmark.editor.searchURLTitle')}</ListSubheader>
                        {!straightLoading && straightResults && (
                            <ListItem
                                className={classes.row}
                                button
                                onClick={() => handleSelect(straightResults, true)}
                            >
                                <ListItemAvatar className={classes.avatar}>
                                    <Avatar
                                        variant="rounded"
                                        key={straightResults.url}
                                        src={getFaviconUrl(straightResults.url)}
                                        className={classes.favicon}
                                    >
                                        <WebSiteIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    classes={{
                                        primary: classes.overflowText,
                                        secondary: classes.overflowText,
                                    }}
                                    primary={straightResults.title}
                                    secondary={straightResults.url}
                                />
                            </ListItem>
                        )}
                        {!straightLoading && !straightResults && (
                            <ListItem>
                                {t('bookmark.editor.URLNotRecognize')}
                                <Button
                                    className={classes.forceAdd}
                                    onClick={() => onSelect({
                                        url: query,
                                        title: '',
                                    }, true)}
                                >
                                    {t('bookmark.editor.forceAddURL')}
                                </Button>
                            </ListItem>
                        )}
                        {straightLoading && (
                            <ListItem>
                                {t('search')}
                                ...
                            </ListItem>
                        )}
                        <ListSubheader className={classes.subheader}>{t('bookmark.editor.searchInWEBTitle')}</ListSubheader>
                        {!globalLoading && globalResults && globalResults.map((option) => (
                            <ListItem
                                className={classes.row}
                                divider
                                button
                                onClick={() => handleSelect(option)}
                            >
                                <ListItemAvatar className={classes.avatar}>
                                    <Avatar
                                        variant="rounded"
                                        key={option.url}
                                        src={getFaviconUrl(option.url)}
                                        className={classes.favicon}
                                    >
                                        <WebSiteIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    classes={{
                                        primary: classes.overflowText,
                                        secondary: classes.overflowText,
                                    }}
                                    primary={option.title}
                                    secondary={option.url}
                                />
                            </ListItem>
                        ))}
                        {!globalLoading && globalResults && globalResults.length === 0 && (
                            <ListItem>
                                {t('bookmark.editor.notFound')}
                            </ListItem>
                        )}
                        {globalLoading && (
                            <ListItem>
                                {t('search')}
                                ...
                            </ListItem>
                        )}
                    </List>
                </Collapse>
            </Box>
        </Fade>
    );
}

export default Search;
