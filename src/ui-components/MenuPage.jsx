import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {
    List,
    ListItem,
    ListItemText,
    Divider,
    Drawer,
    ListItemIcon,
    ListItemAvatar,
    Avatar,
    IconButton,
    Collapse,
    Box
} from "@material-ui/core";
import {
    ArrowBack as BackIcon
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        borderRadius: theme.spacing(3),
        padding: theme.spacing(.5),
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    list: {
        height: '100vh',
        overflow: 'auto',
    },
    fixedScroll: {
        overflow: 'hidden',
    },
    header: {

    },
    backButton: {
        padding: theme.spacing(1)
    },
    rowExpandedWrapper: {
        height: '100vh',
        overflow: 'auto',
    },
    rowsWrapper: {
        transition: '.5s ease',
    },
}));

function MenuPage({ title, onBack, rows, rowRender, expandedRowIndex, renderRowExpanded }) {
    const classes = useStyles();

    console.log(expandedRowIndex, rows.slice(0, expandedRowIndex).length, rows.slice(expandedRowIndex+1).length, rows.length, rows[expandedRowIndex], rows)

    return (
        <List className={clsx(classes.list, expandedRowIndex !== null && classes.fixedScroll)} disablePadding>
            <Collapse
                in={expandedRowIndex === null}
                timeout={500}
            >
                <Box className={classes.rowsWrapper} style={{ opacity: expandedRowIndex === null? 1 : 0 }}>
                    <ListItem className={clsx(classes.row, classes.header)}>
                        <ListItemIcon>
                            <IconButton className={classes.backButton} onClick={() => onBack()}>
                                <BackIcon />
                            </IconButton>
                        </ListItemIcon>
                        <ListItemText primary={title} />
                    </ListItem>
                    {rows.slice(0, expandedRowIndex).map((row, index) => (
                        <div key={index}>{rowRender(row, index)}</div>
                    ))}
                </Box>
            </Collapse>
            <Collapse
                in={expandedRowIndex !== null}
                timeout={500}
            >
                <Box className={classes.rowExpandedWrapper}>
                    {expandedRowIndex !== null && renderRowExpanded(rows[expandedRowIndex], expandedRowIndex)}
                </Box>
            </Collapse>
            <Collapse
                in={expandedRowIndex === null}

                timeout={500}
            >
                <Box className={classes.rowsWrapper} style={{ opacity: expandedRowIndex === null? 1 : 0 }}>
                    {rows.slice(expandedRowIndex === null ? 0 : expandedRowIndex).map((row, index) => (
                        <div key={index + expandedRowIndex}>{rowRender(row, index + expandedRowIndex)}</div>
                    ))}
                </Box>
            </Collapse>
        </List>
    );
}

export default MenuPage;