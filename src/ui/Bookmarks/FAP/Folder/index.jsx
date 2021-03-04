import React, { useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import {
    FolderRounded as FolderIcon,
    CloseRounded as CloseIcon,
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
    primaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
    secondaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
    row: {
        margin: 0,
        padding: theme.spacing(1, 2),
        borderRadius: 0,
    },
    button: {
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    offsetButton: { transform: 'translateY(-12px)' },
}));

function Folder(props) {
    const {
        id,
        parentId,
        name,
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
                disableEdit={parentId === 0}
                disableRemove={parentId === 0}
                type="folder"
                onMouseDown={() => {
                    if (!isOpen) setIsBlockEvent(true);
                }}
                onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                    if (isBlockEvent) setIsOpen(true);
                    setIsBlockEvent(false);
                }}
            >
                <ButtonBase
                    ref={anchorEl}
                    className={clsx(classes.root, isOpen && classes.activeIconButton)}
                >
                    {isOpen ? (
                        <CloseIcon className={classes.icon} />
                    ) : (
                        <FolderIcon className={classes.icon} />
                    )}
                </ButtonBase>
            </FAPButton>
        </React.Fragment>
    );
}

export default Folder;
