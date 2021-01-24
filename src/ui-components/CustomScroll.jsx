import React, { forwardRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Scrollbar from 'react-scrollbars-custom';
import clsx from 'clsx';

const exportClasses = (theme) => ({
    root: {
        height: '100%',
        width: '100%',
    },
    scrollWrapper: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: 'translate3d(0,0,0)',
    },
    reverse: {
        display: 'flex',
        flexDirection: 'column-reverse',
    },
    scrollBar: {
        position: 'absolute',
        right: 4,
        top: 4,
        bottom: 4,
        pointerEvents: 'none',
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    scrollThumb: {
        backgroundColor: theme.palette.getContrastText(theme.palette.background.paper),
        width: 4,
        borderRadius: 2,
        pointerEvents: 'auto',
    },
});

const useStyles = makeStyles(exportClasses);

function CustomScroll(props, ref) {
    const {
        children,
        refScroll,
        reverse,
        className: externalClassName,
        classes: externalClasses = {},
        ...other
    } = props;
    const classes = useStyles();

    return (
        <Scrollbar
            className={clsx(classes.root, externalClassName)}
            noDefaultStyles
            scrollerProps={{
                renderer: (props) => {
                    const { elementRef, ...restProps } = props;
                    return (
                        <div
                            {...restProps}
                            ref={elementRef}
                            className={clsx(reverse && classes.reverse)}
                        />
                    );
                },
            }}
            wrapperProps={{
                renderer: (props) => {
                    const { elementRef, ...restProps } = props;
                    return <div {...restProps} ref={elementRef} className={classes.scrollWrapper} />;
                },
            }}
            trackYProps={{
                renderer: (props) => {
                    const { elementRef, ...restProps } = props;
                    return (
                        <div {...restProps} ref={elementRef} className={clsx(classes.scrollBar, externalClasses.trackY)} />
                    );
                },
            }}
            thumbYProps={{
                renderer: (props) => {
                    const { elementRef, ...restProps } = props;
                    return <div {...restProps} ref={elementRef} className={clsx(classes.scrollThumb, externalClasses.thumbY)} />;
                },
            }}
            momentum
            noScrollX={false}
            {...other}
            ref={refScroll}
            scrollDetectionThreshold={30}
            elementRef={ref}
        >
            {children}
        </Scrollbar>
    );
}

export { exportClasses as classes };

export default forwardRef(CustomScroll);
