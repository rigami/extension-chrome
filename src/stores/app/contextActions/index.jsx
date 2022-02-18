import React, { createContext, useContext, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import baseContextMenu from '@/stores/app/contextActions/contextMenu';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import SimpleEditor from '@/ui/Bookmarks/Folders/EditModal/EditorSimple';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import Editor from '@/ui/Bookmarks/EditBookmarkModal/Editor';
import TagEditor from '@/ui/Bookmarks/Tag/Editor';
import MoveDialog from '@/ui/Bookmarks/MoveDialog';

const context = createContext();

function ContextActionsProvider({ children }) {
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();

    const contextEdit = useContextPopoverDispatcher((data = {}, position, close) => (
        <Fragment>
            {data.itemType === 'folder' && (
                <SimpleEditor
                    editId={data.itemId}
                    parentId={data.parentId}
                    onSave={(folderId) => close() & data.onSave?.(folderId)}
                    onCancel={close}
                />
            )}
            {data.itemType === 'tag' && (
                <TagEditor
                    editId={data.itemId}
                    onSave={(tagId) => close() & data.onSave?.(tagId)}
                    onCancel={close}
                />
            )}
            {data.itemType === 'bookmark' && (
                <Fragment>
                    <PopoverDialogHeader
                        title={t('bookmark:editor', { context: data.itemId ? 'edit' : 'add' })}
                    />
                    <Editor
                        onSave={(bookmarkId) => close() & data.onSave?.(bookmarkId)}
                        onCancel={close}
                        onErrorLoad={() => {
                            close();
                        }}
                        editBookmarkId={data.itemId}
                        {...data}
                    />
                </Fragment>
            )}
        </Fragment>
    ));
    const contextMove = useContextPopoverDispatcher((data = {}, position, close) => (
        <MoveDialog
            itemType={data.itemType}
            itemId={data.itemId}
            moveId={data.moveId}
            itemParentId={data.itemParentId}
            onMove={(moveId) => close() & data.onMove?.(moveId)}
        />
    ));
    const contextMenu = baseContextMenu({
        workingSpaceService,
        t,
        coreService,
        contextEdit,
        contextMove,
    });
    const Context = context;

    return (
        <Context.Provider value={{ contextMenu }}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(ContextActionsProvider);

function useContextMenuService(config) {
    const { contextMenu } = useContext(context) || {};

    return (event, overridePosition, next) => contextMenu(
        event,
        overridePosition,
        config,
        next,
    );
}

function useContextEditService() {
    const { t } = useTranslation();
    const contextEdit = useContextPopoverDispatcher((data = {}, position, close) => (
        <Fragment>
            {data.itemType === 'folder' && (
                <SimpleEditor
                    editId={data.itemId}
                    parentId={data.parentId}
                    onSave={(folderId) => close() & data.onSave?.(folderId)}
                    onCancel={close}
                />
            )}
            {data.itemType === 'tag' && (
                <TagEditor
                    editId={data.itemId}
                    onSave={(tagId) => close() & data.onSave?.(tagId)}
                    onCancel={close}
                />
            )}
            {data.itemType === 'bookmark' && (
                <Fragment>
                    <PopoverDialogHeader
                        title={t('bookmark:editor', { context: data.itemId ? 'edit' : 'add' })}
                    />
                    <Editor
                        onSave={(bookmarkId) => close() & data.onSave?.(bookmarkId)}
                        onCancel={close}
                        onErrorLoad={() => {
                            close();
                        }}
                        editBookmarkId={data.itemId}
                        {...data}
                    />
                </Fragment>
            )}
        </Fragment>
    ));

    const dispatcher = (config, event, overridePosition, next) => contextEdit.dispatchPopover(
        event,
        overridePosition,
        config,
        next,
    );

    return {
        ...contextEdit,
        dispatchEdit: dispatcher,
    };
}

function useContextMoveService() {
    const contextMove = useContextPopoverDispatcher((data = {}, position, close) => (
        <MoveDialog
            itemType={data.itemType}
            itemId={data.itemId}
            moveId={data.moveId}
            itemParentId={data.itemParentId}
            onMove={(moveId) => close() & data.onMove?.(moveId)}
        />
    ));

    const dispatcher = (config, event, overridePosition, next) => contextMove.dispatchPopover(
        event,
        overridePosition,
        config,
        next,
    );

    return {
        ...contextMove,
        dispatchMove: dispatcher,
    };
}

export {
    observerProvider as ContextActionsProvider,
    useContextMenuService as useContextActions,
    useContextEditService as useContextEdit,
    useContextMoveService as useContextMove,
};
