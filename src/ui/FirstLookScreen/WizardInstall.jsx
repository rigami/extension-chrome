import React, { useEffect, useState } from 'react';
import {
    Box,
    Button, ButtonBase,
    Container,
    DialogActions,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    CardActions,
    FormControl,
    FormGroup,
    FormLabel,
    Checkbox,
    Radio,
    RadioGroup,
    FormControlLabel,
} from '@material-ui/core';
import Logo from '@/ui-components/Logo';
import { ArrowForward as NextIcon, ArrowBack as BackIcon, WarningRounded as WarnIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { ACTIVITY } from '@/enum';
import clsx from 'clsx';
import SchemeBackground from '@/images/scheme_background.svg';
import SchemeBookmarks from '@/images/scheme_bookmarks.svg';
import SchemeFapZen from '@/images/scheme_fap_zen.svg';
import SchemeFapProductivity from '@/images/scheme_fap_productivity.svg';
import SchemeWidgetDate from '@/images/scheme_widget_date.svg';
import SchemeWidgetTime from '@/images/scheme_widget_time.svg';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import GreetingPreview from '@/ui/Bookmarks/GreetingView/Greeting';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    container: {
        margin: 'auto',
        marginTop: theme.spacing(10),
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    progress: {
        width: 400,
        margin: theme.spacing(2, 0),
    },
    banner: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.backdrop,
        margin: theme.spacing(2, 0),
    },
    iconWrapper: {
        minWidth: theme.spacing(5),
        alignSelf: 'baseline',
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75),
    },
    icon: { color: theme.palette.warning.main },
    actions: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginTop: 'auto',
    },
    questionProgress: { marginTop: theme.spacing(2) },
    checkboxButton: {
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: '1px solid transparent',
        display: 'flex',
        flexDirection: 'column',
    },
    activeCheckboxButton: {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        border: `1px solid ${theme.palette.primary.main}`,
    },
    image: {
        width: 420,
        height: 298,
        backgroundColor: theme.palette.background.paper,
        marginBottom: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
    },
    checkboxesContainer: { padding: theme.spacing(2, 0) },
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

function CheckboxWithImage({ active, image, subtitle, onClick }) {
    const classes = useStyles();

    const Image = image;

    return (
        <ButtonBase
            className={clsx(classes.checkboxButton, active && classes.activeCheckboxButton)}
            onClick={onClick}
        >
            <Image className={classes.image} />
            <Typography color="textSecondary" variant="body2">{subtitle}</Typography>
        </ButtonBase>
    );
}

function DefaultActivity({ defaultSettings, onMutationSettings }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const [activity, setActivity] = useState(defaultSettings.activity);

    useEffect(() => {
        onMutationSettings({
            ...defaultSettings,
            activity,
        });
    }, [activity]);

    return (
        <CardActions className={classes.checkboxesContainer}>
            <CheckboxWithImage
                active={activity === ACTIVITY.DESKTOP}
                image={SchemeBackground}
                subtitle={t('defaultActivityQuestion.button.desktop')}
                onClick={() => setActivity(ACTIVITY.DESKTOP)}
            />
            <CheckboxWithImage
                active={activity === ACTIVITY.BOOKMARKS}
                image={SchemeBookmarks}
                subtitle={t('defaultActivityQuestion.button.bookmarks')}
                onClick={() => setActivity(ACTIVITY.BOOKMARKS)}
            />
        </CardActions>
    );
}

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
            </Box>
        </Box>
    );
}

function Greeting({ defaultSettings, onMutationSettings, onNext, onDisabledNext }) {
    return (
        <Box display="flex" my={4}>
            <GreetingPreview
                force
                onHide={() => {
                    onMutationSettings({
                        ...defaultSettings,
                        userName: null,
                    });
                    onNext();
                }}
                onChange={(userName) => {
                    onDisabledNext(!userName);
                    onMutationSettings({
                        ...defaultSettings,
                        userName: userName || null,
                    });
                }}
            />
        </Box>
    );
}

const questions = [
    {
        id: 'defaultActivity',
        ui: DefaultActivity,
    },
    {
        id: 'desktopEnvironment',
        ui: DesktopEnvironment,
    },
    {
        id: 'greeting',
        ui: Greeting,
    },
];

function WizardInstall({ defaultSettings, onCancel, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const [settings, setSettings] = useState(defaultSettings);
    const [question, setQuestion] = useState(0);
    const [disabledNext, setDisabledNext] = useState(false);

    const handleNext = () => {
        setQuestion(question + 1);
    };

    const handleBack = () => {
        setDisabledNext(false);
        setQuestion(question - 1);
    };

    const handleEnd = () => {
        onEnd(settings);
    };

    const handleMutationSettings = (newSettings) => {
        setSettings(newSettings);
    };

    const Question = questions[question].ui;

    return (
        <Box className={classes.root}>
            <Container maxWidth="lg" className={classes.container}>
                <Logo />
                <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.questionProgress}
                >
                    {t('question', {
                        now: question + 1,
                        total: questions.length,
                    })}
                </Typography>
                <Typography variant="h2">{t(`${questions[question].id}Question.title`)}</Typography>
                <Question
                    defaultSettings={settings}
                    onMutationSettings={handleMutationSettings}
                    onNext={question === questions.length - 1 ? handleEnd : handleNext}
                    onDisabledNext={(isDisabled) => setDisabledNext(isDisabled)}
                />
                <DialogActions className={classes.actions}>
                    <Button
                        startIcon={(<BackIcon />)}
                        onClick={question === 0 ? onCancel : handleBack}
                        disabled={question < 0}
                    >
                        {t('button.back')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={(<NextIcon />)}
                        onClick={question === questions.length - 1 ? handleEnd : handleNext}
                        disabled={question > questions.length - 1 || disabledNext}
                    >
                        {t('button.next')}
                    </Button>
                </DialogActions>
            </Container>
        </Box>
    );
}

export default WizardInstall;
