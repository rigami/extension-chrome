import React, { useEffect, useState } from 'react';
import { Divider } from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Folder from './Folder';

const useStyles = makeStyles((theme) => ({ hide: { width: 0 } }));

function Explorer({ id: rootId }) {
    const classes = useStyles();
    const [path, setPath] = useState([rootId]);

    useEffect(() => setPath([rootId]), [rootId]);

    return (
        <React.Fragment>
            {path.map((id, index) => (
                <React.Fragment key={id}>
                    <Folder
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
                        className={clsx(path.length > 5 && index !== 0 && index < path.length - 2 && classes.hide)}
                    />
                    {index !== path.length - 1 && (
                        <Divider variant="fullWidth" orientation="vertical" flexItem />
                    )}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}

export default Explorer;
