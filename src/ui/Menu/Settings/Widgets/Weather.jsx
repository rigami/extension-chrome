import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { action } from 'mobx';
import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    TextField,
    Typography,
} from '@material-ui/core';
import { map, round } from 'lodash';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import MenuInfo from '@/ui/Menu/MenuInfo';
import { PlaceRounded as PlaceIcon } from '@material-ui/icons';
import { getDomain } from '@/utils/localSiteParse';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import changeLocationPage from './WeatherChangeLocation';

const useStyles = makeStyles((theme) => ({
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function WeatherWidget({ onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsWidget']);
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const [dtwUseWeather, setDtwUseWeather] = useState(widgets.settings.dtwUseWeather);
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    return (
        <React.Fragment>
            <SectionHeader title={t('weather.title')} />
            <MenuRow
                title={t('weather.useWeather')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: dtwUseWeather,
                    disabled: dtwUseWeather !== widgets.settings.dtwUseWeather,
                    onChange: (event, value) => {
                        setDtwUseWeather(value);

                        if (value) {
                            widgets.getPermissionsToWeather()
                                .catch(action((e) => {
                                    console.error(e);
                                }))
                                .finally(() => {
                                    widgets.settings.update({ dtwUseWeather: true });
                                });
                        } else {
                            widgets.settings.update({ dtwUseWeather: false });
                        }
                    },
                }}
            />
            <Collapse in={widgets.settings.dtwUseWeather}>
                <MenuInfo
                    show={
                        !coreService.storage.persistent.weatherLocation
                        && coreService.storage.persistent.weather?.status === FETCH.FAILED
                    }
                    message={t('weather.region.notDetected.title')}
                    description={t('weather.region.notDetected.description')}
                    actions={(
                        <Button
                            data-ui-path="weather.region.notDetected.changeRegion"
                            variant="outlined"
                            color="inherit"
                            onClick={() => onSelect(changeLocationPage)}
                        >
                            {t('weather.region.button.change')}
                        </Button>
                    )}
                />
                <MenuInfo
                    show={
                        coreService.storage.persistent.weatherLocation
                        && coreService.storage.persistent.weather?.status === FETCH.FAILED
                    }
                    message={t('weather.error.serviceUnavailable')}
                />
                <MenuRow
                    title={t('weather.units.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`weather.units.value.${value}`),
                        value: widgets.settings.dtwWeatherMetrics,
                        onChange: (event) => {
                            widgets.settings.update({ dtwWeatherMetrics: event.target.value });
                        },
                        values: map(WIDGET_DTW_UNITS, (key) => WIDGET_DTW_UNITS[key]),
                    }}
                />
                <MenuRow
                    title={t('weather.provider.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`weather.provider.value.${value}`),
                        value: 'openweathermap',
                        disabled: true,
                        values: ['openweathermap'],
                    }}
                />
                <MenuRow
                    icon={PlaceIcon}
                    title={t('weather.region.title')}
                    description={(
                        (
                            coreService.storage.persistent.weatherLocation
                            && !coreService.storage.persistent.weatherLocation?.manual
                            && t('weather.region.select.auto')
                        )
                        || (
                            coreService.storage.persistent.weatherLocation
                            && coreService.storage.persistent.weatherLocation?.manual
                            && ('weather.region.select.manual')
                        )
                        || t('weather.region.select.failed')
                    )}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect(changeLocationPage),
                        component: coreService.storage.persistent.weatherLocation
                            ? (`${
                            coreService.storage.persistent.weatherLocation?.name || t('unknown')
                        } [${
                            round(coreService.storage.persistent.weatherLocation?.latitude, 1) || '-'
                        }, ${
                            round(coreService.storage.persistent.weatherLocation?.longitude, 1) || '-'
                        }]`)
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('common:notSet')}
                                </Typography>
                            ),
                    }}
                />
                {coreService.storage.persistent.weather?.status === FETCH.PENDING && (<LinearProgress />)}
                <MenuRow
                    title={t('weather.clickAction.title')}
                    description={t('weather.clickAction.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => { setActionEditorOpen(true); },
                        component: widgets.settings.dtwWeatherAction
                            ? `open: ${getDomain(widgets.settings.dtwWeatherAction)}`
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('common:notSet')}
                                </Typography>
                            ),
                    }}
                />
                <Dialog open={actionEditorOpen} onClose={() => { setActionEditorOpen(false); }}>
                    <DialogTitle>{t('weather.clickAction.dialog.title')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('weather.clickAction.dialog.description')}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            defaultValue={widgets.settings.dtwWeatherAction}
                            fullWidth
                            label={t('weather.clickAction.dialog.url')}
                            onChange={(event) => { setActionUrl(event.target.value); }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            data-ui-path="weather.clickAction.cancel"
                            color="primary"
                            onClick={() => { setActionEditorOpen(false); }}
                        >
                            {t('common:button.cancel')}
                        </Button>
                        <Button
                            data-ui-path="weather.clickAction.save"
                            color="primary"
                            onClick={() => {
                                setActionEditorOpen(false);
                                widgets.settings.update({ dtwWeatherAction: actionUrl });
                            }}
                        >
                            {t('common:button.save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Collapse>
        </React.Fragment>
    );
}

export default observer(WeatherWidget);
