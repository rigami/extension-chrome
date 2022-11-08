import React, { useEffect, useState } from 'react';
import {
    Avatar,
    List,
    ListSubheader,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Fade,
    Collapse,
    Box,
    Divider,
} from '@material-ui/core';
import { PublicRounded as WebSiteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { captureException } from '@sentry/react';
import { getFaviconUrl } from '@/utils/localSiteParse';
import { getSiteInfoLocal, search } from '../utils/siteSearch';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
        minHeight: 72,
        margin: theme.spacing(0, -2),
    },
    search: {
        padding: theme.spacing(2),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
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
    subheader: { color: theme.palette.text.secondary },
    stub: { minHeight: 72 },
}));

function Search({ query = '', onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark', 'common']);
    const [timer, setTimer] = useState(undefined);
    const [globalResults, setGlobalResults] = React.useState([]);
    const [straightResults, setStraightResults] = React.useState(null);
    const [globalLoading, setGlobalLoading] = React.useState(false);
    const [straightLoading, setStraightLoading] = React.useState(false);
    const [controller, setController] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (option, allowChangeUrl = false) => {
        onSelect({
            ...option,
            allowChangeUrl,
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

            getSiteInfoLocal(query.trim())
                .then((siteData) => {
                    setStraightResults({ ...siteData });
                })
                .catch((e) => {
                    captureException(e);
                    setStraightResults(null);
                })
                .finally(() => {
                    setIsOpen(true);
                    setStraightLoading(false);
                });

            search(query.trim())
                .then((foundResults) => {
                    setGlobalResults(foundResults);
                })
                .catch((e) => {
                    captureException(e);
                    setGlobalResults([]);
                })
                .finally(() => {
                    setIsOpen(true);
                    setGlobalLoading(false);
                });
        }, 700));
    }, [query]);

    return (
        <Fade in={straightLoading || globalLoading || isOpen} unmountOnExit>
            <Box className={classes.root}>
                <Divider />
                <Fade in={straightLoading && globalLoading}>
                    <Box className={clsx(classes.search, classes.stub)}>
                        {t('common:search')}
                    </Box>
                </Fade>
                <Collapse in={(!globalLoading || !straightLoading) && isOpen}>
                    <List disablePadding>
                        <ListSubheader className={classes.subheader} disableSticky>
                            {t('editor.search', { context: 'url' })}
                        </ListSubheader>
                        {!straightLoading && straightResults && (
                            <React.Fragment>
                                {straightResults.baseUrl !== straightResults.url && (
                                    <ListItem
                                        className={classes.row}
                                        button
                                        onClick={() => handleSelect({
                                            ...straightResults,
                                            url: straightResults.baseUrl,
                                        }, false)}
                                    >
                                        <ListItemAvatar className={classes.avatar}>
                                            <Avatar
                                                variant="rounded"
                                                src={getFaviconUrl(straightResults.baseUrl)}
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
                                            secondary={straightResults.baseUrl}
                                        />
                                    </ListItem>
                                )}
                                <ListItem
                                    className={classes.row}
                                    button
                                    onClick={() => handleSelect(straightResults, true)}
                                >
                                    <ListItemAvatar className={classes.avatar}>
                                        <Avatar
                                            variant="rounded"
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
                            </React.Fragment>
                        )}
                        {!straightLoading && !straightResults && (
                            <ListItem className={classes.stub}>
                                {t('editor.search.urlNotRecognize')}
                            </ListItem>
                        )}
                        {straightLoading && (
                            <ListItem className={classes.stub}>
                                {t('common:search')}
                            </ListItem>
                        )}
                        <ListSubheader className={classes.subheader} disableSticky>
                            {t('editor.search', { context: 'web' })}
                        </ListSubheader>
                        {!globalLoading && globalResults && globalResults.map((option) => (
                            <ListItem
                                key={option.url + option.title}
                                className={classes.row}
                                divider
                                button
                                onClick={() => handleSelect(option, false)}
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
                            <ListItem className={classes.stub}>
                                {t('common:nothingFound')}
                            </ListItem>
                        )}
                        {globalLoading && (
                            <ListItem className={classes.stub}>
                                {t('common:search')}
                            </ListItem>
                        )}
                    </List>
                </Collapse>
            </Box>
        </Fade>
    );
}

export default Search;
