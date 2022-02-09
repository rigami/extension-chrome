import {
    Box, Button, Container, DialogActions, Typography,
} from '@material-ui/core';
import { ArrowBack as BackIcon, ArrowForward as NextIcon } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import CreateLinkRequest from '@/ui/Menu/Pages/Sync/LinkDevices/CreateLinkRequest';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        // height: '100vh',
    },
    container: {
        margin: 'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
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
    actions: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginTop: 'auto',
    },
    questionProgress: { marginTop: theme.spacing(2) },
    containerDesktop: {
        position: 'relative',
        display: 'flex',
    },
}));

function Login({ defaultSettings, onCancel, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');

    return (
        <Box className={classes.root}>
            <Container maxWidth="md" className={classes.container}>
                <Typography variant="h3">{t('login.title')}</Typography>
                <CreateLinkRequest onLink={onEnd} />
                <DialogActions className={classes.actions}>
                    <Button
                        startIcon={(<BackIcon />)}
                        onClick={onCancel}
                    >
                        {t('button.back')}
                    </Button>
                </DialogActions>
            </Container>
        </Box>
    );
}

export default Login;
