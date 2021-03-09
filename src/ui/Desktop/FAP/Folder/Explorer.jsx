import React, { useState } from 'react';
import { Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Folder from './Folder';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        height: 620,
        maxHeight: 'inherit',
        maxWidth: 'inherit',
    },
}));

function Explorer({ id: rootId }) {
    const classes = useStyles();
    const [path, setPath] = useState([rootId]);

    return (
        <Card className={classes.root} elevation={16}>
            {path.map((id, index) => (
                <Folder
                    key={id}
                    id={id}
                    openFolderId={path[index + 1]}
                    shrink={index < path.length - 2}
                    rootFolder={index === path.length - 1}
                    onOpenFolder={(folderId) => {
                        if (index === path.length - 1) {
                            setPath([...path, folderId]);
                        } else {
                            setPath([...path.slice(0, index + 1), folderId]);
                        }
                    }}
                    onBack={() => {
                        setPath([...path.slice(0, index + 1)]);
                    }}
                />
            ))}
        </Card>
    );
}

export default Explorer;
