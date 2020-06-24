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
import siteSearch, { getFaviconUrl } from "@/utils/siteSearch";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { PublicRounded as WebSiteIcon } from '@material-ui/icons';

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
    favicon: {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
        width: 16,
        height: 16,
    },
}));

function SearchField({ className: externalClassName, value, onChange }) {
    const classes = useStyles();
    const [timer, setTimer] = useState(undefined);
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const loading = open && options.length === 0;

    const handleSearch = (event) => {
        value = event.target.value;
        if (timer) {
            clearTimeout(timer);
        }

        setTimer(setTimeout(() => {
            setTimer(null);
            siteSearch(value)
                .then((results) => {
                    setOptions(results);
                });
        }, 1300));

        onChange(value);
    };

    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete
            fullWidth
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionSelected={(option, value) => option.title === value.title}
            getOptionLabel={(option) => option.title}
            renderOption={(option) => {
                return (
                    <Grid container alignItems="center">
                        <Grid item>
                            <Avatar
                                src={getFaviconUrl(option.url)}
                                className={classes.favicon}
                            >
                                <WebSiteIcon />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <span style={{ fontWeight: 700 }}>
                              {option.title}
                            </span>
                            <Typography variant="body2" color="textSecondary">
                                {option.url}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            }}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="URL адрес"
                    variant="outlined"
                    className={externalClassName}
                    value={value}
                    onChange={handleSearch}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchField;
