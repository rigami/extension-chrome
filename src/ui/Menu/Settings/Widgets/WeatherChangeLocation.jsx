import React from 'react';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/AppStateProvider';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import {
    Button,
    Divider,
    InputBase,
    LinearProgress,
} from '@material-ui/core';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { round } from 'lodash';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { eventToBackground } from '@/stores/backgroundApp/busApp';
import useCoreService from '@/stores/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    row: {
        width: 520,
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
}));

const headerProps = { title: 'settings.widgets.dtw.weather.region.title' };

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
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.weatherLocation?.name,
        list: [],
        status: FETCH.WAIT,
    }));

    const handleSearch = async (event) => {
        event.preventDefault();

        store.status = FETCH.PENDING;

        try {
            eventToBackground(
                'widgets/weather/searchLocation',
                { query: store.searchRequest },
                (list) => {
                    console.log('widgets/weather/searchLocation', list)
                    store.list = list;
                    store.status = FETCH.DONE;
            });

        } catch (e) {
            console.error(e);
            store.status = FETCH.FAILED;
        }
    }

    return (
        <React.Fragment>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    className={classes.input}
                    placeholder={t('category.createPlaceholder')}
                    variant="outlined"
                    autoFocus
                    defaultValue={coreService.storage.persistent.weatherLocation?.name}
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
                    Search
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
                        eventToBackground('widgets/weather/setLocation',{ location: item.location });
                        onClose();
                    }}
                />
            ))}
            {store.status === FETCH.FAILED && (
                <FullScreenStub
                    message={t('settings.widgets.dtw.weather.region.search.failed.title')}
                    description={t('settings.widgets.dtw.weather.region.search.failed.description')}
                />
            )}
            {store.status === FETCH.WAIT && (
                <FullScreenStub
                    message={t('settings.widgets.dtw.weather.region.search.wait.title')}
                    description={t('settings.widgets.dtw.weather.region.search.wait.description')}
                />
            )}
        </React.Fragment>
    );
}

const ObserverWeatherChangeLocation = observer(WeatherChangeLocation);

export { headerProps as header, ObserverWeatherChangeLocation as content };
