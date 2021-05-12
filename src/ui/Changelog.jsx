import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    IconButton,
    CardMedia,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
} from '@material-ui/core';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Stub from '@/ui-components/Stub';
import { makeStyles } from '@material-ui/core/styles';
import {
    KeyboardArrowRight as ItemIcon,
    CloseRounded as CloseIcon,
} from '@material-ui/icons';
import requestSrc from '@/images/request.png';
import appVariables from '@/config/appVariables';
import CustomScroll from '@/ui-components/CustomScroll';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'min(800px, calc(100vh - 48px))',
    },
    container: { padding: 0 },
    scroller: { height: 600 },
    rateScreenIcon: {
        width: 200,
        height: 200,
    },
    dismissButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        zIndex: 1,
    },
    version: {
        position: 'absolute',
        bottom: theme.spacing(2),
        left: theme.spacing(2),
        lineHeight: '100%',
        color: theme.palette.text.secondary,
    },
    itemIcon: {
        alignSelf: 'flex-start',
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
        minWidth: 18 + 8,
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    itemText: {
        fontSize: '0.8rem',
        fontWeight: 600,
    },
    applyButton: {
        margin: theme.spacing(2),
        marginLeft: 'auto',
    },
    listItem: {
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
    },
}));

function ChangelogScreen({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation([`changelog_${BUILD}`]);

    return (
        <Box className={classes.root}>
            <IconButton className={classes.dismissButton} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <CustomScroll className={classes.scroller} translateContentSizeYToHolder>
                <Box p={2} pb={0}>
                    <Stub
                        classes={{ container: classes.container }}
                        icon={CardMedia}
                        iconProps={{
                            className: classes.rateScreenIcon,
                            image: requestSrc,
                        }}
                        message={t('title')}
                    />
                    <List disablePadding>
                        {t('changelog', { returnObjects: true }).map((item) => (
                            <ListItem key={item} disableGutters className={classes.listItem}>
                                <ListItemIcon className={classes.itemIcon}>
                                    <ItemIcon />
                                </ListItemIcon>
                                <ListItemText classes={{ primary: classes.itemText }} primary={item} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CustomScroll>
            <Button
                className={classes.applyButton}
                variant="contained"
                onClick={onClose}
            >
                {t('button.ok')}
            </Button>
            <Typography variant="caption" className={classes.version}>
                {`v.${appVariables.version}`}
            </Typography>
        </Box>
    );
}

function Changelog() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const coreService = useCoreService();

    useEffect(() => {
        if (!coreService.storage.temp.newVersion) {
            // return;
        }

        const changelogSnackbar = enqueueSnackbar({
            content: (
                <ChangelogScreen
                    onClose={() => {
                        closeSnackbar(changelogSnackbar);
                        coreService.storage.updateTemp({ newVersion: false });
                    }}
                />
            ),
        }, { persist: true });
    }, []);

    return null;
}

export default observer(Changelog);
