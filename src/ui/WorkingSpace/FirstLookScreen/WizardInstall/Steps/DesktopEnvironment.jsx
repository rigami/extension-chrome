import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    FormHelperText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { captureException } from '@sentry/react';
import SchemeWidgetTime from '@/images/scheme_widget_time.svg';
import SchemeWidgetDate from '@/images/scheme_widget_date.svg';
import SchemeWidgetWeather from '@/images/scheme_widget_weather.svg';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import SchemeFapProductivity from '@/images/scheme_fap_productivity.svg';
import SchemeFapZen from '@/images/scheme_fap_zen.svg';
import SchemeBackground from '@/images/scheme_background.svg';
import { useAppStateService } from '@/stores/app/appState';

const useStyles = makeStyles((theme) => ({
    containerDesktop: {
        position: 'relative',
        borderRadius: theme.shape.borderRadiusBolder,
        overflow: 'hidden',
        display: 'flex',
        height: 'min-content',
    },
    background: {
        width: '100%',
        height: 'auto',
    },
    widgets: {
        position: 'absolute',
        left: theme.spacing(2),
        bottom: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '60%',
    },
    fapProductivity: {
        width: '100%',
        height: 'auto',
        marginTop: theme.spacing(1),
    },
    fapZen: {
        width: '100%',
        height: 'auto',
        marginTop: theme.spacing(1),
    },
    time: {
        width: '40%',
        height: 'auto',
    },
    date: {
        width: '70%',
        height: 'auto',
        marginTop: theme.spacing(1),
    },
    weather: {
        width: '30%',
        height: 'auto',
        marginTop: theme.spacing(0.5),
    },
    marginTop: { marginTop: theme.spacing(4) },
    formRoot: { minWidth: 200 },
    legend: { color: `${theme.palette.text.secondary} !important` },
}));

function DesktopEnvironment() {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const appStateService = useAppStateService();
    const [tempUseWeather, setTempUseWeather] = useState(appStateService.widgetsService.settings.useWeather);
    const [failedGetWeather, setFailedGetWeather] = useState(false);

    return (
        <Box display="flex" my={4}>
            <Box className={classes.containerDesktop}>
                <Box className={classes.widgets}>
                    {appStateService.widgetsService.settings.useTime && (
                        <SchemeWidgetTime className={classes.time} />
                    )}
                    {appStateService.widgetsService.settings.useDate && (
                        <SchemeWidgetDate className={classes.date} />
                    )}
                    {appStateService.widgetsService.settings.useWeather && (
                        <SchemeWidgetWeather className={classes.weather} />
                    )}
                    {appStateService.desktopService.settings.fapStyle === FAP_STYLE.PRODUCTIVITY && (
                        <SchemeFapProductivity className={classes.fapProductivity} />
                    )}
                    {appStateService.desktopService.settings.fapStyle === FAP_STYLE.CONTAINED && (
                        <SchemeFapZen className={classes.fapZen} />
                    )}
                </Box>
                <SchemeBackground className={classes.background} />
            </Box>
            <Box
                ml={8}
                display="flex"
                flexDirection="column"
                className={classes.formRoot}
            >
                <FormControl component="fieldset">
                    <FormLabel
                        className={classes.legend}
                        component="legend"
                    >
                        {t('desktopEnvironmentQuestion.widgets')}
                    </FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={appStateService.widgetsService.settings.useTime}
                                    onChange={
                                        (event) => appStateService.widgetsService.settings
                                            .update({ useTime: event.currentTarget.checked })
                                    }
                                    name="time"
                                />
                            )}
                            label={t('desktopEnvironmentQuestion.button.useTime')}
                        />
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={appStateService.widgetsService.settings.useDate}
                                    onChange={
                                        (event) => appStateService.widgetsService.settings
                                            .update({ useDate: event.currentTarget.checked })
                                    }
                                    name="date"
                                />
                            )}
                            label={t('desktopEnvironmentQuestion.button.useDate')}
                        />
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={tempUseWeather}
                                    disabled={tempUseWeather !== appStateService.widgetsService.settings.useWeather}
                                    onChange={
                                        (event) => {
                                            setTempUseWeather(event.currentTarget.checked);
                                            setFailedGetWeather(false);

                                            if (event.currentTarget.checked) {
                                                appStateService.widgetsService.autoDetectLocationAndUpdateWeather()
                                                    .then(() => {
                                                        appStateService.widgetsService.settings.update({ useWeather: true });
                                                    })
                                                    .catch(action((e) => {
                                                        console.error(e);
                                                        captureException(e);
                                                        setTempUseWeather(false);
                                                        setFailedGetWeather(true);
                                                        appStateService.widgetsService.settings.update({ useWeather: false });
                                                    }));
                                            } else {
                                                setTempUseWeather(false);
                                                appStateService.widgetsService.settings.update({ useWeather: false });
                                            }
                                        }
                                    }
                                    name="weather"
                                />
                            )}
                            label={t('desktopEnvironmentQuestion.button.useWeather')}
                        />
                        {failedGetWeather && (<FormHelperText>{t('desktopEnvironmentQuestion.failedGetWeather')}</FormHelperText>)}
                    </FormGroup>
                </FormControl>
                {BUILD === 'full' && (
                    <FormControl component="fieldset" className={classes.marginTop}>
                        <FormLabel
                            className={classes.legend}
                            component="legend"
                        >
                            {t('desktopEnvironmentQuestion.fap')}
                        </FormLabel>
                        <RadioGroup
                            value={appStateService.desktopService.settings.fapStyle}
                            onChange={
                                (event) => appStateService.desktopService.settings
                                    .update({ fapStyle: event.target.value })
                            }
                        >
                            <FormControlLabel
                                value={FAP_STYLE.HIDDEN}
                                control={<Radio />}
                                label={t('desktopEnvironmentQuestion.button.disableFap')}
                            />
                            <FormControlLabel
                                value={FAP_STYLE.PRODUCTIVITY}
                                control={<Radio />}
                                label={t('desktopEnvironmentQuestion.button.productivityFap')}
                            />
                            <FormControlLabel
                                value={FAP_STYLE.CONTAINED}
                                control={<Radio />}
                                label={t('desktopEnvironmentQuestion.button.zenFap')}
                            />
                        </RadioGroup>
                    </FormControl>
                )}
            </Box>
        </Box>
    );
}

export default observer(DesktopEnvironment);
