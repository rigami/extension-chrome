import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Avatar,
    List,
    ListSubheader,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Fade,
    Collapse,
} from '@material-ui/core';
import {
    PublicRounded as WebSiteIcon,
} from '@material-ui/icons';
import {AbortController} from "@/utils/xhrPromise";
import {getFaviconUrl, getSiteInfo, search} from "@/utils/siteSearch";
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(2),
        maxWidth: 1044,
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
    avatar: {
        minWidth: theme.spacing(4.5),
    },
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    overflowText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
}));

function SearchResults({ searchRequest = "", onSelect, onClick }) {
    const classes = useStyles();
    const [timer, setTimer] = useState(undefined);
    const [globalResults, setGlobalResults] = React.useState([]);
    const [straightResults, setStraightResults] = React.useState(null);
    const [globalLoading, setGlobalLoading] = React.useState(true);
    const [straightLoading, setStraightLoading] = React.useState(true);
    const [controller, setController] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (option) => {
        setStraightResults(null);
        setGlobalResults([]);
        onSelect(option);
        setIsOpen(false);
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

        if (searchRequest.trim() === '') {
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

            getSiteInfo(searchRequest.trim(), controller)
                .then((siteData) => {
                    setStraightResults({
                        ...siteData,
                        title: siteData.name,
                        url: searchRequest.trim(),
                    });
                })
                .catch(() => {
                    setStraightResults(null);
                })
                .finally(() => {
                    setIsOpen(true);
                    setStraightLoading(false);
                });

            search(searchRequest, controller)
                .then((foundResults) => {
                    setGlobalResults(foundResults.reverse());
                })
                .catch(() => {
                    setGlobalResults([]);
                })
                .finally(() => {
                    setIsOpen(true);
                    setGlobalLoading(false);
                });
        }, 1300));
    }, [searchRequest]);

    return (
        <Fade in={straightLoading || globalLoading || isOpen} unmountOnExit>
            <Card elevation={8} className={classes.root} onMouseDown={onClick}>
                <Collapse in={!globalLoading || !straightLoading}>
                    <List disablePadding>
                        <ListSubheader>Поиск в сети</ListSubheader>
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
                                        <WebSiteIcon/>
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
                                Ничего не нейдено
                            </ListItem>
                        )}
                        {globalLoading && (
                            <ListItem>
                                Поиск...
                            </ListItem>
                        )}
                        <ListSubheader>Прямой поиск</ListSubheader>
                        {!straightLoading && straightResults && (
                            <ListItem
                                className={classes.row}
                                button
                                onClick={() => handleSelect(straightResults)}
                            >
                                <ListItemAvatar className={classes.avatar}>
                                    <Avatar
                                        variant="rounded"
                                        key={straightResults.url}
                                        src={getFaviconUrl(straightResults.url)}
                                        className={classes.favicon}
                                    >
                                        <WebSiteIcon/>
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
                                Адрес не распознан
                                <Button>
                                    Все равно добавить
                                </Button>
                            </ListItem>
                        )}
                        {straightLoading && (
                            <ListItem>
                                Поиск...
                            </ListItem>
                        )}
                    </List>
                </Collapse>
                <Fade in={straightLoading && globalLoading}>
                    <Card className={clsx(classes.search)} elevation={8} onMouseDown={onClick}>
                        Поиск...
                    </Card>
                </Fade>
            </Card>
        </Fade>
    );
}

export default SearchResults;
