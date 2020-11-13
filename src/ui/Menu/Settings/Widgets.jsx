import React from 'react';
import {
    Box,
    Divider,
    Typography,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Link, Avatar, Collapse,
} from '@material-ui/core';
import {
    NavigateNextRounded as ArrowRightIcon,
    HomeRounded as HomeIcon,
    BugReportRounded as BugIcon,
    ChatBubbleRounded as ReviewIcon,
    EmailRounded as EmailIcon,
    PolicyRounded as PolicyIcon, BrokenImageRounded as BrokenIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppStateService from '@/stores/AppStateProvider';
import { WIDGET_DTW_POSITION, WIDGET_DTW_SIZE } from '@/enum';
import { useObserver } from 'mobx-react-lite';

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
}));

const headerProps = { title: 'settings.widgets.title' };

const numberToEnumSize = (value) => {
    return value === 3 ? WIDGET_DTW_SIZE.BIG : value === 2 ? WIDGET_DTW_SIZE.MIDDLE : WIDGET_DTW_SIZE.SMALL;
}
const enumSizeToNumber = (value) => {
    return value === WIDGET_DTW_SIZE.BIG ? 3 : value === WIDGET_DTW_SIZE.MIDDLE ? 2 : 1;
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
