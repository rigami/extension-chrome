import React, {useState, useEffect} from 'react';
import {
    TextField,
    CircularProgress,
    Grid,
    Typography,
    Avatar,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import siteSearch, {getFaviconUrl, AbortController, checkExistSite} from "@/utils/siteSearch";
import Autocomplete, {createFilterOptions} from "@material-ui/lab/Autocomplete";
import {PublicRounded as WebSiteIcon} from '@material-ui/icons';
import allLocale from '@/i18n/RU';

const locale = allLocale.settings.bookmarks.editModal;

const useStyles = makeStyles((theme) => ({
    favicon: {
        color: '#505050',
        marginRight: theme.spacing(2),
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
        // border: `1px solid ${theme.palette.common.white}`,
    },
    faviconGlobal: {
        color: '#505050',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
    },
    input: {
        padding: 0,
        paddingRight: theme.spacing(2),
    },
    progressIcon: {
        marginLeft: theme.spacing(2),
    },
    row: {
        flexWrap: 'nowrap',
    },
    textBlock: {
        overflow: 'hidden',
    },
    title: {
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        flexGrow: 0,
    },
    url: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));


function SearchField({className: externalClassName, value: defaultValue, onChange}) {
    const classes = useStyles();
    const [timer, setTimer] = useState(undefined);
    const [searchResults, setSearchResults] = React.useState({
        straight: {type: 'straight', status: 'pending'},
        global: []
    });
    const [loading, setLoading] = React.useState(false);
    const [controller, setController] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [value, setValue] = React.useState('');

    const filterOptions = createFilterOptions({
        stringify: () => value,
    });

    const handleSearch = (event) => {
        setLoading(true);
        const inputValue = event.target.value;
        if (controller) {
            controller.abort();
            setController(null);
        }
        if (timer) {
            clearTimeout(timer);
        }

        if (inputValue.trim() === '') {
            setSearchResults({straight: {type: 'straight', status: 'pending'}, global: []});
            setLoading(false);
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
            };

            checkExistSite(inputValue, controller)
                .then((siteData) => {
                    results.straight = 'done';
                    setSearchResults((oldValue) => ({
                        ...oldValue,
                        straight: {
                            ...siteData,
                            title: siteData.name,
                            url: inputValue,
                            type: 'straight',
                            status: "done",
                        },
                    }));
                    setIsOpen(true);
                })
                .catch(() => {
                    results.straight = 'failed';
                    setSearchResults((oldValue) => ({
                        ...oldValue,
                        straight: {
                            type: 'straight',
                            status: "failed",
                        },
                    }));
                })
                .finally(checkResults);

            siteSearch(inputValue, controller)
                .then((foundResults) => {
                    results.global = 'done';
                    if (foundResults.length !== 0) {
                        setSearchResults((oldValue) => ({
                            ...oldValue,
                            global: foundResults.map((result) => ({
                                ...result,
                                type: 'global',
                                status: "done",
                            })),
                        }));
                    } else {
                        setSearchResults((oldValue) => ({
                            ...oldValue,
                            global: [
                                {
                                    type: 'global',
                                    status: "failed",
                                },
                            ],
                        }));
                    }
                    setIsOpen(true);
                })
                .catch(() => {
                    results.global = 'failed';
                    setSearchResults((oldValue) => ({
                        ...oldValue,
                        global: [
                            {
                                type: 'global',
                                status: "failed",
                            },
                        ],
                    }));
                })
                .finally(checkResults);
        }, 1300));

        setValue(inputValue);
    };

    const resetForm = () => {
        setIsOpen(false);
        setSearchResults({straight: {type: 'straight', status: 'pending'}, global: []});
        setLoading(false);
        setValue(defaultValue);
        if (controller) {
            controller.abort();
            setController(null);
        }
        if (timer) {
            clearTimeout(timer);
        }
    };

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <Autocomplete
            fullWidth
            open={isOpen}
            inputValue={value}
            onClose={resetForm}
            onChange={(event, option) => onChange(option.url)}
            getOptionDisabled={(option) => option.status !== 'done'}
            getOptionSelected={(option, value) => option.title === value.title}
            getOptionLabel={(option) => option.url}
            autoHighlight
            groupBy={(option) => locale.group[option.type] || option.type}
            noOptionsText={(
                <Grid container alignItems="center">
                    <Grid item xs>
                        <span style={{fontWeight: 700}}>
                            Ничего не найдено
                        </span>
                    </Grid>
                </Grid>
            )}
            renderOption={(option) => {
                if (option.status === 'failed') {
                    return (
                        <Grid container alignItems="center">
                            <Grid item xs>
                                <span style={{fontWeight: 700}}>
                                    Ничего не найдено
                                </span>
                            </Grid>
                        </Grid>
                    );
                }
                if (option.status === 'pending') {
                    return (
                        <Grid container alignItems="center">
                            <Grid item xs>
                                <span style={{fontWeight: 700}}>
                                    Загрузка
                                </span>
                            </Grid>
                        </Grid>
                    );
                }
                return (
                    <Grid container alignItems="center" className={classes.row}>
                        <Grid item>
                            <Avatar
                                key={option.url}
                                src={getFaviconUrl(option.url)}
                                className={classes.favicon}
                            >
                                <WebSiteIcon/>
                            </Avatar>
                        </Grid>
                        <Grid item xs className={classes.textBlock}>
                            <span style={{fontWeight: 700}} className={classes.title}>
                              {option.title}
                            </span>
                            <Typography variant="body2" color="textSecondary" className={classes.url}>
                                {option.url}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            }}
            options={[searchResults.straight, ...searchResults.global]}
            filterOptions={filterOptions}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Запрос или URL адрес"
                    variant="outlined"
                    className={externalClassName}
                    onChange={handleSearch}
                    onBlur={resetForm}
                    InputProps={{
                        ...params.InputProps,
                        className: classes.input,
                        startAdornment: (
                            defaultValue && !loading && !isOpen && (
                                <Avatar
                                    key={defaultValue}
                                    src={getFaviconUrl(defaultValue)}
                                    className={classes.faviconGlobal}
                                >
                                    <WebSiteIcon/>
                                </Avatar>
                            )
                        ),
                        endAdornment: (
                            loading && (
                                <CircularProgress
                                    color="inherit"
                                    size={20}
                                    className={classes.progressIcon}
                                />
                            )
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchField;
