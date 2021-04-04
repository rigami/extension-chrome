import React from 'react';
import { FavoriteRounded as CheckIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { ACTIVITY } from '@/enum';
import { makeStyles } from '@material-ui/core/styles';
import useAppService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({ icon: { color: theme.palette.error.main } }));

function ShowFavorites() {
    const classes = useStyles();
    const { t } = useTranslation();
    const appService = useAppService();

    return (
        <ExtendButtonGroup>
            <ExtendButton
                tooltip={t('bookmark:button.favorites')}
                data-ui-path="button.favorites"
                onClick={() => appService.setActivity(ACTIVITY.FAVORITES)}
                icon={() => <CheckIcon className={classes.icon} />}
            />
        </ExtendButtonGroup>
    );
}

export default ShowFavorites;
