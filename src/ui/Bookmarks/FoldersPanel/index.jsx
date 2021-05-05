import React from 'react';
import { Box, CardActionArea, CardHeader } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import LogoText from '@/images/logo-text.svg';
import Folders from './Folders';
import LastClosed from './LastClosed';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 260,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: fade(theme.palette.background.backdrop, 0.3),
        paddingTop: theme.spacing(2),
    },
    avatar: {
        display: 'flex',
        marginRight: theme.spacing(1),
    },
    header: {
        height: 42,
        padding: 0,
    },
    padding: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },
    appLogoIcon: {
        width: 20,
        height: 20,
    },
    appLogoText: {
        height: 20,
        width: 'auto',
        fill: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    appLogoTextWrapper: { display: 'flex' },
    activeGreetingView: { backgroundColor: theme.palette.action.selected },
    offsetTop: { marginTop: 'auto' },
}));

function FoldersPanel({ searchService: service }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <CardActionArea onClick={() => service.setActiveFolder(null)}>
                <CardHeader
                    avatar={(<LogoIcon className={classes.appLogoIcon} />)}
                    title={(<LogoText className={classes.appLogoText} />)}
                    disableTypography
                    classes={{
                        root: clsx(
                            classes.padding,
                            classes.header,
                            service.activeFolderId === null && classes.activeGreetingView,
                        ),
                        avatar: classes.avatar,
                        content: classes.appLogoTextWrapper,
                    }}
                />
            </CardActionArea>
            <Box overflow="auto" py={2}>
                <Folders
                    selectFolder={service.activeFolderId}
                    onClickFolder={({ id }) => service.setActiveFolder(id)}
                />
            </Box>
            <LastClosed className={classes.offsetTop} />
        </Box>
    );
}

export default observer(FoldersPanel);
