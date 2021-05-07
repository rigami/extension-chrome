import React, { forwardRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Item } from '@/ui/Bookmarks/FoldersPanel/Item';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    subheader: {
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        letterSpacing: '0.14em',
    },
}));

function Subheader({ className: externalClassName, ...props }, ref) {
    const classes = useStyles();

    return (
        <Item
            className={clsx(classes.subheader, externalClassName)}
            ref={ref}
            {...props}
        />
    );
}

export default forwardRef(Subheader);
