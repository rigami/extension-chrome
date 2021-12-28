import React, { memo } from 'react';
import { Box } from '@material-ui/core';
import { SettingsRounded as SettingsIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ACTIVITY } from '@/enum';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppService from '@/stores/app/AppStateProvider';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 2,
        display: 'grid',
        gridGap: theme.spacing(2),
        pointerEvents: 'none',
        gridAutoFlow: 'column',
    },
    group: { flexDirection: 'row' },
    button: { pointerEvents: 'all' },
}));

function FabMenu() {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = useAppService();
    const { t } = useTranslation(['bookmark', 'settings', 'background']);

    return (
        <Box className={classes.root}>
            <MouseDistanceFade
                unionKey="desktop-fab"
                show={appService.activity === ACTIVITY.DESKTOP ? undefined : true}
                distanceMax={750}
                distanceMin={300}
            >
                <ExtendButtonGroup variant="blurBackdrop" className={clsx(classes.group, classes.button)}>
                    <ExtendButton
                        tooltip={t('settings:title')}
                        data-ui-path="settings.open"
                        onClick={() => coreService.localEventBus.call('settings/open')}
                        icon={SettingsIcon}
                    />
                </ExtendButtonGroup>
            </MouseDistanceFade>
        </Box>
    );
}

export default memo(observer(FabMenu));
