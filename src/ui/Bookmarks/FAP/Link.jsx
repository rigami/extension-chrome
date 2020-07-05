import React, { useState } from 'react'
import {
    ButtonBase,
    Tooltip,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import EditMenu from '@/ui/Bookmarks/ContextEditMenu'
import { observer } from 'mobx-react-lite';
import Image from "@/ui-components/Image";
import {BKMS_VARIANT} from "@/enum";

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: 0,
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
    icon: {

    },
    roundedIcon: {
        borderRadius: theme.shape.borderRadiusBold,
    },
}));

function LinkButton({ id, name, url, imageUrl, icoVariant, isBlurBackdrop }) {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        setPosition({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
        setIsOpen(true);
    };

    const handleCloseMenu = () => {
        setIsOpen(false);
    };

    const handleClick = (event) => {
        if (!url) return;

        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, "_self");
        }
    };

    return (
        <React.Fragment>
            <EditMenu
                id={id}
                type="bookmark"
                isOpen={isOpen}
                onClose={handleCloseMenu}
                position={position}
            />
            <Tooltip
                title={(
                    <React.Fragment>
                        {name}
                        <br />
                        <Typography variant="caption">{url}</Typography>
                    </React.Fragment>
                )}
                enterDelay={400}
                enterNextDelay={400}
            >
                <ButtonBase
                    className={clsx(
                        classes.root,
                        isBlurBackdrop && classes.rootBlur,
                        classes.roundedIcon,
                    )}
                    onMouseUp={handleClick}
                    onContextMenu={handlerContextMenu}
                >
                    <Image
                        src={imageUrl}
                        className={classes.icon}
                        alternativeIcon={icoVariant === BKMS_VARIANT.SYMBOL ? name[0].toUpperCase() : undefined}
                    />
                </ButtonBase>
            </Tooltip>
        </React.Fragment>
    );
}

export default observer(LinkButton);
