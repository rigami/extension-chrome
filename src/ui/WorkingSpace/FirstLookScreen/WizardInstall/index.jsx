import React, { useState } from 'react';
import {
    Box,
    Button,
    DialogActions,
    IconButton,
    Typography,
} from '@material-ui/core';
import {
    ArrowForward as NextIcon,
    ArrowBack as BackIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import DesktopEnvironment from './Steps/DesktopEnvironment';
import DefaultActivity from './Steps/DefaultActivity';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        // height: '100vh',
    },
    container: {
        margin: 'auto',
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
    containerDesktop: {
        position: 'relative',
        display: 'flex',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
    },
    backButton: {
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(-1.5),
        color: theme.palette.text.primary,
        alignSelf: 'flex-start',
        '& $svg': {
            width: 34,
            height: 34,
        },
    },
}));

const questions = [
    BUILD === 'full' && {
        id: 'defaultActivity',
        ui: DefaultActivity,
    },
    {
        id: 'desktopEnvironment',
        ui: DesktopEnvironment,
    },
].filter((isExist) => isExist);

function WizardInstall({ onCancel, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
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
        onEnd();
    };

    const Question = questions[question].ui;

    return (
        <Box className={classes.root}>
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

            <Box className={classes.header}>
                <IconButton
                    onClick={question === 0 ? onCancel : handleBack}
                    className={classes.backButton}
                >
                    <BackIcon />
                </IconButton>
                <Typography variant="h3">{t(`${questions[question].id}Question.title`)}</Typography>
            </Box>
            <Question
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
                    endIcon={question === questions.length - 1 ? undefined : (<NextIcon />)}
                    onClick={question === questions.length - 1 ? handleEnd : handleNext}
                    disabled={question > questions.length - 1 || disabledNext}
                >
                    {question === questions.length - 1 ? t('button.finish') : t('button.next')}
                </Button>
            </DialogActions>
        </Box>
    );
}

export default WizardInstall;
