import React from 'react';
import { AppBar, Toolbar, Box } from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { SelfImprovementRounded as DesktopIcon } from '@/icons';
import { ACTIVITY } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import SearchBlock from './Search';
import ShowFavorites from './ShowFavorites';
import CloudSync from '@/ui/Bookmarks/ToolsPanel/CloudSync';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: alpha(theme.palette.background.paper, 0.91),
        backdropFilter: `blur(${theme.spacing(2)}px)`,
    },
    toolbar: {
        minHeight: 36,
        display: 'flex',
        padding: theme.spacing(2),
        alignItems: 'flex-start',
        boxSizing: 'content-box',
    },
    wrapperBreadcrumbs: {
        overflow: 'auto',
        marginRight: 'auto',
    },
    wrapperSearch: {
        padding: theme.spacing(0, 1),
        display: 'flex',
        flexGrow: 1,
        flexShrink: 0,
        justifyContent: 'center',
        maxWidth: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2),
        width: '100%',
        marginTop: 0,
        boxSizing: 'content-box',
    },
    wrapperTools: {
        flexShrink: 0,
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: theme.spacing(1),
    },
    widthHelper: {
        flexShrink: 1,
        display: 'flex',
        flexGrow: 1,
    },
    toolStub: {
        visibility: 'hidden',
        width: 36,
    },
    fixVisualMargin: { marginRight: theme.spacing(1) },
}));

function ToolsPanel() {
    const classes = useStyles();
    const { t } = useTranslation(['desktop']);
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const searchService = useSearchService();

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar disableGutters className={classes.toolbar}>
                <Box className={classes.wrapperBreadcrumbs}>
                    <FolderBreadcrumbs
                        key={searchService.selectFolderId}
                        folderId={searchService.selectFolderId}
                        onSelectFolder={(folderId) => searchService.setSelectFolder(folderId)}
                    />
                </Box>
                <CloudSync />
                <Box className={classes.wrapperSearch}>
                    <SearchBlock />
                </Box>
                <Box className={classes.wrapperTools}>
                    {bookmarksService.favorites.length > 0 && (
                        <ShowFavorites className={classes.fixVisualMargin} />
                    )}
                    <ExtendButtonGroup>
                        <ExtendButton
                            tooltip={t('desktop:button.open')}
                            data-ui-path="desktop.open"
                            onClick={() => appService.setActivity(ACTIVITY.DESKTOP)}
                            icon={DesktopIcon}
                        />
                    </ExtendButtonGroup>
                    <ExtendButtonGroup className={classes.toolStub} />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
