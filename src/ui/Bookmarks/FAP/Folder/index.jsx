import React, { useState } from 'react';
import {
    ButtonBase,
    ListItemAvatar,
    ListItemText,
    ListItem,
} from '@material-ui/core';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import FAPButton from '@/ui/Bookmarks/FAP/Button';
import PopperWrapper from '@/ui-components/PopperWrapper';
// eslint-disable-next-line import/no-cycle
import Explorer from './Explorer';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    activeIconButton: {
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: theme.palette.common.white },
    },
    icon: {
        width: 32,
        height: 32,
        margin: theme.spacing(0.5),
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
}));

function Folder(props) {
    const {
        id,
        parentId,
        name,
        isBlurBackdrop,
        variant = 'icon',
        offset = false,
    } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <PopperWrapper
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    if (isBlockEvent) return;

                    setIsOpen(false);
                }}
                modifiers={{
                    // inner: { enabled: offset },
                    offset: {
                        enabled: true,
                        offset: `${offset ? 128 : 0}px, ${offset ? 8 : 16}px`,
                    },
                }}
            >
                <Explorer id={id} />
            </PopperWrapper>
            <FAPButton
                id={id}
                name={name}
                tooltip={name}
                disableEdit={parentId === 0}
                disableRemove={parentId === 0}
                isBlurBackdrop={isBlurBackdrop}
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
                {variant === 'row' ? (
                    <ListItem
                        ref={anchorEl}
                        button
                        className={classes.row}
                        selected={isOpen}
                    >
                        <ListItemAvatar>
                            <FolderIcon />
                        </ListItemAvatar>
                        <ListItemText
                            primary={name}
                            classes={{
                                primary: classes.primaryText,
                                secondary: classes.secondaryText,
                            }}
                        />
                    </ListItem>
                ) : (
                    <ButtonBase
                        ref={anchorEl}
                        className={clsx(classes.root, isOpen && classes.activeIconButton)}
                    >
                        <FolderIcon className={classes.icon} />
                    </ButtonBase>
                )}
            </FAPButton>
        </React.Fragment>
    );
}

export default Folder;
