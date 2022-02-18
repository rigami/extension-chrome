import React, { useEffect, useState } from 'react';
import { first } from 'lodash';
import { captureException } from '@sentry/react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import asyncAction from '@/utils/helpers/asyncAction';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import EditorBookmark from '@/ui/Bookmarks/Bookmark/Editor';
import Stub from '@/ui-components/Stub';

const useStyles = makeStyles(() => ({
    editor: { padding: 0 },
    editorContent: {
        flexGrow: 1,
        borderRadius: 0,
    },
}));

function SaveCurrentTabEditor() {
    const classes = useStyles();
    const [bookmark, setBookmark] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!chrome?.tabs) {
            setIsLoading(false);
            return;
        }

        asyncAction(async () => {
            const data = {};

            await new Promise((resolve, reject) => chrome.tabs.query({ active: true }, ([tab]) => {
                if (!tab) {
                    reject(new Error('Tab not found'));
                    return;
                }

                data.url = tab.url;
                data.name = tab.title;
                resolve();
            }));

            const res = await BookmarksUniversalService.query(new SearchQuery({ query: data.url }));

            if (res.best && res.best.length !== 0) {
                data.id = first(res.best)?.id;
            }

            setBookmark(data);
            setIsLoading(false);
        }).catch((e) => {
            captureException(e);
            console.error(e);
            setIsLoading(false);
        });
    }, []);

    return (
        <React.Fragment>
            {!isLoading && (
                <EditorBookmark
                    className={clsx(classes.editor)}
                    classes={{ editor: classes.editorContent }}
                    bringToEditorHeight
                    editBookmarkId={bookmark.id}
                    defaultName={bookmark.name}
                    defaultUrl={bookmark.url}
                    marginThreshold={0}
                    onSave={() => {}}
                />
            )}
            {isLoading && (
                <Stub message="Loading..." />
            )}
        </React.Fragment>
    );
}

export default SaveCurrentTabEditor;
