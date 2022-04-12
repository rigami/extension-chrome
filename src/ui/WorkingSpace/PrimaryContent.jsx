import React, { Fragment, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { alpha, makeStyles, useTheme } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { sample } from 'lodash';
import { useTranslation } from 'react-i18next';
import BookmarksViewer from '@/ui/WorkingSpace/BookmarksViewer';
import { NULL_UUID } from '@/utils/generate/uuid';
import Stub from '@/ui-components/Stub';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import Favorites from '@/ui/WorkingSpace/Favorites';
import { useContextEdit } from '@/stores/app/contextActions';
import FolderBreadcrumbs from '@/ui/WorkingSpace/FolderBreadcrumbs';
import { useNavigationService } from '@/stores/app/navigation';
import { useSearchService } from '@/stores/app/search';
import SearchDashboard from '@/ui/WorkingSpace/SearchDashboard';

const useStyles = makeStyles((theme) => ({
    bookmarks: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
    stub: {
        height: '50vh',
        marginTop: '10vh',
    },
    emoticon: {
        fontSize: '10rem',
        color: alpha(theme.palette.text.secondary, 0.06),
        fontWeight: 700,
    },
    message: {
        fontSize: '1.4rem',
        fontWeight: 600,
        marginTop: theme.spacing(4),
        color: theme.palette.text.primary,
    },
    breadcrumbs: { paddingLeft: theme.spacing(1) },
}));

const emoticons = [
    '(^_^)b',
    '(；⌣̀_⌣́)',
    '(⇀‸↼‶)',
    '(눈_눈)',
    '(ᗒᗣᗕ)՞',
    '(￢_￢;)',
    'ヾ( ￣O￣)ツ',
    '(╥_╥)',
    '( ╥ω╥ )',
    '¯\\_(ツ)_/¯',
    '┐( ˘ ､ ˘ )┌',
    '╮( ˘_˘ )╭',
    '(⊙_⊙)',
];

function PrimaryContent({ columns }) {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const searchService = useSearchService();
    const navigationService = useNavigationService();
    const [emoticon] = useState(() => sample(emoticons));
    const { dispatchEdit } = useContextEdit();

    return (
        <Fragment>
            {navigationService.folderId === NULL_UUID && !searchService.isSearching && (
                <Favorites />
            )}
            {navigationService.folderId !== NULL_UUID && (
                <FolderBreadcrumbs
                    key={navigationService.folderId}
                    className={classes.breadcrumbs}
                    showRoot
                    maxItems={4}
                    folderId={navigationService.folderId}
                    onSelectFolder={(folderId) => {
                        navigationService.setFolder(folderId);
                        searchService.resetChanges();
                    }}
                />
            )}
            {navigationService.folderId !== NULL_UUID && !searchService.isSearching && (
                <BookmarksViewer
                    style={{ width: columns * (theme.shape.dataCard.width + 16) + 16 }}
                    className={classes.bookmarks}
                    folderId={navigationService.folderId}
                    columns={columns}
                    emptyRender={() => (
                        <Stub
                            key="empty"
                            maxWidth={false}
                            message={emoticon}
                            description={t('empty')}
                            classes={{
                                root: classes.stub,
                                title: classes.emoticon,
                                description: classes.message,
                            }}
                        >
                            <Button
                                onClick={(event) => dispatchEdit({
                                    itemType: 'bookmark',
                                    defaultFolderId: navigationService.folderId,
                                }, event)}
                                startIcon={<AddBookmarkIcon />}
                                variant="outlined"
                                color="primary"
                            >
                                {t('button.add', { context: 'first' })}
                            </Button>
                        </Stub>
                    )}
                />
            )}
            {searchService.isSearching && (
                <SearchDashboard
                    style={{ width: columns * (theme.shape.dataCard.width + 16) + 16 }}
                    className={classes.bookmarks}
                    columns={columns}
                />
            )}
        </Fragment>
    );
}

export default observer(PrimaryContent);
