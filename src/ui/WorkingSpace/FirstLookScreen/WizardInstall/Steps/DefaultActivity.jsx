import React from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { ButtonBase, CardActions, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { ACTIVITY } from '@/enum';
import SchemeBackground from '@/images/scheme_background.svg';
import SchemeBookmarks from '@/images/scheme_bookmarks.svg';
import { useAppStateService } from '@/stores/app/appState';

const useStyles = makeStyles((theme) => ({
    checkboxButton: {
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadiusBolder,
        border: '1px solid transparent',
        display: 'flex',
        flexDirection: 'column',
    },
    activeCheckboxButton: {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    image: {
        width: '100%',
        height: 'auto',
        backgroundColor: theme.palette.background.paper,
        marginBottom: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
    },
    checkboxesContainer: { padding: theme.spacing(2, 0) },
}));

function CheckboxWithImage({ active, image, subtitle, onClick }) {
    const classes = useStyles();

    const Image = image;

    return (
        <ButtonBase
            className={clsx(classes.checkboxButton, active && classes.activeCheckboxButton)}
            onClick={onClick}
        >
            <Image className={classes.image} />
            <Typography color="textSecondary" variant="body2">{subtitle}</Typography>
        </ButtonBase>
    );
}

function DefaultActivity() {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const appStateService = useAppStateService();

    return (
        <CardActions className={classes.checkboxesContainer}>
            <CheckboxWithImage
                active={appStateService.settings.defaultActivity === ACTIVITY.DESKTOP}
                image={SchemeBackground}
                subtitle={t('defaultActivityQuestion.button.desktop')}
                onClick={() => appStateService.settings.update({ defaultActivity: ACTIVITY.DESKTOP })}
            />
            <CheckboxWithImage
                active={appStateService.settings.defaultActivity === ACTIVITY.BOOKMARKS}
                image={SchemeBookmarks}
                subtitle={t('defaultActivityQuestion.button.bookmarks')}
                onClick={() => appStateService.settings.update({ defaultActivity: ACTIVITY.BOOKMARKS })}
            />
        </CardActions>
    );
}

export default observer(DefaultActivity);
