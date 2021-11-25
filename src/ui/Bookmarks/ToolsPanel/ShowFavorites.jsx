import React from 'react';
import { StarRounded as CheckIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { ACTIVITY } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({ icon: { color: theme.palette.favorite.main } }));

function ShowFavorites({ className: externalClassName }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const appService = useAppService();

    return (
        <ExtendButtonGroup variant="outline" className={externalClassName}>
            <ExtendButton
                tooltip={t('bookmark:button.favorites_tooltip')}
                label={t('bookmark:button.favorites')}
                data-ui-path="button.favorites"
                onClick={() => appService.setActivity(ACTIVITY.FAVORITES)}
                icon={() => <CheckIcon className={classes.icon} />}
            />
        </ExtendButtonGroup>
    );
}

export default ShowFavorites;
