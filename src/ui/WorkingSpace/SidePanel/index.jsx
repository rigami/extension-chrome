import React from 'react';
import { Box, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';
import Subheader from '@/ui/WorkingSpace/SidePanel/Subheader';
import LastClosed from './RecentlyClosed';
import Folders from '../Folders';
import { NULL_UUID } from '@/utils/generate/uuid';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        paddingTop: theme.spacing(1.75),
    },
    '@media (max-width: 1700px)': { root: { width: 220 } },
    '@media (max-width: 1024px)': { root: { width: 160 } },
    avatar: {
        display: 'flex',
        marginRight: theme.spacing(1),
    },
    header: {
        height: 40,
        padding: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
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
    offsetTop: {
        marginTop: 'auto',
        padding: theme.spacing(1),
        paddingRight: 0,
    },
    folders: { marginLeft: theme.spacing(1) },
    greetingViewBtn: {
        marginLeft: theme.spacing(1),
        width: `calc(100% - ${theme.spacing(1)}px)`,
        borderRadius: theme.shape.borderRadiusButton,
    },
}));

function SidePanel() {
    const { t } = useTranslation(['folder']);
    const searchService = useSearchService();
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <CardActionArea
                className={classes.greetingViewBtn}
                onClick={() => searchService.setSelectFolder(NULL_UUID)}
            >
                <CardHeader
                    avatar={(<LogoIcon className={classes.appLogoIcon} />)}
                    title={(<LogoText className={classes.appLogoText} />)}
                    disableTypography
                    classes={{
                        root: clsx(
                            classes.header,
                            // service.selectFolderId === null && classes.activeGreetingView,
                        ),
                        avatar: classes.avatar,
                        content: classes.appLogoTextWrapper,
                    }}
                />
            </CardActionArea>
            <Box overflow="auto" py={2}>
                <Subheader
                    title={t('listTitle')}
                    disableButton
                />
                <Folders
                    className={classes.folders}
                    selectFolder={searchService.selectFolderId}
                    onClickFolder={({ id }) => searchService.setSelectFolder(id)}
                />
            </Box>
            <LastClosed className={classes.offsetTop} />
        </Box>
    );
}

export default observer(SidePanel);
