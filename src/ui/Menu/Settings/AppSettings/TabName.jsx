import React from 'react';
import {
    TextField,
    Box,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useObserver } from 'mobx-react-lite';
import TabNameExampleImage from '@/images/tabName.svg';
import { useService as useAppConfigService } from '@/stores/app';

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

const headerProps = { title: "settings.app.tabName.title" };

function TabName() {
    const appConfigStore = useAppConfigService();
    const { t } = useTranslation();
    const classes = useStyles();

    return useObserver(() => (
        <React.Fragment>
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
                    {appConfigStore.tabName}
                </span>
            </Box>
            <Box className={classes.row}>
                <Typography>
                    {t("settings.app.tabName.description")}
                </Typography>
            </Box>
            <Box className={classes.row}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder={t("settings.app.tabName.emptyName")}
                    defaultValue={appConfigStore.tabName}
                    onChange={(event) => appConfigStore.setTabName(event.target.value)}
                />
            </Box>
        </React.Fragment>
    ));
}

export { headerProps as header, TabName as content };
