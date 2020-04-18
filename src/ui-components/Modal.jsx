import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Button,
    Typography,
    IconButton,
} from "@material-ui/core";
import {
    CloseRounded as CloseIcon,
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
    scrollContainer: {
        alignItems: 'flex-end',
    },
    title: {
        margin: 0,
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
        paddingRight: theme.spacing(8),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    denseBodyHorizontal: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    denseBodyVertical: {
        paddingTop: 0,
        paddingBottom: 0,
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function AdvancedDialogTitle({ children, onClose, ...other }) {
    const classes = useStyles();

    return (
        <DialogTitle disableTypography className={classes.title} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose && (
                <IconButton className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            )}
        </DialogTitle>
    );
}

function Modal({ title, onClose, showCloseInHeader, children, buttons, denseBody, ...other }) {
    const classes = useStyles();

    return (
        <Dialog
            TransitionComponent={Transition}
            classes={{
                container: classes.scrollContainer,
            }}
            {...other}
            onClose={onClose}
            disableEnforceFocus
        >
            <AdvancedDialogTitle onClose={showCloseInHeader && onClose}>{title}</AdvancedDialogTitle>
            <DialogContent className={clsx(
                (typeof denseBody === "boolean" || (denseBody && denseBody.horizontal)) && classes.denseBodyHorizontal,
                (typeof denseBody === "boolean" || (denseBody && denseBody.vertical)) && classes.denseBodyVertical,
            )}>
                {children}
            </DialogContent>
            {buttons && (
                <DialogActions>
                    {buttons.map(({ title, ...other }) => (
                        <Button {...other}>
                            {title}
                        </Button>
                    ))}
                </DialogActions>
            )}
        </Dialog>
    );
}

export default Modal;