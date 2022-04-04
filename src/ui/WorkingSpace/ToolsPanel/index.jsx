import React from 'react';
import { Box } from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { SelfImprovementRounded as DesktopIcon } from '@/icons';
import { ACTIVITY } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import ShowFavorites from './ShowFavorites';
import CloudSync from '@/ui/WorkingSpace/ToolsPanel/CloudSync';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'sticky',
        width: 'fit-content',
        marginLeft: 'auto',
        top: theme.spacing(1),
        display: 'flex',
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadiusBold,
        zIndex: 100,
        backgroundColor: alpha(theme.palette.background.default, 0.6),
        backdropFilter: `blur(${theme.spacing(2)}px)`,
    },
    wrapperTools: {
        flexShrink: 0,
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: theme.spacing(1),
    },
    toolStub: {
        visibility: 'hidden',
        width: 36,
    },
    fixVisualMargin: { marginRight: theme.spacing(1) },
}));

function ToolsPanel() {
    const classes = useStyles();
    const { t } = useTranslation(['desktop']);
    const appStateService = useAppStateService();
    const workingSpaceService = useWorkingSpaceService();

    return (
        <Box disableGutters className={classes.root}>
            <CloudSync />
            <Box className={classes.wrapperTools}>
                {workingSpaceService.favorites.length > 0 && (
                    <ShowFavorites className={classes.fixVisualMargin} />
                )}
                <ExtendButtonGroup>
                    <ExtendButton
                        tooltip={t('desktop:button.open')}
                        data-ui-path="desktop.open"
                        onClick={() => appStateService.setActivity(ACTIVITY.DESKTOP)}
                        icon={DesktopIcon}
                    />
                </ExtendButtonGroup>
                <ExtendButtonGroup className={classes.toolStub} />
            </Box>
        </Box>
    );
}

export default observer(ToolsPanel);
