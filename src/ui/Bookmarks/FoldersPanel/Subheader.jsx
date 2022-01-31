import React, { forwardRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Item } from '@/ui/Bookmarks/FoldersPanel/Item';

const useStyles = makeStyles((theme) => ({
    subheader: {
        padding: theme.spacing(0.5, 2),
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 700,
        letterSpacing: '0.14em',
    },
}));

function Subheader({ className: externalClassName, ...props }, ref) {
    const classes = useStyles();

    return (
        <Item
            className={clsx(classes.subheader, externalClassName)}
            level={null}
            ref={ref}
            {...props}
        />
    );
}

export default forwardRef(Subheader);
