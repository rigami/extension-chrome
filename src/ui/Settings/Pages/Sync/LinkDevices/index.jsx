import React from 'react';
import { Chip } from '@material-ui/core'
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow from '@/ui/Settings/MenuRow';
import authStorage from '@/stores/universal/storage/auth';
import CreateLinkRequest from './CreateLinkRequest';
import ApplyLinkRequest from './ApplyLinkRequest';
import LinkedDevices from './LinkedDevices';

const useStyles = makeStyles(() => ({
    betaBadge: {
        backgroundColor: '#ec54c8',
        color: '#fff',
        height: 24,
    },
}));

function LinkBrowsers() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader
                title={t('syncDevices.title')}
                content={(
                    <Chip
                        className={classes.betaBadge}
                        label="BETA"
                    />
                )}
            />
            <MenuRow
                title={t('mergeUsers.createRequest.title')}
                description={t('mergeUsers.createRequest.description')}
            />
            <CreateLinkRequest />
            <ApplyLinkRequest />
            {authStorage.data.refreshToken && (<LinkedDevices />)}
        </React.Fragment>
    );
}

export default observer(LinkBrowsers);
