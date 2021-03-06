import React from 'react';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Bookmarks/FAP/ButtonWithPopper';
import Explorer from './Explorer';

function Folder(props) {
    const {
        id,
        parentId,
        name,
        classes: externalClasses,
    } = props;

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            disableEdit={parentId === 0}
            disableRemove={parentId === 0}
            type="folder"
            iconOpen={FolderIcon}
            classes={externalClasses}
        >
            <Explorer id={id} />
        </ButtonWithPopper>
    );
}

export default Folder;
