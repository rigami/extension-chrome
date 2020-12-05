import React from 'react';
import {
    TextField,
    Box,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import TabNameExampleImage from '@/images/tabName.svg';
import useAppService from '@/stores/AppStateProvider';
import ObserverComponent from '@/utils/ObserverComponent';

const useStyles = makeStyles((theme) => ({
    row: {
        width: 520,
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    splash: {
        position: 'relative',
        overflow: 'hidden',
        marginBottom: theme.spacing(2),
    },
    siteName: {
        position: 'absolute',
        width: 216,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));

const headerProps = { title: 'settings.app.tabName.title' };

function TabName() {
    const appService = useAppService();
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <ObserverComponent>
            <Box className={classes.splash}>
                <TabNameExampleImage />
                <span
                    style={{
                        left: -29,
                        top: 97,
                    }}
                    className={classes.siteName}
                >
                    Danilkinkin
                </span>
                <span
                    style={{
                        left: 151,
                        top: 97,
                    }}
                    className={classes.siteName}
                >
                    {appService.settings.tabName}
                </span>
            </Box>
            <Box className={classes.row}>
                <Typography>
                    {t('settings.app.tabName.description')}
                </Typography>
            </Box>
            <Box className={classes.row}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder={t('settings.app.tabName.emptyName')}
                    defaultValue={appService.settings.tabName}
                    onChange={(event) => {
                        document.title = event.target.value || '\u200E';
                        appService.settings.update({ tabName: event.target.value });
                    }}
                />
            </Box>
        </ObserverComponent>
    );
}

export { headerProps as header, TabName as content };
