import React, {
    createContext,
    useContext,
    Fragment,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import baseContextMenu from '@/stores/app/contextActions/contextMenu';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import SimpleEditor from '@/ui/Bookmarks/Folders/EditModal/EditorSimple';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import Editor from '@/ui/Bookmarks/EditBookmarkModal/Editor';
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
                    onCancel={close}
                />
            )}
            {data.itemType === 'bookmark' && (
                <Fragment>
                    <PopoverDialogHeader
                        title={t('bookmark:editor', { context: data.itemId ? 'edit' : 'add' })}
                    />
                    <Editor
                        onSave={close}
                        onCancel={close}
                        onErrorLoad={() => {
                            close();
                        }}
                        editBookmarkId={data.itemId}
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
        <Context.Provider value={{
            contextMove,
            contextEdit,
            contextMenu,
        }}
        >
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
    const { contextEdit } = useContext(context) || {};

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
    const { contextMove } = useContext(context) || {};

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
