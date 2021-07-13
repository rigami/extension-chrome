import React from 'react';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import FavoriteItem from '@/ui-components/FavoriteItem';
import { makeStyles } from '@material-ui/core/styles';
import Explorer from './Explorer';

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
        color,
        classes: externalClasses,
        className: externalClassName,
        children,
        dense,
    } = props;
    const classes = useStyles();

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
