import React, { useState, useEffect, forwardRef } from 'react';
import {
    Card,
    CardHeader,
    CardActions,
    IconButton,
    Button,
    CircularProgress,
} from '@material-ui/core';
import {
    CloseRounded as CloseIcon,
    CheckRounded as SuccessIcon,
    ErrorRounded as ErrorIcon,
    WarningRounded as WarningIcon,
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 400,
        minWidth: 344,
        pointerEvents: 'all',
        border: `1px solid ${theme.palette.divider}`,
        marginTop: theme.spacing(2),
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
        whiteSpace: 'break-spaces',
    },
    headerAction: { marginTop: 0 },
    buttons: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
}));

function Snackbar(props, ref) {
    const {
        id,
        message,
        description: defaultDescription,
        content,
        variant,
        buttons,
        progressEffect,
        closeButton,
    } = props;

    const classes = useStyles();
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState(defaultDescription);

    useEffect(() => progressEffect && progressEffect(
        (progressValue) => setProgress(progressValue),
        (descriptionValue) => setDescription(descriptionValue),
    ), []);

    const handleDismiss = () => {
        closeSnackbar(id);
    };

    return (
        <Card className={classes.root} ref={ref} elevation={16}>
            {(message || description || closeButton) && (
                <CardHeader
                    classes={{
                        root: classes.header,
                        avatar: classes.snackTypeIcon,
                        title: classes.title,
                        subheader: classes.description,
                        action: classes.headerAction,
                    }}
                    avatar={variant && (
                        <React.Fragment>
                            {variant === 'success' && (<SuccessIcon color="primary" />)}
                            {variant === 'error' && (<ErrorIcon color="error" />)}
                            {variant === 'warning' && (<WarningIcon style={{ color: theme.palette.warning.main }} />)}
                            {variant === 'progress' && (
                                <CircularProgress
                                    size={26}
                                    thickness={3.4}
                                    variant={progressEffect ? 'determinate' : 'indeterminate'}
                                    value={progress}
                                />
                            )}
                        </React.Fragment>
                    )}
                    action={closeButton && (
                        <IconButton
                            data-ui-path="snackbar.close"
                            className={classes.expand}
                            onClick={handleDismiss}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                    title={message}
                    subheader={description}
                />
            )}
            {content}
            {buttons && (
                <CardActions className={classes.buttons}>
                    {buttons.map(({ title, onClick, dataUiPath }) => (
                        <Button
                            onClick={onClick}
                            key={title}
                            data-ui-path={dataUiPath || `snackbar.${title}`}
                        >
                            {title}
                        </Button>
                    ))}
                </CardActions>
            )}
        </Card>
    );
}

export default forwardRef(Snackbar);
