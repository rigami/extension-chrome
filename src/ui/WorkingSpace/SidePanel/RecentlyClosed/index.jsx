import React, { useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    Box,
    CardActions,
    Button,
    Tooltip,
} from '@material-ui/core';
import {
    UnfoldLess as LessIcon,
    UnfoldMore as MoreIcon,
    ArrowForward as OpenIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { ItemAction } from '@/ui/WorkingSpace/SidePanel/Item';
import Subheader from '@/ui/WorkingSpace/SidePanel/Subheader';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import { useCoreService } from '@/stores/app/core';
import ListRecentlyClosed from './List';

const useStyles = makeStyles((theme) => ({
    subheader: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(0.5),
        '&:hover $action': { display: 'flex' },
    },
    action: {
        display: 'none',
        marginLeft: theme.spacing(0.5),
    },
    dialog: {
        minWidth: 320,
        maxWidth: 400,
        width: 400,
        minHeight: 400,
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
    actions: { padding: theme.spacing(0, 1) },
}));

function RecentlyClosed({ className: externalClassName }) {
    const { t } = useTranslation(['session']);
    const classes = useStyles();
    const coreService = useCoreService();
    const subheaderRef = useRef();
    const store = useLocalObservable(() => ({
        expand: typeof coreService.storage.data.expandRecentlyClosed === 'undefined'
            ? false
            : coreService.storage.data.expandRecentlyClosed,
        openPopover: false,
        anchorEl: null,
    }));

    return (
        <Box className={externalClassName}>
            <Subheader
                ref={subheaderRef}
                title={t('recentlyClosed.title')}
                className={classes.subheader}
                disableButton={store.expand}
                selected={store.openPopover && !store.expand}
                onClick={(event) => {
                    if (!store.expand) {
                        store.anchorEl = event.currentTarget;
                        store.openPopover = !store.openPopover;
                    }
                }}
                actions={(
                    <React.Fragment>
                        <Tooltip title={store.expand ? t('recentlyClosed.collapse') : t('recentlyClosed.expand')}>
                            <ItemAction
                                className={classes.action}
                                onClick={() => {
                                    store.expand = !store.expand;
                                    coreService.storage.update({ expandRecentlyClosed: store.expand });
                                }}
                            >
                                {open ? <LessIcon /> : <MoreIcon />}
                            </ItemAction>
                        </Tooltip>
                    </React.Fragment>
                )}
            />
            {store.expand && (
                <ListRecentlyClosed
                    max={6}
                    disablePadding
                    overloadContent={(
                        <CardActions className={classes.actions}>
                            <Button
                                color="primary"
                                endIcon={(<OpenIcon />)}
                                onClick={(event) => {
                                    store.anchorEl = event.currentTarget;
                                    store.openPopover = true;
                                }}
                            >
                                {t('common:button.more')}
                            </Button>
                        </CardActions>
                    )}
                />
            )}
            <PopperDialog
                open={store.openPopover}
                onClose={() => { store.openPopover = false; }}
                anchorEl={store.anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{ className: classes.dialog }}
            >
                <PopoverDialogHeader title={t('recentlyClosed.title')} />
                <ListRecentlyClosed offset={store.expand ? 6 : 0} max={25} />
            </PopperDialog>
        </Box>
    );
}

export default memo(observer(RecentlyClosed));
