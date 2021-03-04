import React, { useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import {
    CloseRounded as CloseIcon,
    LabelRounded as TagIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import FAPButton from '@/ui/Bookmarks/FAP/Button';
import PopperWrapper, { TARGET_CLICK } from '@/ui-components/PopperWrapper';
import { useTranslation } from 'react-i18next';
import Explorer from './Explorer';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    activeIconButton: {
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: theme.palette.common.white },
    },
    icon: {
        width: 28,
        height: 28,
        margin: theme.spacing(0.75),
    },
    button: {
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    offsetButton: { transform: 'translateY(-12px)' },
}));

function Category(props) {
    const {
        id,
        name,
        color,
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <PopperWrapper
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={(reason) => {
                    if (isBlockEvent) return;

                    if (reason === TARGET_CLICK.ANCHOR) {
                        setIsOpen(false);
                    }
                }}
                modifiers={{
                    // inner: { enabled: offset },
                    offset: {
                        enabled: true,
                        offset: '0px, 32px',
                    },
                }}
            >
                <Explorer id={id} />
            </PopperWrapper>
            <FAPButton
                className={clsx(externalClassName, classes.button, isOpen && classes.offsetButton)}
                id={id}
                name={name}
                tooltip={isOpen ? t('close') : name}
                type="category"
            >
                <ButtonBase
                    ref={anchorEl}
                    onMouseDown={() => {
                        if (!isOpen) setIsBlockEvent(true);
                    }}
                    className={clsx(classes.root, isOpen && classes.activeIconButton)}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        if (isBlockEvent) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                >
                    {isOpen ? (
                        <CloseIcon className={classes.icon} />
                    ) : (
                        <TagIcon style={{ color }} className={classes.icon} />
                    )}
                </ButtonBase>
            </FAPButton>
        </React.Fragment>
    );
}

export default Category;
