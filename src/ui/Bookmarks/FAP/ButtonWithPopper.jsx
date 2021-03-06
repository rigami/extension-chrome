import React, { useRef } from 'react';
import { ButtonBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import FAPButton from '@/ui/Bookmarks/FAP/Button';
import PopperWrapper, { TARGET_CLICK } from '@/ui-components/PopperWrapper';
import { useTranslation } from 'react-i18next';
import { CloseRounded as CloseIcon } from '@material-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import ReactResizeDetector from 'react-resize-detector';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { BKMS_FAP_POSITION } from '@/enum';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
    },
    activeIconButton: { backgroundColor: theme.palette.common.white },
    icon: {
        width: 28,
        height: 28,
        margin: theme.spacing(0.75),
    },
    shakeWrapper: { display: 'block' },
    buttonShake: {
        animation: '$shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        backfaceVisibility: 'hidden',
    },
    transition: {
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    offsetButtonTop: { transform: 'translateY(12px)' },
    offsetButtonBottom: { transform: 'translateY(-12px)' },
    '@keyframes shake': {
        '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
        '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
        '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
        '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
    },
}));

function ButtonWithPopper(props) {
    const {
        id,
        name,
        classes: externalClasses = {},
        iconOpen,
        iconOpenProps = {},
        iconClose = CloseIcon,
        children,
        popperModifiers = {},
        popperProps = {},
        ...otherProps
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const bookmarksService = useBookmarksService();
    const anchorEl = useRef();
    const store = useLocalObservable(() => ({
        isOpen: false,
        isShake: false,
        isBlockEvent: false,
        popper: null,
    }));

    const IconOpen = iconOpen;
    const IconClose = iconClose;

    const updatePopper = () => {
        if (!store.popper) return;

        requestAnimationFrame(() => {
            store.popper.update();
        });
    };

    const offsetToTop = bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP;

    return (
        <React.Fragment>
            <PopperWrapper
                isOpen={store.isOpen}
                anchorEl={anchorEl.current}
                onClose={(reason) => {
                    if (store.isBlockEvent) return;

                    if (reason === TARGET_CLICK.ANCHOR) {
                        store.isOpen = false;
                    } else {
                        store.isShake = true;
                        setTimeout(() => {
                            store.isShake = false;
                        }, 400);
                    }
                }}
                modifiers={{
                    offset: {
                        enabled: true,
                        offset: '0px, 32px',
                    },
                    ...popperModifiers,
                }}
                popperProps={popperProps}
                onService={(popperInstance) => { store.popper = popperInstance; }}
            >
                <ReactResizeDetector handleWidth handleHeight onResize={updatePopper}>
                    {children}
                </ReactResizeDetector>
            </PopperWrapper>
            <span
                ref={anchorEl}
                className={externalClasses.root}
            >
                <span className={clsx(classes.shakeWrapper, classes.transition, store.isShake && classes.buttonShake)}>
                    <FAPButton
                        className={clsx(
                            externalClasses.backdrop,
                            classes.transition,
                            store.isOpen && offsetToTop && classes.offsetButtonTop,
                            store.isOpen && !offsetToTop && classes.offsetButtonBottom,
                        )}
                        id={id}
                        name={name}
                        tooltip={store.isOpen ? t('close') : name}
                        {...otherProps}
                        onMouseDown={() => {
                            if (!store.isOpen) store.isBlockEvent = true;
                        }}
                        onClick={() => {
                            if (store.isBlockEvent) store.isOpen = true;
                            store.isBlockEvent = false;
                        }}
                    >
                        <ButtonBase
                            className={clsx(
                                classes.root,
                                store.isOpen && classes.activeIconButton,
                            )}
                        >
                            {store.isOpen ? (
                                <IconClose className={classes.icon} />
                            ) : (
                                <IconOpen {...iconOpenProps} className={classes.icon} />
                            )}
                        </ButtonBase>
                    </FAPButton>
                </span>
            </span>
        </React.Fragment>
    );
}

export default observer(ButtonWithPopper);
