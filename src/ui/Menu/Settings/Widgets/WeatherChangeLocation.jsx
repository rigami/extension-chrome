import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/AppStateProvider';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import {
    Button,
    Divider,
    InputBase,
    LinearProgress,
    Tooltip,
    CircularProgress,
} from '@material-ui/core';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    ErrorRounded as ErrorIcon,
    SearchRounded as SearchIcon,
    NearMeRounded as MyLocationIcon,
} from '@material-ui/icons';
import {
    NearMeRoundedDisabled as CustomLocationIcon,
} from '@/icons';
import { makeStyles } from '@material-ui/core/styles';
import { round } from 'lodash';
import FullScreenStub from '@/ui-components/FullscreenStub';
import useCoreService from '@/stores/BaseStateProvider';
import { runInAction } from 'mobx';
import MenuInfo from '@/ui/Menu/MenuInfo';
import { useSnackbar } from 'notistack';

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
    submit: {
        marginRight: theme.spacing(2),
        flexShrink: 0
    },
    locationRow: {
        paddingLeft: theme.spacing(4),
    },
    geoButtonWrapper: {
        position: 'relative',
    },
    geoButton: {

    },
    geoButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

const ObserverHeaderActions = observer(HeaderActions);

const headerProps = {
    title: 'settings.widgets.dtw.weather.region.title',
    actions: (<ObserverHeaderActions />),
    style: { width: 520 },
};

function HeaderActions() {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const isAuto = coreService.storage.persistent.weatherLocation && !coreService.storage.persistent.weatherLocation?.manual;

    return (
        <React.Fragment>
            <Tooltip title={t(`settings.widgets.dtw.weather.region.autoGeolocation.${isAuto ? 'onTooltip' : 'offTooltip'}`)}>
                <span className={classes.geoButtonWrapper}>
                    <Button
                        className={classes.geoButton}
                        variant={isAuto ? "contained" : "outlined"}
                        color="primary"
                        startIcon={isAuto ? (<MyLocationIcon />) : (<CustomLocationIcon />)}
                        disabled={loading}
                        onClick={() => {
                            if (isAuto) {
                                coreService.localEventBus.call('system/widgets/weather/focusManualSearchInput')
                            } else {
                                setLoading(true);
                                widgets.autoDetectWeatherLocation()
                                    .catch(() => {
                                        enqueueSnackbar({
                                            message: t('settings.widgets.dtw.weather.userDeniedGeolocation.title'),
                                            description: t('settings.widgets.dtw.weather.userDeniedGeolocation.description'),
                                            variant: 'error',
                                        });
                                    })
                                    .finally(() => {
                                        setLoading(false);
                                    });
                            }
                        }}
                    >
                        {t(`settings.widgets.dtw.weather.region.autoGeolocation.${isAuto ? 'onTitle' : 'offTitle'}`)}
                    </Button>
                    {loading && <CircularProgress size={24} className={classes.geoButtonProgress} />}
                </span>
            </Tooltip>
        </React.Fragment>
    );
}

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
        temp = ((currTemp || 0) - 273.15) * (9/5) + 32;
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
            width={520}
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
    const { t } = useTranslation();
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.weatherLocation?.name,
        list: [],
        status: FETCH.WAIT,
    }));
    const inputRef = useRef(null);

    const handleSearch = async (event) => {
        event.preventDefault();

        store.status = FETCH.PENDING;

        try {
            const list = await widgets.searchWeatherLocation(store.searchRequest);

            runInAction(() => {
                store.list = list;
                store.status = FETCH.DONE;
            });

        } catch (e) {
            console.error(e);
            store.status = FETCH.FAILED;
        }
    }

    useEffect(() => {
        const listenId = coreService.localEventBus.on('system/widgets/weather/focusManualSearchInput', () => {
            console.log('focusManualSearchInput', inputRef)
            inputRef.current?.focus();
        });

        return () => coreService.localEventBus.removeListener(listenId);
    }, []);

    return (
        <React.Fragment>
            <MenuInfo
                width={520}
                show={!coreService.storage.persistent.weatherLocation}
                message={t('settings.widgets.dtw.weather.region.notDetected.title')}
                description={t('settings.widgets.dtw.weather.region.notDetected.description')}
            />
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={coreService.storage.persistent.weatherLocation?.name}
                    variant="outlined"
                    autoFocus
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                    }}
                />
                <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={classes.submit}
                >
                    {t('settings.widgets.dtw.weather.region.search.button')}
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
                        widgets.setWeatherLocation(item.location);
                        onClose();
                    }}
                />
            ))}
            {store.status === FETCH.DONE && store.list.length === 0 && (
                <FullScreenStub
                    message={t('settings.widgets.dtw.weather.region.search.notFound.title')}
                    description={t('settings.widgets.dtw.weather.region.search.notFound.description')}
                />
            )}
            {store.status === FETCH.FAILED && (
                <FullScreenStub
                    error={ErrorIcon}
                    message={t('settings.widgets.dtw.weather.region.search.failed.title')}
                    description={t('settings.widgets.dtw.weather.region.search.failed.description')}
                />
            )}
            {store.status === FETCH.WAIT && (
                <FullScreenStub
                    icon={SearchIcon}
                    message={t('settings.widgets.dtw.weather.region.search.wait.title')}
                    description={t('settings.widgets.dtw.weather.region.search.wait.description')}
                />
            )}
        </React.Fragment>
    );
}

const ObserverWeatherChangeLocation = observer(WeatherChangeLocation);

export { headerProps as header, ObserverWeatherChangeLocation as content };
