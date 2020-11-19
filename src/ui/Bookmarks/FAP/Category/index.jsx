import React, { useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Explorer from './Explorer';
import FAPButton from '@/ui/Bookmarks/FAP/Button';
import PopperWrapper from '@/ui-components/PopperWrapper';

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
}));

function Category({ id, name, color, isBlurBackdrop }) {
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
            >
                <Explorer id={id} />
            </PopperWrapper>
            <FAPButton
                id={id}
                name={name}
                tooltip={name}
                isBlurBackdrop={isBlurBackdrop}
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
                    <TagIcon style={{ color }} className={classes.icon} />
                </ButtonBase>
            </FAPButton>
        </React.Fragment>
    );
}

export default Category;
