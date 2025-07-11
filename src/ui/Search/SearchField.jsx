import React, { useEffect, useState } from 'react';
import { SearchRounded as SearchIcon } from '@material-ui/icons';
import { Box, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    icon: {
        width: 22,
        height: 22,
        margin: theme.spacing(2),
    },
    input: {
        fontFamily: theme.typography.specialFontFamily,
        fontSize: '1rem',
        fontWeight: 600,
    },
}));

function SearchField({ query, onChange, inputRef, ...other }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({ query }));
    const [updateQuery] = useState(() => debounce(
        (value) => {
            onChange(value || '');
        },
        300,
        { leading: true },

    ));

    useEffect(() => {
        store.query = query;
    }, [query]);

    useEffect(() => {
        updateQuery(store.query);
    }, [store.query]);

    return (
        <Box className={classes.root} {...other}>
            <SearchIcon className={classes.icon} />
            <InputBase
                inputRef={inputRef}
                className={classes.input}
                autoFocus
                fullWidth
                value={store.query}
                placeholder={t('search.placeholder')}
                onChange={(event) => { store.query = event.currentTarget.value; }}
            />
        </Box>
    );
}

export default observer(SearchField);
