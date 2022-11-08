import {
    Box,
    Container,
    IconButton,
    Typography,
} from '@material-ui/core';
import { ArrowBack as BackIcon } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import CreateLinkRequest from '@/ui/Settings/Pages/Sync/LinkDevices/CreateLinkRequest';

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
    header: {
        display: 'flex',
        alignItems: 'center',
    },
    backButton: {
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(-1.5),
        color: theme.palette.text.primary,
        alignSelf: 'flex-start',
        '& $svg': {
            width: 34,
            height: 34,
        },
    },
}));

function Login({ onCancel, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');

    return (
        <Box className={classes.root}>
            <Container maxWidth="md" className={classes.container}>
                <Box className={classes.header}>
                    <IconButton onClick={onCancel} className={classes.backButton}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h3">{t('login.title')}</Typography>
                </Box>
                <Box className={classes.contentWrapper}>
                    <CreateLinkRequest onLink={onEnd} />
                </Box>
            </Container>
        </Box>
    );
}

export default Login;
