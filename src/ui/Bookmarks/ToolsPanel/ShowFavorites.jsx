import React from 'react';
import { FavoriteRounded as CheckIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { ACTIVITY } from '@/enum';
import useCoreService from '@/stores/app/BaseStateProvider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({ icon: { color: theme.palette.error.main } }));

function ShowFavorites() {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();

    return (
        <ExtendButtonGroup>
            <ExtendButton
                tooltip={t('bookmark:button.favorites')}
                data-ui-path="button.favorites"
                onClick={() => coreService.localEventBus.call('system/activity/show', ACTIVITY.FAVORITES)}
                icon={() => <CheckIcon className={classes.icon} />}
            />
        </ExtendButtonGroup>
    );
}

export default ShowFavorites;
