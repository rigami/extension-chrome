import React from 'react';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import Explorer from './Explorer';

function Tag(props) {
    const {
        id,
        name,
        color,
        classes: externalClasses,
    } = props;

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            type="tag"
            classes={externalClasses}
            iconOpen={TagIcon}
            iconOpenProps={{ style: { color } }}
        >
            <Explorer id={id} />
        </ButtonWithPopper>
    );
}

export default Tag;
