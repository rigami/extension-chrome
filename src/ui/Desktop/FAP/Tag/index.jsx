import React from 'react';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import { alpha, makeStyles } from '@material-ui/core/styles';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import FavoriteItem from '@/ui-components/FavoriteItem';
import Explorer from './Explorer';
import getUniqueColor from '@/utils/generate/uniqueColor';

const useStyles = makeStyles(() => ({
    dense: {
        background: 'none',
        border: 'none',
    },
}));

function Tag(props) {
    const {
        id,
        name,
        colorKey,
        classes: externalClasses,
        className: externalClassName,
        children,
        dense,
    } = props;
    const classes = useStyles();

    const color = getUniqueColor(colorKey) || '#000';

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            type="tag"
            classes={externalClasses}
            className={externalClassName}
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
                            className={classes.dense}
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
