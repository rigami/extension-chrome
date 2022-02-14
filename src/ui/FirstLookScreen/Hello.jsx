import React from 'react';
import {
    Box,
    Typography,
    Button,
    DialogActions,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowForward as GoToIcon, SyncRounded as SyncIcon } from '@material-ui/icons';
import Banner from '@/ui-components/Banner';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '16vh',
    },
    container: { margin: 'auto' },
    progress: {
        width: 400,
        margin: theme.spacing(2, 0),
    },
    banner: {
        margin: theme.spacing(2, 0),
        marginTop: theme.spacing(4),
    },
    iconWrapper: {
        minWidth: theme.spacing(5),
        alignSelf: 'baseline',
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75),
    },
    icon: { color: theme.palette.warning.main },
    actions: { marginTop: theme.spacing(4) },
}));

function Hello({ onApplyDefaultSetting, onStartWizard, onLogin }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');

    return (
        <Box className={classes.root}>
            <Typography variant="h3">{t('greeting')}</Typography>
            <Banner
                classes={{ root: classes.banner }}
                message={t('beta.title')}
                description={t('beta.description')}
                variant="warn"
            />
            <Typography variant="body1">{t('wizardDescription')}</Typography>
            <DialogActions className={classes.actions}>
                <Button onClick={onApplyDefaultSetting}>{t('button.skipAndApplyDefaultSettings')}</Button>
                <Button
                    endIcon={(<GoToIcon />)}
                    onClick={onStartWizard}
                >
                    {t('button.startSettingsWizard')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={(<SyncIcon />)}
                    onClick={onLogin}
                >
                    {t('button.login')}
                </Button>
            </DialogActions>
        </Box>
    );
}

export default observer(Hello);
