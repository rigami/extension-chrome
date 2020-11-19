import React, { useState, createRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Chip, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import ResizeDetector from 'react-resize-detector';
import {
    KeyboardArrowDownRounded as ArrowDownIcon,
    KeyboardArrowUpRounded as ArrowUpIcon,
} from '@material-ui/icons';

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
}));

function ExpandButton({ tooltip, icon, onClick }) {
    const classes = useStyles();

    const Icon = icon;

    return (
        <Tooltip title={tooltip}>
            <Chip
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
}

function CollapseWrapper(props) {
    const {
        list = [],
        renderComponent = () => {},
        classes: externalClasses = {},
        expandButtonLabel = 'Показать все',
        collapseButtonLabel = 'Свернуть',
        actions,
    } = props;
    const classes = useStyles();
    const [isCollapse, setIsCollapse] = useState(true);
    const [isUseExpand, setIsUseExpand] = useState(false);
    const [expandLabel, setExpandLabel] = useState('Показать все');
    const [collapseLabel, setCollapseLabel] = useState('Свернуть');
    const rootRef = createRef();
    const tagsRef = createRef();

    const calcExpandLabel = (visibleCount) => {
        if (typeof expandButtonLabel === 'function') {
            return expandButtonLabel(visibleCount, list.length);
        }
        return expandButtonLabel;
    };

    const calcCollapseLabel = (visibleCount) => {
        if (typeof collapseButtonLabel === 'function') {
            return collapseButtonLabel(visibleCount, list.length);
        }
        return collapseButtonLabel;
    };

    const handleResize = () => {
        if (isCollapse) setIsUseExpand(tagsRef.current.scrollWidth > tagsRef.current.clientWidth);

        if (!tagsRef.current) return;

        const invisibleIndex = Array.prototype.findIndex.call(
            tagsRef.current.children,
            (tagEl) => tagEl.offsetLeft + (tagEl.clientWidth * 0.6) > tagsRef.current.clientWidth,
        );
        const visibleCount = list.length - (invisibleIndex >= 0 ? invisibleIndex : list.length);

        setExpandLabel(calcExpandLabel(visibleCount));
        setCollapseLabel(calcCollapseLabel(visibleCount));
    };

    useEffect(handleResize, [isCollapse, list.length]);

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
                    !isCollapse && classes.wrap,
                    isUseExpand && classes.gradient,
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
                {!isCollapse && (
                    <ExpandButton
                        tooltip="Показать меньше"
                        icon={ArrowUpIcon}
                        onClick={() => setIsCollapse(true)}
                    />
                )}
                {!isCollapse && actions}
            </Box>
            {isCollapse && isUseExpand && (
                <ExpandButton
                    tooltip="Показать больше"
                    icon={ArrowDownIcon}
                    onClick={() => setIsCollapse(false)}
                />
            )}
            {isCollapse && actions}
            <ResizeDetector handleWidth onResize={handleResize} />
        </Box>
    );
}

export default observer(CollapseWrapper);
