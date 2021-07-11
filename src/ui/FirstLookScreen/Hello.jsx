import React from 'react';
import {
    Box,
    Typography,
    Container,
    Button,
    ListItemIcon,
    ListItemText,
    ListItem,
    DialogActions,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import Logo from '@/ui-components/Logo';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowForward as GoToIcon, WarningRounded as WarnIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    container: { margin: 'auto' },
    progress: {
        width: 400,
        margin: theme.spacing(2, 0),
    },
    banner: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.backdrop,
        margin: theme.spacing(2, 0),
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

function Hello({ onApplyDefaultSetting, onStartWizard }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');

    return (
        <Box className={classes.root}>
            <Container maxWidth="lg" className={classes.container}>
                <Logo />
                <Typography variant="h2">{t('greeting')}</Typography>
                <ListItem ContainerComponent="div" className={classes.banner}>
                    <ListItemIcon className={classes.iconWrapper}>
                        <WarnIcon className={classes.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('beta.title')}
                        secondary={t('beta.description')}
                    />
                </ListItem>
                <Typography variant="body1">{t('wizardDescription')}</Typography>
                <DialogActions className={classes.actions}>
                    <Button onClick={onApplyDefaultSetting}>{t('button.skipAndApplyDefaultSettings')}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={(<GoToIcon />)}
                        onClick={onStartWizard}
                    >
                        {t('button.startSettingsWizard')}
                    </Button>
                </DialogActions>
            </Container>
        </Box>
    );
}

export default observer(Hello);
