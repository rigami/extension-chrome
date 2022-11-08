import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Paper, Radio, RadioGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { WIDGET_POSITION } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';
import DesktopPreview from '@/images/desktop_scheme_preview.svg';

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        minHeight: 160,
        // backgroundColor: theme.palette.background.backdrop,
        overflow: 'hidden',
        position: 'relative',
    },
    desktopPreview: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        color: theme.palette.type === 'dark' ? '#565656' : '#cbcbcb',
    },
    group: {
        width: '100%',
        minHeight: 160,
        display: 'grid',
        gridTemplateColumns: '50px 1fr 50px',
        gridTemplateRows: '50px 1fr 50px',
    },
    radio: { margin: 'auto' },
}));

function WidgetsPosition() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsQuietMode']);
    const { desktopService } = useAppStateService();

    return (
        <MenuRow
            title={t('widgets.place.title')}
            action={{
                type: ROWS_TYPE.CUSTOM,
                onClick: () => {},
                component: (
                    <Paper
                        className={classes.container}
                        elevation={0}
                    >
                        <DesktopPreview
                            className={classes.desktopPreview}
                            preserveAspectRatio="xMidYMid slice"
                        />
                        <RadioGroup
                            className={classes.group}
                            value={desktopService.settings.widgetsPosition}
                            onChange={(event) => {
                                desktopService.settings.update({ widgetsPosition: event.target.value });
                            }}
                        >
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.LEFT_TOP} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.CENTER_TOP} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.RIGHT_TOP} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.LEFT_MIDDLE} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.CENTER_MIDDLE} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.RIGHT_MIDDLE} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.LEFT_BOTTOM} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.CENTER_BOTTOM} />
                            <Radio className={classes.radio} size="small" value={WIDGET_POSITION.RIGHT_BOTTOM} />
                        </RadioGroup>
                    </Paper>
                ),
            }}
        />
    );
}

export default observer(WidgetsPosition);
