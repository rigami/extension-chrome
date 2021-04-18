import React, {
    createRef,
    useEffect,
    useRef,
    forwardRef,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    Box,
    Chip,
    Tooltip,
    Card,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import ResizeDetector from 'react-resize-detector';
import {
    KeyboardArrowDownRounded as ArrowDownIcon,
    KeyboardArrowUpRounded as ArrowUpIcon,
} from '@material-ui/icons';
import PopperWrapper from '@/ui-components/PopperWrapper';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
    },
    list: {
        flexWrap: 'nowrap',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: theme.spacing(-1),
        '& $expandButton': { marginBottom: theme.spacing(1) },
    },
    gradient: { '-webkit-mask-image': 'linear-gradient(to left, rgba(0,0,0,0) 0, rgba(0,0,0,1) 16px)' },
    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: `calc(100% - ${theme.spacing(1)}px)`,
    },
    emptyProperty: {
        fontStyle: 'italic',
        color: '#bdbdbd !important',
        fontFamily: theme.typography.fontFamilySecondary,
    },
    expandButton: {
        flexShrink: 0,
        marginBottom: theme.spacing(0),
    },
    wrap: { flexWrap: 'wrap' },
    expandIcon: {
        marginLeft: '3px !important',
        marginRight: 3,
    },
    expandTitle: { display: 'none' },
    popperCard: {
        width: 600,
        padding: theme.spacing(1),
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
}));

const ExpandButton = forwardRef(({ tooltip, icon, onClick }, ref) => {
    const classes = useStyles();

    const Icon = icon;

    return (
        <Tooltip title={tooltip}>
            <Chip
                ref={ref}
                icon={<Icon />}
                classes={{
                    root: clsx(classes.tag, classes.expandButton),
                    icon: classes.expandIcon,
                    label: classes.expandTitle,
                }}
                variant="outlined"
                onClick={onClick}
            />
        </Tooltip>
    );
});

function CollapseWrapper(props) {
    const {
        list = [],
        renderComponent = () => {},
        classes: externalClasses = {},
        actions,
        usePopper = false,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const anchorEl = useRef();
    const rootRef = createRef();
    const tagsRef = createRef();
    const store = useLocalObservable(() => ({
        isCollapse: true,
        isUseExpand: false,
        isPopperOpen: false,
        isBlockEvent: false,
    }));

    const handleResize = () => {
        if (store.isCollapse) store.isUseExpand = tagsRef.current.scrollWidth > tagsRef.current.clientWidth;
    };

    useEffect(handleResize, [store.isCollapse, list.length]);

    const RenderComponent = renderComponent;

    return (
        <Box
            ref={rootRef}
            className={clsx(
                classes.root,
                list.length === 0 && classes.emptyProperty,
            )}
        >
            <Box
                className={clsx(
                    classes.list,
                    !store.isCollapse && classes.wrap,
                    store.isUseExpand && classes.gradient,
                )}
                ref={tagsRef}
            >
                {list.length !== 0 && list.map((component) => (
                    <RenderComponent
                        key={component.id}
                        className={clsx(classes.tag, externalClasses.chip)}
                        {...component}
                    />
                ))}
                {!store.isCollapse && (
                    <ExpandButton
                        tooltip={t('button.more')}
                        icon={ArrowUpIcon}
                        onClick={() => { store.isCollapse = true; }}
                    />
                )}
                {!store.isCollapse && actions}
            </Box>
            {store.isCollapse && store.isUseExpand && (
                <ExpandButton
                    ref={anchorEl}
                    tooltip={store.isPopperOpen ? t('button.less') : t('button.more')}
                    icon={store.isPopperOpen ? ArrowUpIcon : ArrowDownIcon}
                    onMouseDown={() => {
                        if (!store.isPopperOpen) store.isBlockEvent = true;
                    }}
                    onClick={() => {
                        if (usePopper) {
                            store.isPopperOpen = !store.isPopperOpen;
                        } else {
                            store.isCollapse = false;
                        }
                        store.isBlockEvent = false;
                    }}
                />
            )}
            {store.isCollapse && actions}
            {usePopper && (
                <PopperWrapper
                    isOpen={store.isPopperOpen}
                    anchorEl={anchorEl.current}
                    onClose={() => {
                        if (store.isBlockEvent) return;

                        store.isPopperOpen = false;
                    }}
                    placement="bottom"
                    modifiers={{
                        offset: {
                            enabled: true,
                            offset: '0px, 16px',
                        },
                    }}
                >
                    <Card className={classes.popperCard} elevation={18}>
                        {list.length !== 0 && list.map((component) => (
                            <RenderComponent
                                key={component.id}
                                className={clsx(classes.tag, externalClasses.chip)}
                                {...component}
                            />
                        ))}
                    </Card>
                </PopperWrapper>
            )}
            <ResizeDetector handleWidth onResize={handleResize} />
        </Box>
    );
}

export default observer(CollapseWrapper);
