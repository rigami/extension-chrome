import React, {useState, useRef, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import PropTypes from 'prop-types';
import {
    Card,
    CardHeader,
    CardActions,
    Avatar,
    IconButton,
    Typography,
    Button,
    CircularProgress,
} from "@material-ui/core";
import {
    CloseRounded as CloseIcon,
    CheckRounded as SuccessIcon,
    ErrorRounded as ErrorIcon,
    WarningRounded as WarningIcon,
} from "@material-ui/icons";
import {useSnackbar} from 'notistack';

import {makeStyles, useTheme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 400,
        minWidth: 344,
    },
    header: {
        minHeight: 56,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    snackTypeIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '0.875rem',
        fontWeight: 'bold',
    },
    description: {
        fontSize: '0.75rem',
    },
    headerAction: {
        marginTop: 0,
    },
    buttons: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
}));

function Snackbar({id, message, description: defaultDescription, variant, buttons, progressEffect}, ref) {
    const theme = useTheme();
    const classes = useStyles();
    const {closeSnackbar} = useSnackbar();
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState(defaultDescription);

    useEffect(() => progressEffect && progressEffect(
        (progressValue) => setProgress(progressValue),
        (descriptionValue) => setDescription(descriptionValue)
    ), []);

    const handleDismiss = () => {
        closeSnackbar(id);
    };

    return (
        <Card className={classes.root} ref={ref}>
            <CardHeader
                classes={{
                    root: classes.header,
                    avatar: classes.snackTypeIcon,
                    title: classes.title,
                    subheader: classes.description,
                    action: classes.headerAction,
                }}
                avatar={variant && (
                    <Fragment>
                        {variant === 'success' && (<SuccessIcon color='primary'/>)}
                        {variant === 'error' && (<ErrorIcon color='error'/>)}
                        {variant === 'warning' && (<WarningIcon style={{color: theme.palette.warning.main}}/>)}
                        {variant === 'progress' && (
                            <CircularProgress size={26} thickness={3.4} variant="determinate" value={progress}/>
                        )}
                    </Fragment>
                )}
                action={
                    <IconButton className={classes.expand} onClick={handleDismiss}>
                        <CloseIcon/>
                    </IconButton>
                }
                title={message}
                subheader={description}
            />
            {buttons && (
                <CardActions className={classes.buttons}>
                    {buttons.map(({title, onClick}) => (
                        <Button onClick={onClick}>{title}</Button>
                    ))}
                </CardActions>
            )}
        </Card>
    );
}

Snackbar.propTypes = {
    id: PropTypes.number.isRequired,
};

export default React.forwardRef(Snackbar);