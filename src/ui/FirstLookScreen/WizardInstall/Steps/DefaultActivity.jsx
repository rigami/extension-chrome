import React, { useEffect, useState } from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { ButtonBase, CardActions, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ACTIVITY } from '@/enum';
import SchemeBackground from '@/images/scheme_background.svg';
import SchemeBookmarks from '@/images/scheme_bookmarks.svg';

const useStyles = makeStyles((theme) => ({
    checkboxButton: {
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: '1px solid transparent',
        display: 'flex',
        flexDirection: 'column',
    },
    activeCheckboxButton: {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        border: `1px solid ${theme.palette.primary.main}`,
    },
    image: {
        width: 420,
        height: 298,
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

function DefaultActivity({ defaultSettings, onMutationSettings }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const [activity, setActivity] = useState(defaultSettings.activity);

    useEffect(() => {
        onMutationSettings({
            ...defaultSettings,
            activity,
        });
    }, [activity]);

    return (
        <CardActions className={classes.checkboxesContainer}>
            <CheckboxWithImage
                active={activity === ACTIVITY.DESKTOP}
                image={SchemeBackground}
                subtitle={t('defaultActivityQuestion.button.desktop')}
                onClick={() => setActivity(ACTIVITY.DESKTOP)}
            />
            <CheckboxWithImage
                active={activity === ACTIVITY.BOOKMARKS}
                image={SchemeBookmarks}
                subtitle={t('defaultActivityQuestion.button.bookmarks')}
                onClick={() => setActivity(ACTIVITY.BOOKMARKS)}
            />
        </CardActions>
    );
}

export default DefaultActivity;
