import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Grid,
    Avatar,
    Container,
    Typography,
    TextField,
    Collapse,
    CircularProgress,
    List,
    ListSubheader,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Fade,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    PublicRounded as WebSiteIcon,
} from '@material-ui/icons';
import {AbortController} from "@/utils/xhrPromise";
import {getFaviconUrl, getSiteInfo, search} from "@/utils/siteSearch";
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
        maxWidth: 1044,
    },
    search: {
        padding: theme.spacing(2),
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

function SearchResults({ searchRequest = "", onSelect }) {
    const classes = useStyles();
    const [timer, setTimer] = useState(undefined);
    const [globalResults, setGlobalResults] = React.useState([]);
    const [straightResults, setStraightResults] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [controller, setController] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (option) => {
        setStraightResults(null);
        setGlobalResults([]);
        onSelect(option);
        setIsOpen(false);
    };

    useEffect(() => {
        setLoading(true);
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
            setLoading(false);
            setIsOpen(false);
            return;
        }

        setTimer(setTimeout(() => {
            setTimer(null);
            const controller = new AbortController();
            setController(controller);

            const results = {
                straight: 'pending',
                global: 'pending',
            };

            const checkResults = () => {
                if (results.straight === 'pending' || results.global === 'pending') return;

                setLoading(false);
                setIsOpen(true);
            };

            getSiteInfo(searchRequest.trim(), controller)
                .then((siteData) => {
                    results.straight = 'done';
                    setStraightResults({
                        ...siteData,
                        title: siteData.name,
                        url: searchRequest.trim(),
                    });
                    setIsOpen(true);
                })
                .catch(() => {
                    results.straight = 'failed';
                    setStraightResults(null);
                })
                .finally(checkResults);

            search(searchRequest, controller)
                .then((foundResults) => {
                    results.global = 'done';
                    if (foundResults.length !== 0) {
                        setGlobalResults(foundResults.map((result, index) => ({
                            ...result,
                            id: `global-result-${index}`,
                        })).reverse());
                    } else {
                        setGlobalResults([]);
                    }
                    setIsOpen(true);
                })
                .catch(() => {
                    results.global = 'failed';
                    setGlobalResults([]);
                })
                .finally(checkResults);
        }, 1300));
    }, [searchRequest]);

    return (
        <React.Fragment>
            <Fade in={loading} unmountOnExit>
                <Card className={clsx(classes.root, classes.search)} elevation={8}>
                    Поиск...
                </Card>
            </Fade>
            <Fade in={!loading && isOpen} unmountOnExit>
                <Card className={classes.root} elevation={8}>
                    <List disablePadding>
                        <ListSubheader>Поиск в сети</ListSubheader>
                        {globalResults && globalResults.map((option) => (
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
                        <ListSubheader>Прямое поиск</ListSubheader>
                        {straightResults && (
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
                        {!straightResults && (
                            <ListItem>
                                Адрес не распознан
                                <Button>
                                    Все равно добавить
                                </Button>
                            </ListItem>
                        )}
                    </List>
                </Card>
            </Fade>
        </React.Fragment>
    );
}

export default SearchResults;
