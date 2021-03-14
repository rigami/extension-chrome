import React from 'react';
import {
    FavoriteBorderRounded as UncheckIcon,
    FavoriteRounded as CheckIcon,
} from '@material-ui/icons';
import { Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.error.main,
        marginLeft: 'auto',
        marginRight: theme.spacing(3),
    },
}));

function ShowFavoriteSwitcher({ onResearch }) {
    const classes = useStyles();

    return (
        <Checkbox
            className={classes.root}
            color="error"
            icon={<UncheckIcon />}
            checkedIcon={<CheckIcon />}
            onChange={(event, value) => onResearch({ onlyFavorites: value })}
        />
    );
}

export default ShowFavoriteSwitcher;
