import React from 'react';
import { Collapse } from '@material-ui/core';
import FolderItem from './FolderItem';

function TreeItem(props) {
    const {
        folder,
        expanded = [],
        disabled = [],
        level,
        actions,
        isDisabled,
        isExpanded,
        selectedId,
        onClick,
        onCreateSubFolder,
        onChangeExpanded,
    } = props;
    const childExist = Array.isArray(folder.children) && folder.children.length > 0;

    return (
        <React.Fragment>
            <FolderItem
                id={folder.id}
                name={folder.name}
                childExist={childExist}
                isDisabled={isDisabled}
                isExpand={isExpanded}
                isSelected={selectedId === folder.id}
                level={level}
                actions={actions}
                onClick={() => onClick(folder)}
                onExpandChange={() => onChangeExpanded(folder.id)}
                onCreateSubFolder={onCreateSubFolder}
            />
            {childExist && (
                <Collapse in={isExpanded}>
                    <TreeFolders
                        data={folder.children}
                        expanded={expanded}
                        disabled={disabled}
                        level={level + 1}
                        actions={actions}
                        selectedId={selectedId}
                        onClickFolder={onClick}
                        onCreateSubFolder={onCreateSubFolder}
                        onChangeExpanded={onChangeExpanded}
                    />
                </Collapse>
            )}
        </React.Fragment>
    );
}

function TreeFolders(props) {
    const {
        data,
        expanded = [],
        disabled = [],
        actions,
        level,
        selectedId,
        onClickFolder,
        onCreateSubFolder,
        onChangeExpanded,
    } = props;

    return data.map((folder) => (
        <TreeItem
            key={folder.id}
            expanded={expanded}
            disabled={disabled}
            folder={folder}
            level={level}
            isDisabled={disabled.includes(folder.id)}
            isExpanded={expanded.includes(folder.id)}
            selectedId={selectedId}
            actions={actions}
            onClick={(selectFolder) => onClickFolder(selectFolder)}
            onChangeExpanded={onChangeExpanded}
            onCreateSubFolder={onCreateSubFolder}
        />
    ));
}

export default TreeFolders;
