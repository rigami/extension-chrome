import React from 'react';
import { SearchRounded as SearchIcon } from '@material-ui/icons';
import { Box, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    icon: { margin: theme.spacing(1.125) },
    input: {
        fontFamily: theme.typography.primaryFontFamily,
        fontSize: '1rem',
        fontWeight: 600,
    },
}));

function Search({ searchService: service, inputRef, ...other }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    return (
        <Box className={classes.root} {...other}>
            <SearchIcon className={classes.icon} />
            <InputBase
                inputRef={inputRef}
                className={classes.input}
                autoFocus
                fullWidth
                value={service.query}
                onChange={(event) => service.updateRequest({ query: event.currentTarget.value })}
            />
        </Box>
    );
}

export default observer(Search);
