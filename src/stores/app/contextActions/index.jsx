import React, { createContext, useContext, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import baseContextMenu from '@/stores/app/contextActions/contextMenu';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import FolderEditor from '@/ui/WorkingSpace/Folders/Editor';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import BookmarkEditor from '@/ui/WorkingSpace/Bookmark/Editor';
import TagEditor from '@/ui/WorkingSpace/Tag/Editor';
import MoveDialog from '@/ui/WorkingSpace/MoveDialog';

const context = createContext();

function EditorComposer({ data = {}, close }) {
    const { t } = useTranslation();

    return (
        <Fragment>
            {data.itemType === 'folder' && (
                <FolderEditor
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
                    <BookmarkEditor
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
    );
}

function MoveComposer({ data = {}, close }) {
    return (
        <MoveDialog
            itemType={data.itemType}
            itemId={data.itemId}
            moveId={data.moveId}
            itemParentId={data.itemParentId}
            onMove={(moveId) => close() & data.onMove?.(moveId)}
        />
    );
}

function ContextActionsProvider({ children }) {
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();

    const contextEdit = useContextPopoverDispatcher((data = {}, position, close) => (
        <EditorComposer data={data} position={position} close={close} />
    ));
    const contextMove = useContextPopoverDispatcher((data = {}, position, close) => (
        <MoveComposer data={data} position={position} close={close} />
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
    const contextEdit = useContextPopoverDispatcher((data = {}, position, close) => (
        <EditorComposer data={data} position={position} close={close} />
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
        <MoveComposer data={data} position={position} close={close} />
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
