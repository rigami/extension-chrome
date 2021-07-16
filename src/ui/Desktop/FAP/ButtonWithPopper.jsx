import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { BKMS_FAP_POSITION } from '@/enum';
import useCoreService from '@/stores/app/BaseStateProvider';
import PopperDialog from '@/ui-components/PopoverDialog';
import FAPButton from './Button';

const useStyles = makeStyles((theme) => ({
    root: {
        // borderRadius: theme.shape.borderRadiusBold,
        // backgroundColor: theme.palette.common.white,
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
        className: externalClassName,
        classes: externalClasses = {},
        iconOpen,
        iconOpenProps = {},
        children,
        button,
        onClosed,
        ...otherProps
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const anchorEl = useRef();
    const store = useLocalObservable(() => ({
        isOpen: false,
        isShake: false,
        isBlockEvent: false,
        popper: null,
    }));

    const IconOpen = iconOpen;

    const offsetToTop = bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP;

    useEffect(() => {
        if (!store.isShake) return;

        setTimeout(() => {
            store.isShake = false;
        }, 400);
    }, [store.isShake]);

    useEffect(() => {
        if (!store.isOpen && onClosed) onClosed();
    }, [store.isOpen]);

    return (
        <React.Fragment>
            <PopperDialog
                open={store.isOpen}
                onClose={() => {
                    store.isOpen = false;
                    coreService.storage.temp.update({
                        closeFapPopper: null,
                        shakeFapPopper: null,
                    });
                }}
                anchorEl={anchorEl.current}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                {children}
            </PopperDialog>
            <span
                ref={anchorEl}
                className={externalClasses.root}
            >
                <span className={clsx(classes.shakeWrapper, classes.transition, store.isShake && classes.buttonShake)}>
                    <FAPButton
                        className={clsx(
                            classes.root,
                            externalClassName,
                            externalClasses.backdrop,
                            classes.transition,
                            store.isOpen && offsetToTop && classes.offsetButtonTop,
                            store.isOpen && !offsetToTop && classes.offsetButtonBottom,
                            store.isOpen && classes.activeIconButton,
                        )}
                        id={id}
                        name={name}
                        tooltip={store.isOpen ? t('button.close') : name}
                        {...otherProps}
                        onMouseDown={() => {
                            if (!store.isOpen) store.isBlockEvent = true;
                        }}
                        onClick={() => {
                            if (store.isBlockEvent) {
                                if (coreService.storage.temp.data.closeFapPopper) {
                                    coreService.storage.temp.data.closeFapPopper();
                                }

                                coreService.storage.temp.update({
                                    closeFapPopper: () => {
                                        store.isOpen = false;
                                        coreService.storage.temp.update({
                                            closeFapPopper: null,
                                            shakeFapPopper: null,
                                        });
                                    },
                                    shakeFapPopper: () => {
                                        store.isShake = true;
                                    },
                                });
                                store.isOpen = true;
                            }
                            store.isBlockEvent = false;
                        }}
                    >
                        {button}
                        {!button && (
                            <IconOpen {...iconOpenProps} className={classes.icon} />
                        )}
                    </FAPButton>
                </span>
            </span>
        </React.Fragment>
    );
}

export default observer(ButtonWithPopper);
