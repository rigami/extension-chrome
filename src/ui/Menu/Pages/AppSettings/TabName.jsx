import React from 'react';
import {
    TextField,
    Box,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import TabNameExampleImage from '@/images/tabName.svg';
import useAppService from '@/stores/app/AppStateProvider';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    row: { padding: `${theme.spacing(1)}px ${theme.spacing(2)}px` },
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

const headerProps = { title: 'settingsApp:tabName.title' };

function TabName() {
    const appService = useAppService();
    const { t } = useTranslation(['settingsApp']);
    const classes = useStyles();

    return (
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
                    {appService.settings.tabName}
                </span>
            </Box>
            <Box className={classes.row}>
                <Typography>
                    {t('tabName.description')}
                </Typography>
            </Box>
            <Box className={classes.row}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder={t('tabName.emptyName', { context: 'placeholder' })}
                    defaultValue={appService.settings.tabName}
                    onChange={(event) => {
                        document.title = event.target.value || '\u200E';
                        appService.settings.update({ tabName: event.target.value });
                    }}
                />
            </Box>
        </React.Fragment>
    );
}

const ObserverTabName = observer(TabName);

export { headerProps as header, ObserverTabName as content };

export default {
    header: headerProps,
    content: ObserverTabName,
};
