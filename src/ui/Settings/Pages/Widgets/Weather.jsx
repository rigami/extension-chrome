import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { PlaceRounded as PlaceIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { captureException } from '@sentry/react';
import { useAppStateService } from '@/stores/app/appState';
import { useCoreService } from '@/stores/app/core';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import Banner from '@/ui-components/Banner';
import { getDomain } from '@/utils/localSiteParse';
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
    const { widgetsService } = useAppStateService();
    const coreService = useCoreService();
    const [useWeather, setDtwUseWeather] = useState(widgetsService.settings.useWeather);
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    console.log('coreService.storage.data:', coreService.storage.data);

    return (
        <React.Fragment>
            <SectionHeader title={t('weather.title')} />
            <MenuRow
                title={t('weather.useWeather')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: useWeather,
                    disabled: useWeather !== widgetsService.settings.useWeather,
                    onChange: (event, value) => {
                        setDtwUseWeather(value);

                        if (value) {
                            widgetsService.autoDetectLocationAndUpdateWeather()
                                .catch(action((e) => {
                                    console.error(e);
                                    captureException(e);
                                }))
                                .finally(() => {
                                    widgetsService.settings.update({ useWeather: true });
                                });
                        } else {
                            widgetsService.settings.update({ useWeather: false });
                        }
                    },
                }}
            />
            <Collapse in={widgetsService.settings.useWeather}>
                <Collapse
                    in={
                        !coreService.storage.data.location
                        && coreService.storage.data.weather?.status === FETCH.FAILED
                    }
                >
                    <MenuRow>
                        <Banner
                            variant="warn"
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
                    </MenuRow>
                </Collapse>
                <Collapse
                    in={
                        coreService.storage.data.location
                        && coreService.storage.data.weather?.status === FETCH.FAILED
                    }
                >
                    <MenuRow>
                        <Banner
                            variant="warn"
                            message={t('weather.error.serviceUnavailable')}
                        />
                    </MenuRow>
                </Collapse>
                <MenuRow
                    title={t('weather.units.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`weather.units.value.${value}`),
                        value: widgetsService.settings.weatherMetrics,
                        onChange: (event) => {
                            widgetsService.settings.update({ weatherMetrics: event.target.value });
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
                            coreService.storage.data.location
                            && !coreService.storage.data.location?.manual
                            && t('weather.region.select.auto')
                        )
                        || (
                            coreService.storage.data.location
                            && coreService.storage.data.location?.manual
                            && t('weather.region.select.manual')
                        )
                        || t('weather.region.select.failed')
                    )}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect(changeLocationPage),
                        component: coreService.storage.data.location
                            ? (`${
                                coreService.storage.data.location?.name || t('unknown')
                            } [${
                                round(coreService.storage.data.location?.latitude, 1) || '-'
                            }, ${
                                round(coreService.storage.data.location?.longitude, 1) || '-'
                            }]`)
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('common:notSet')}
                                </Typography>
                            ),
                    }}
                />
                {coreService.storage.data.weather?.status === FETCH.PENDING && (<LinearProgress />)}
                <MenuRow
                    title={t('weather.clickAction.title')}
                    description={t('weather.clickAction.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => { setActionEditorOpen(true); },
                        component: widgetsService.settings.weatherAction
                            ? `open: ${getDomain(widgetsService.settings.weatherAction)}`
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
                            defaultValue={widgetsService.settings.weatherAction}
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
                                widgetsService.settings.update({ weatherAction: actionUrl });
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
