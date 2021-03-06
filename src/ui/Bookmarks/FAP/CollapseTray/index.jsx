import React from 'react';
import { ExpandLessRounded as MoreIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Bookmarks/FAP/ButtonWithPopper';
import Explorer from './Explorer';

function CollapseTray(props) {
    const { offsetLoad, classes: externalClasses } = props;

    return (
        <ButtonWithPopper
            classes={externalClasses}
            iconOpen={MoreIcon}
            popperProps={{ placement: 'top-end' }}
        >
            <Explorer offsetLoad={offsetLoad} />
        </ButtonWithPopper>
    );
}

export default CollapseTray;
