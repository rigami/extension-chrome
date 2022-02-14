import {
    Box,
    Button,
    Container,
    DialogActions,
    Typography,
} from '@material-ui/core';
import { ArrowBack as BackIcon } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import CreateLinkRequest from '@/ui/Menu/Pages/Sync/LinkDevices/CreateLinkRequest';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    container: {
        margin: 'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    actions: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginTop: 'auto',
    },
    contentWrapper: { margin: theme.spacing(0, -4) },
}));

function Login({ defaultSettings, onCancel, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');

    return (
        <Box className={classes.root}>
            <Container maxWidth="md" className={classes.container}>
                <Typography variant="h3">{t('login.title')}</Typography>
                <Box className={classes.contentWrapper}>
                    <CreateLinkRequest onLink={onEnd} />
                </Box>
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
