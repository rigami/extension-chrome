import React, {useState, useRef, useEffect} from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {
    ListItem,
    Collapse,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Box, ListItemIcon, IconButton
} from "@material-ui/core";
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    ArrowBack as BackIcon
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    pageRoot: {
        position: 'absolute',
        width: '100%',
        left: 0,
        zIndex: 1,
        backgroundColor: '#fff',
        transition: `
            top 300ms cubic-bezier(0.4, 0, 0.2, 1),
            height 300ms cubic-bezier(0.4, 0, 0.2, 1),
            0ms`
    },
    pageWrapper: {
        height: '100vh'
    },
    backButton: {
        padding: theme.spacing(1)
    },
}));

function CategoryWrapper({ category, isOpen, onOpen, onClose, children, width }) {
    const classes = useStyles();
    const collapseRef = useRef(null);
    const itemRef = useRef(null);
    const [offsetTop, setOffsetTop] = useState(null);

    useEffect(() => {
        if(isOpen){
            console.log(itemRef.current.offsetTop)
            setOffsetTop(0);
        }else{
            setOffsetTop(itemRef.current.offsetTop);
        }
    }, [isOpen]);

    return (
        <Fragment>
            <Collapse
                in={isOpen}
                ref={collapseRef}
                unmountOnExit
                style={{ top: offsetTop, width: width.wide }}
                className={classes.pageRoot}
            >
                <Box className={classes.pageWrapper}>
                    <ListItem>
                        <ListItemIcon>
                            <IconButton className={classes.backButton} onClick={() => onClose()}>
                                <BackIcon />
                            </IconButton>
                        </ListItemIcon>
                        <ListItemText primary={category.title} />
                    </ListItem>
                    {children}
                </Box>
            </Collapse>
            <ListItem
                button
                className={classes.row}
                ref={itemRef}
                onClick={() => onOpen()}
                style={{ width: width.default }}
            >
                <ListItemAvatar>
                    <Avatar>
                        <SettingsIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={category.title} secondary={category.description} />
            </ListItem>
        </Fragment>
    );
}

export default CategoryWrapper;