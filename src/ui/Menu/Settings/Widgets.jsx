import React, { useState } from 'react';
import {
    Collapse,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Button,
    TextField, Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppStateService from '@/stores/AppStateProvider';
import { WIDGET_DTW_POSITION, WIDGET_DTW_SIZE } from '@/enum';
import { useObserver } from 'mobx-react-lite';
import { getDomain } from '@/utils/localSiteParse';

const useStyles = makeStyles((theme) => ({
    splash: {
        width: 520,
        height: 250,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appLogoIcon: {
        width: 64,
        height: 64,
        marginBottom: theme.spacing(1),
    },
    appLogoText: {
        marginBottom: theme.spacing(1),
        width: 100,
        height: 'auto',
        fill: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    appVersion: { color: theme.palette.text.secondary },
    row: { width: 520 },
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: 'settings.widgets.title' };

const numberToEnumSize = (value) => {
    return value === 3 ? WIDGET_DTW_SIZE.BIG : value === 2 ? WIDGET_DTW_SIZE.MIDDLE : WIDGET_DTW_SIZE.SMALL;
}
const enumSizeToNumber = (value) => {
    return value === WIDGET_DTW_SIZE.BIG ? 3 : value === WIDGET_DTW_SIZE.MIDDLE ? 2 : 1;
}

function DateWidget() {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.widgets.dtw.date.title')} />
            <MenuRow
                title={t('settings.widgets.dtw.date.useDate')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.dtwUseDate,
                    onChange: (event, value) => {
                        widgets.settings.update({ dtwUseDate: value });
                    },
                }}
            />
            <Collapse in={widgets.settings.dtwUseDate}>
                <MenuRow
                    title={t('settings.widgets.dtw.date.clickAction.title')}
                    description={t('settings.widgets.dtw.date.clickAction.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => { setActionEditorOpen(true); },
                        component: widgets.settings.dtwDateAction
                            ? `open: ${getDomain(widgets.settings.dtwDateAction)}`
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('settings.widgets.dtw.date.clickAction.notSet')}
                                </Typography>
                            ),
                    }}
                />
                <Dialog open={actionEditorOpen} onClose={() => { setActionEditorOpen(false); }}>
                    <DialogTitle>{t('settings.widgets.dtw.date.clickAction.titleFull')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('settings.widgets.dtw.date.clickAction.descriptionFull')}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            defaultValue={widgets.settings.dtwDateAction}
                            fullWidth
                            label={t('settings.widgets.dtw.date.clickAction.textFieldLabelUrl')}
                            onChange={(event) => { setActionUrl(event.target.value) }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            onClick={() => { setActionEditorOpen(false); }}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                setActionEditorOpen(false);
                                widgets.settings.update({ dtwDateAction: actionUrl });
                            }}
                        >
                            {t("save")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Collapse>
        </React.Fragment>
    );
}

function Widgets() {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title={t('settings.widgets.useWidgets.title')}
                description={t('settings.widgets.useWidgets.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.useWidgets,
                    onChange: (event, value) => {
                        widgets.settings.update({ useWidgets: value });
                    },
                }}
                type={ROWS_TYPE.CHECKBOX}
            />
            <Collapse in={widgets.settings.useWidgets}>
                <SectionHeader title={t('settings.widgets.dtw.title')} />
                <MenuRow
                    title={t('settings.widgets.dtw.dtwPlace.title')}
                    // description={t('settings.widgets.dtw.dtwPlace.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.widgets.dtw.dtwPlace.place.${value}`),
                        value: widgets.settings.dtwPosition,
                        onChange: (event) => {
                            widgets.settings.update({ dtwPosition: event.target.value });
                        },
                        values: [
                            WIDGET_DTW_POSITION.LEFT_BOTTOM,
                            WIDGET_DTW_POSITION.LEFT_MIDDLE,
                            WIDGET_DTW_POSITION.CENTER_TOP,
                        ],
                    }}
                />
                <MenuRow
                    title={t('settings.widgets.dtw.dtwSize.title')}
                    // description={t('settings.widgets.dtw.dtwSize.description')}
                    action={{
                        type: ROWS_TYPE.SLIDER,
                        value: enumSizeToNumber(widgets.settings.dtwSize),
                        onChange: (event, value) => {
                            console.log('onChange', value, numberToEnumSize(value))
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        onChangeCommitted: (event, value) => {
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        min: 1,
                        max: 3,
                        marks: [
                            {
                                value: 1,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.SMALL}`),
                            },
                            {
                                value: 2,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.MIDDLE}`),
                            },
                            {
                                value: 3,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.BIG}`),
                            },
                        ],
                        step: 1,
                        valueLabelDisplay: 'off',
                    }}
                />
                <SectionHeader title={t('settings.widgets.dtw.time.title')} />
                <MenuRow
                    title={t('settings.widgets.dtw.time.useTime')}
                    action={{
                        type: ROWS_TYPE.CHECKBOX,
                        value: widgets.settings.dtwUseTime,
                        onChange: (event, value) => {
                            widgets.settings.update({ dtwUseTime: value });
                        },
                    }}
                />
                <Collapse in={widgets.settings.dtwUseTime}>
                    <MenuRow
                        title={t('settings.widgets.dtw.time.format12')}
                        action={{
                            type: ROWS_TYPE.CHECKBOX,
                            value: widgets.settings.dtwTimeFormat12,
                            onChange: (event, value) => {
                                widgets.settings.update({ dtwTimeFormat12: value });
                            },
                        }}
                    />
                </Collapse>
                <DateWidget />
                <SectionHeader title={t('settings.widgets.dtw.weather.title')} />
                <MenuRow
                    title={t('settings.widgets.dtw.weather.useWeather')}
                    action={{
                        type: ROWS_TYPE.CHECKBOX,
                        value: widgets.settings.dtwUseWeather,
                        onChange: (event, value) => {
                            widgets.settings.update({ dtwUseWeather: value });
                        },
                    }}
                />
            </Collapse>
        </React.Fragment>
    ));
}

export { headerProps as header, Widgets as content };
