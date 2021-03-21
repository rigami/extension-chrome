import React from 'react';
import { SearchRounded as SearchIcon } from '@material-ui/icons';
import { Box, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        maxWidth: 560,
        minWidth: 240,
        flexGrow: 1,
        marginRight: 'auto',
    },
    icon: { margin: theme.spacing(2) },
    input: {
        fontFamily: theme.typography.primaryFontFamily,
        fontSize: '1.095rem',
        fontWeight: 800,
    },
}));

function Search({ onResearch }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    return (
        <Box className={classes.root}>
            <SearchIcon className={classes.icon} />
            <InputBase
                className={classes.input}
                placeholder={t('search.bookmarks', { context: 'placeholder' })}
                fullWidth
                onChange={(event) => onResearch({ query: event.currentTarget.value })}
            />
        </Box>
    );
}

export default Search;
