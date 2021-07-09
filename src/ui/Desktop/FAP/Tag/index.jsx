import React from 'react';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import FavoriteItem from '@/ui-components/FavoriteItem';
import Explorer from './Explorer';

function Tag(props) {
    const {
        id,
        name,
        color,
        classes: externalClasses,
        children,
        dense,
    } = props;

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            type="tag"
            classes={externalClasses}
            iconOpen={TagIcon}
            iconOpenProps={{ style: { color } }}
            button={(children || dense) && (
                <React.Fragment>
                    {!dense && children}
                    {!children && dense && (
                        <FavoriteItem
                            type="tag"
                            name={name}
                            color={color}
                        />
                    )}
                </React.Fragment>
            )}
        >
            <Explorer id={id} />
        </ButtonWithPopper>
    );
}

export default Tag;
