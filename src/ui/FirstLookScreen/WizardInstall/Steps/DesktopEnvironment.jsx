import React, { useEffect, useState } from 'react';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SchemeWidgetTime from '@/images/scheme_widget_time.svg';
import SchemeWidgetDate from '@/images/scheme_widget_date.svg';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import SchemeFapProductivity from '@/images/scheme_fap_productivity.svg';
import SchemeFapZen from '@/images/scheme_fap_zen.svg';
import SchemeBackground from '@/images/scheme_background.svg';

const useStyles = makeStyles((theme) => ({
    containerDesktop: {
        position: 'relative',
        display: 'flex',
    },
    background: {
        width: 650,
        height: 460,
    },
    widgets: {
        position: 'absolute',
        left: theme.spacing(2),
        bottom: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    fapProductivity: {
        height: theme.spacing(3),
        width: 'auto',
        marginTop: theme.spacing(1),
    },
    fapZen: {
        height: theme.spacing(4),
        width: 'auto',
        marginTop: theme.spacing(1),
    },
    time: {
        height: theme.spacing(5),
        width: 'auto',
    },
    date: {
        height: theme.spacing(4),
        width: 'auto',
        marginTop: theme.spacing(1),
    },
    marginTop: { marginTop: theme.spacing(4) },
}));

function DesktopEnvironment({ defaultSettings, onMutationSettings }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const [useTime, setUseTime] = useState(defaultSettings.useTime);
    const [useDate, setUseDate] = useState(defaultSettings.useDate);
    const [fapStyle, setFapStyle] = useState(defaultSettings.fapStyle);

    useEffect(() => {
        onMutationSettings({
            ...defaultSettings,
            useTime,
            useDate,
            fapStyle,
        });
    }, [useTime, useDate, fapStyle]);

    return (
        <Box display="flex" my={4}>
            <Box className={classes.containerDesktop}>
                <Box className={classes.widgets}>
                    {useTime && (<SchemeWidgetTime className={classes.time} />)}
                    {useDate && (<SchemeWidgetDate className={classes.date} />)}
                    {fapStyle === FAP_STYLE.PRODUCTIVITY && (
                        <SchemeFapProductivity className={classes.fapProductivity} />
                    )}
                    {fapStyle === FAP_STYLE.CONTAINED && (
                        <SchemeFapZen className={classes.fapZen} />
                    )}
                </Box>
                <SchemeBackground className={classes.background} />
            </Box>
            <Box ml={8} display="flex" flexDirection="column">
                <FormControl component="fieldset">
                    <FormLabel component="legend">{t('desktopEnvironmentQuestion.widgets')}</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={useTime}
                                    onChange={(event) => setUseTime(event.currentTarget.checked)}
                                    name="time"
                                />
                            )}
                            label={t('desktopEnvironmentQuestion.button.useTime')}
                        />
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={useDate}
                                    onChange={(event) => setUseDate(event.currentTarget.checked)}
                                    name="date"
                                />
                            )}
                            label={t('desktopEnvironmentQuestion.button.useDate')}
                        />
                    </FormGroup>
                </FormControl>
                {BUILD === 'full' && (
                    <FormControl component="fieldset" className={classes.marginTop}>
                        <FormLabel component="legend">{t('desktopEnvironmentQuestion.fap')}</FormLabel>
                        <RadioGroup value={fapStyle} onChange={(event) => setFapStyle(event.target.value)}>
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

export default DesktopEnvironment;
