import React from 'react';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import { useTheme, fade } from '@material-ui/core/styles';
import Explorer from './Explorer';

function Folder(props) {
    const {
        id,
        parentId,
        name,
        classes: externalClasses,
    } = props;
    const theme = useTheme();

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            disableEdit={parentId === 0}
            disableRemove={parentId === 0}
            type="folder"
            iconOpen={FolderIcon}
            classes={externalClasses}
            iconOpenProps={{ style: { color: fade(theme.palette.text.secondary, 0.23) } }}
        >
            <Explorer id={id} />
        </ButtonWithPopper>
    );
}

export default Folder;
