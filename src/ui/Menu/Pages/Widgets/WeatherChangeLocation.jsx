import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Divider,
    InputBase,
    LinearProgress,
    Tooltip,
    CircularProgress,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    ErrorRounded as ErrorIcon,
    NearMeRounded as MyLocationIcon,
    PlaceRounded as PlaceIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { round } from 'lodash';
import { runInAction } from 'mobx';
import { useSnackbar } from 'notistack';
import { captureException } from '@sentry/react';
import useCoreService from '@/stores/app/BaseStateProvider';
import Stub from '@/ui-components/Stub';
import {
    NearMeDisabledRounded as CustomLocationIcon,
    WrongLocationRounded as WrongLocationIcon,
} from '@/icons';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    row: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        alignItems: 'center',
    },
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
    input: { padding: theme.spacing(2) },
    submit: { flexShrink: 0 },
    locationRow: { paddingLeft: theme.spacing(4) },
    geoButtonWrapper: { position: 'relative' },
    geoButton: {},
    geoButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

function HeaderActions() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsWidget']);
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const isAuto = (
        coreService.storage.persistent.data.location
        && !coreService.storage.persistent.data.location?.manual
    );

    return (
        <React.Fragment>
            <Tooltip
                title={t(`weather.region.autoGeolocation.${isAuto ? 'on' : 'off'}`, { context: 'helper' })}
            >
                <span className={classes.geoButtonWrapper}>
                    <Button
                        data-ui-path={`weather.region.autoGeolocation.${isAuto ? 'on' : 'off'}`}
                        className={classes.geoButton}
                        variant={isAuto ? 'contained' : 'outlined'}
                        color="primary"
                        startIcon={isAuto ? (<MyLocationIcon />) : (<CustomLocationIcon />)}
                        disabled={loading}
                        onClick={() => {
                            if (isAuto) {
                                coreService.localEventBus.call('system/widgets/weather/focusManualSearchInput');
                            } else {
                                setLoading(true);
                                widgets.autoDetectLocationAndUpdateWeather()
                                    .catch((e) => {
                                        captureException(e);
                                        console.error(e);

                                        enqueueSnackbar({
                                            message: t('weather.error.failedGeolocation'),
                                            description: t(
                                                'weather.error.failedGeolocation',
                                                { context: 'description' },
                                            ),
                                            variant: 'error',
                                        });
                                    })
                                    .finally(() => {
                                        setLoading(false);
                                    });
                            }
                        }}
                    >
                        {t(`weather.region.autoGeolocation.${isAuto ? 'on' : 'off'}`)}
                    </Button>
                    {loading && <CircularProgress size={24} className={classes.geoButtonProgress} />}
                </span>
            </Tooltip>
        </React.Fragment>
    );
}

const ObserverHeaderActions = observer(HeaderActions);

function Location(props) {
    const {
        locationName,
        currTemp,
        latitude,
        longitude,
        onClick,
    } = props;
    const classes = useStyles();
    const { widgets } = useAppStateService();

    let units;
    let temp;

    if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.FAHRENHEIT) {
        units = '°F';
        temp = ((currTemp || 0) - 273.15) * (9 / 5) + 32;
    } else if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.KELVIN) {
        units = 'К';
        temp = currTemp || 0;
    } else {
        units = '°C';
        temp = (currTemp || 0) - 273.15;
    }

    return (
        <MenuRow
            className={classes.locationRow}
            disableIconInsert
            title={locationName}
            description={`${Math.round(temp)} ${units} [${round(latitude, 1) || '-'}, ${round(longitude, 1) || '-'}]`}
            action={{
                type: ROWS_TYPE.LINK,
                onClick,
            }}
        />
    );
}

function WeatherChangeLocation({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsWidget']);
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.data.location?.name,
        list: [],
        status: FETCH.WAIT,
    }));
    const inputRef = useRef(null);

    const handleSearch = async (event) => {
        event.preventDefault();

        store.status = FETCH.PENDING;

        try {
            const list = await widgets.searchLocation(store.searchRequest);

            runInAction(() => {
                store.list = list;
                store.status = FETCH.DONE;
            });
        } catch (e) {
            captureException(e);
            console.error(e);
            store.status = FETCH.FAILED;
        }
    };

    useEffect(() => {
        const listenId = coreService.localEventBus.on('system/widgets/weather/focusManualSearchInput', () => {
            console.log('focusManualSearchInput', inputRef);
            inputRef.current?.focus();
        });

        return () => coreService.localEventBus.removeListener(listenId);
    }, []);

    return (
        <React.Fragment>
            <MenuRow>
                <ObserverHeaderActions />
            </MenuRow>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={coreService.storage.persistent.data.location?.name}
                    variant="outlined"
                    autoFocus
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                    }}
                />
                <Button
                    data-ui-path="weather.region.search"
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={classes.submit}
                >
                    {t('common:button.search')}
                </Button>
            </form>
            <Divider />
            {store.status === FETCH.PENDING && (<LinearProgress />)}
            {store.status === FETCH.DONE && store.list.map((item) => (
                <Location
                    key={item.location.id}
                    locationName={item.location.name}
                    currTemp={item.currTemp}
                    latitude={item.location.latitude}
                    longitude={item.location.longitude}
                    onClick={() => {
                        widgets.setLocation(item.location);
                        onClose();
                    }}
                />
            ))}
            {store.status === FETCH.DONE && store.list.length === 0 && (
                <Stub
                    message={t('weather.region.search.error.notFound')}
                    description={t('weather.region.search.error.notFound', { context: 'description' })}
                />
            )}
            {store.status === FETCH.FAILED && (
                <Stub
                    icon={ErrorIcon}
                    message={t('weather.region.search.error.failed')}
                    description={t('weather.region.search.error.failed', { context: 'description' })}
                />
            )}
            {store.status === FETCH.WAIT && !coreService.storage.persistent.data.location && (
                <Stub
                    icon={WrongLocationIcon}
                    message={t('weather.region.search.wait.failed')}
                    description={t('weather.region.search.wait.failed', { context: 'description' })}
                />
            )}
            {store.status === FETCH.WAIT && coreService.storage.persistent.data.location?.manual && (
                <Stub
                    icon={PlaceIcon}
                    message={t(
                        'weather.region.search.wait.manual',
                        { locationName: coreService.storage.persistent.data.location?.name },
                    )}
                    description={t('weather.region.search.wait.manual', { context: 'description' })}
                />
            )}
            {
                store.status === FETCH.WAIT
                && coreService.storage.persistent.data.location
                && !coreService.storage.persistent.data.location?.manual
                && (
                    <Stub
                        icon={MyLocationIcon}
                        message={t(
                            'weather.region.search.wait.auto',
                            { locationName: coreService.storage.persistent.data.location?.name },
                        )}
                        description={t('weather.region.search.wait.auto', { context: 'description' })}
                    />
                )
            }
        </React.Fragment>
    );
}

const ObserverWeatherChangeLocation = observer(WeatherChangeLocation);

export { ObserverWeatherChangeLocation as content };

export default { content: ObserverWeatherChangeLocation };
