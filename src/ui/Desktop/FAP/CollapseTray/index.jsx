import React, { useState } from 'react';
import { ExpandLessRounded as MoreIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import { useTranslation } from 'react-i18next';
import { Card, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderExplorer from '@/ui/Desktop/FAP/Folder/Explorer';
import TagExplorer from '@/ui/Desktop/FAP/Tag/Explorer';
import Root from './Root';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        height: 620,
        maxHeight: 'inherit',
        maxWidth: 'inherit',
    },
}));

function CollapseTray(props) {
    const classes = useStyles();
    const { offsetLoad, classes: externalClasses } = props;
    const { t } = useTranslation();
    const [openItem, setOpenItem] = useState(null);

    return (
        <ButtonWithPopper
            classes={externalClasses}
            iconOpen={MoreIcon}
            name={t('button.more')}
            onClosed={() => setOpenItem(null)}
        >
            <Card className={classes.root} elevation={16}>
                <Root
                    offsetLoad={offsetLoad}
                    openItem={openItem}
                    onOpenItem={(item) => setOpenItem(item)}
                />
                {openItem && (
                    <Divider variant="fullWidth" orientation="vertical" flexItem />
                )}
                {openItem?.itemType === 'folder' && (
                    <FolderExplorer id={openItem?.itemId} />
                )}
                {openItem?.itemType === 'tag' && (
                    <TagExplorer id={openItem?.itemId} />
                )}
            </Card>
        </ButtonWithPopper>
    );
}

export default CollapseTray;
