import React from 'react';
import { TabRounded as WindowSessionIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { Item } from '@/ui/WorkingSpace/SidePanel/Item';

const useStyles = makeStyles((theme) => ({
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    itemOffset: { paddingLeft: theme.spacing(2) },
}));

function SessionRecord({ sessionId, size, selected, onClick }) {
    const classes = useStyles();
    const { t } = useTranslation(['session']);

    return (
        <Item
            key={sessionId}
            button
            selected={selected}
            onClick={onClick}
            icon={(<WindowSessionIcon className={classes.favicon} />)}
            title={t(
                'recentlyClosed.windowSessionTitle',
                { count: size },
            )}
            level={null}
            className={classes.itemOffset}
        />
    );
}

export default SessionRecord;
