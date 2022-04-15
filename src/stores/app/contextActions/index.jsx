import React, { createContext, useContext, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import baseContextMenu from '@/stores/app/contextActions/contextMenu';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import FolderEditor from '@/ui/WorkingSpace/Folders/Editor';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import BookmarkEditor from '@/ui/WorkingSpace/Bookmark/Editor';
import TagEditor from '@/ui/WorkingSpace/Tag/Editor';
import MoveDialog from '@/ui/WorkingSpace/MoveDialog';
import DeleteDialog from '@/ui/WorkingSpace/DeleteDialog';

const useStyles = makeStyles(() => ({ editor: { maxHeight: 500 } }));

const context = createContext();

function EditorComposer({ data = {}, close }) {
    const classes = useStyles();
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
                        className={classes.editor}
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

function DeleteComposer({ data = {}, close }) {
    return (
        <DeleteDialog
            itemType={data.itemType}
            itemId={data.itemId}
            onDelete={() => close() & data.onDelete?.()}
            onCancel={close}
        />
    );
}

function ContextActionsProvider({ children }) {
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();

    const contextEdit = useContextPopoverDispatcher((data = {}, position, close) => (
        <EditorComposer data={data} position={position} close={close} />
    ));
    const contextMove = useContextPopoverDispatcher((data = {}, position, close) => (
        <MoveComposer data={data} position={position} close={close} />
    ));
    const contextDelete = useContextPopoverDispatcher((data = {}, position, close) => (
        <DeleteComposer data={data} position={position} close={close} />
    ));
    const contextMenu = baseContextMenu({
        workingSpaceService,
        t,
        contextEdit,
        contextMove,
        contextDelete,
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

function useContextDeleteService() {
    const contextDelete = useContextPopoverDispatcher((data = {}, position, close) => (
        <DeleteComposer data={data} position={position} close={close} />
    ));

    const dispatcher = (config, event, overridePosition, next) => contextDelete.dispatchPopover(
        event,
        overridePosition,
        config,
        next,
    );

    return {
        ...contextDelete,
        dispatchDelete: dispatcher,
    };
}

export {
    observerProvider as ContextActionsProvider,
    useContextMenuService as useContextActions,
    useContextEditService as useContextEdit,
    useContextMoveService as useContextMove,
    useContextDeleteService as useContextDelete,
};
