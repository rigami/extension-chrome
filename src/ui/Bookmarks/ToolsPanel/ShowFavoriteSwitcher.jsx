import React from 'react';
import {
    FavoriteBorderRounded as UncheckIcon,
    FavoriteRounded as CheckIcon,
} from '@material-ui/icons';
import { Checkbox, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.error.main,
        '&$checked': { color: theme.palette.error.main },
        marginLeft: theme.spacing(4),
    },
    checked: {},
}));

function ShowFavoriteSwitcher({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Tooltip
            title={
                service.onlyFavorites
                    ? t('favorites.all', { context: 'helper' })
                    : t('favorites.onlyFavorites', { context: 'helper' })
            }
        >
            <Checkbox
                classes={{
                    root: classes.root,
                    checked: classes.checked,
                }}
                icon={<UncheckIcon />}
                checkedIcon={<CheckIcon />}
                onChange={(event, value) => service.updateRequest({ onlyFavorites: value })}
            />
        </Tooltip>
    );
}

export default ShowFavoriteSwitcher;
