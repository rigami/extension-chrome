import { useTranslation } from 'react-i18next';
import useCoreService from '@/stores/app/BaseStateProvider';
import React, { useState } from 'react';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { Button } from '@material-ui/core';
import { eventToBackground } from '@/stores/universal/serviceBus';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import SectionHeader from '@/ui/Menu/SectionHeader';

const useStyles = makeStyles(() => ({
    fullWidth: { width: '100%' },
    reRunSyncButton: { flexShrink: 0 },
}));

function BrowserSync() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const coreService = useCoreService();
    const [syncing, setSyncing] = useState(false);

    return (
        <MenuRow
            title={t('import.chrome.title')}
            action={{
                type: ROWS_TYPE.CUSTOM,
                onClick: () => {},
                component: (
                    <Button
                        variant="contained"
                        component="span"
                        color="primary"
                        className={classes.reRunSyncButton}
                        fullWidth
                        disabled={syncing}
                        onClick={() => {
                            setSyncing(true);
                            eventToBackground('system/importSystemBookmarks', {}, () => {
                                console.log('FINISH SYNC!');
                                setSyncing(false);
                                coreService.storage.persistent.update({ bkmsLastTruthSearchTimestamp: Date.now() });
                            });
                        }}
                    >
                        {
                            syncing
                                ? t('import.chrome.state.importing')
                                : t('import.chrome.button.import')
                        }
                    </Button>
                ),
            }}
        />
    );
}

const ObserverBrowserSync = observer(BrowserSync);

function ImportBookmarksFromBrowser() {
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('import.title')} />
            <ObserverBrowserSync />
        </React.Fragment>
    );
}

export default observer(ImportBookmarksFromBrowser);
