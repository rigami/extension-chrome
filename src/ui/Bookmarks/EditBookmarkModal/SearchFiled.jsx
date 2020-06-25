import React, { useState, useEffect } from 'react';
import {
    TextField,
    CircularProgress,
    Grid,
    Typography,
    Avatar,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import siteSearch, { getFaviconUrl, AbortController } from "@/utils/siteSearch";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { PublicRounded as WebSiteIcon } from '@material-ui/icons';
import clsx from 'clsx';

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
    favicon: {
        color: '#505050',
        marginRight: theme.spacing(2),
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
        // border: `1px solid ${theme.palette.common.white}`,
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


function SearchField({ className: externalClassName, value: defaultValue, onChange }) {
    const classes = useStyles();
    const [timer, setTimer] = useState(undefined);
    const [options, setOptions] = React.useState([]);
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
            setOptions([]);
            setLoading(false);
            return;
        }

        setTimer(setTimeout(() => {
            setTimer(null);
            const controller = new AbortController();
            setController(controller);

            siteSearch(inputValue, controller)
                .then((results) => {
                    console.log(`Find for ${inputValue}:`, results)
                    setOptions(results);
                    setLoading(false);
                    setIsOpen(true);
                });
        }, 1300));

        setValue(inputValue);
    };

    return (
        <Autocomplete
            fullWidth
            open={isOpen}
            onClose={() => {
                setIsOpen(false);
                setOptions([]);
                setLoading(false);
                if (controller) {
                    controller.abort();
                    setController(null);
                }
                if (timer) {
                    clearTimeout(timer);
                }
            }}
            onChange={(option) => onChange(option.url)}
            getOptionSelected={(option, value) =>
                (typeof option === "string" ? option : option.title)
                === (typeof value === "string" ? value : value.title)
            }
            getOptionLabel={(option) => option.url}
            autoHighlight
            noOptionsText={(
                <Grid container alignItems="center">
                    <Grid item xs>
                        <span style={{ fontWeight: 700 }}>
                            Ничего не найдено
                        </span>
                    </Grid>
                </Grid>
            )}
            renderOption={(option) => {
                return (
                    <Grid container alignItems="center" className={classes.row}>
                        <Grid item>
                            <Avatar
                                key={option.url}
                                src={getFaviconUrl(option.url)}
                                className={classes.favicon}
                            >
                                <WebSiteIcon />
                            </Avatar>
                        </Grid>
                        <Grid item xs className={classes.textBlock}>
                            <span style={{ fontWeight: 700 }} className={classes.title}>
                              {option.title}
                            </span>
                            <Typography variant="body2" color="textSecondary" className={classes.url}>
                                {option.url}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            }}
            options={options}
            filterOptions={filterOptions}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Запрос или URL адрес"
                    variant="outlined"
                    className={externalClassName}
                    value={defaultValue}
                    onChange={handleSearch}
                    onBlur={() => {
                        setIsOpen(false);
                        setOptions([]);
                        setLoading(false);
                        if (controller) {
                            controller.abort();
                            setController(null);
                        }
                        if (timer) {
                            clearTimeout(timer);
                        }
                    }}
                    InputProps={{
                        ...params.InputProps,
                        className: classes.input,
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
