import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow from '@/ui/Menu/MenuRow';
import authStorage from '@/stores/universal/storage/auth';
import CreateLinkRequest from './CreateLinkRequest';
import ApplyLinkRequest from './ApplyLinkRequest';
import LinkedDevices from './LinkedDevices';

function LinkBrowsers() {
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('syncDevices.title')} />
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
