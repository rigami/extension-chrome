import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { Box } from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    tagsContainer: {
        display: 'flex',
        overflow: 'hidden',
    },
    tagsWrapper: {
        overflow: 'auto',
        position: 'relative',
        paddingRight: theme.shape.borderRadiusButton,
    },
    tag: {
        color: theme.palette.text.primary,
        padding: theme.spacing(0.25, 0.75),
        marginRight: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusButton,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: theme.typography.fontFamily,
        whiteSpace: 'nowrap',
        lineHeight: '14px',
    },
    overloadTagsChip: {
        backgroundColor: theme.palette.background.backdrop,
        position: 'absolute',
        right: 0,
        top: 0,
        marginRight: 0,
        boxShadow: '0px 1px 6px 6px #fff',
    },
}));

function Collapser({ className: externalClassName, children }) {
    const classes = useStyles();
    const ref = useRef();
    const [isOverload, setIsOverload] = useState(false);
    const [notVisible, setNotVisible] = useState(0);

    const onResize = useCallback(() => {
        let i = 0;
        let sumWidth = 0;

        while (
            i < ref.current.children.length
            && sumWidth + ref.current.children[i].clientWidth + 4 <= ref.current.clientWidth
        ) {
            sumWidth += ref.current.children[i].clientWidth + 4;
            i += 1;
        }

        setIsOverload(ref.current.scrollWidth > ref.current.clientWidth);
        setNotVisible(ref.current.children.length - i);
    }, []);

    useResizeDetector({
        onResize,
        targetRef: ref,
    });

    useEffect(() => { onResize(); }, [children.length]);

    return (
        <Box className={clsx(classes.tagsWrapper, externalClassName)}>
            <Box ref={ref} className={classes.tagsContainer}>
                {children}
            </Box>
            {isOverload && (
                <Box className={clsx(classes.tag, classes.overloadTagsChip)}>
                    +
                    {notVisible}
                </Box>
            )}
        </Box>
    );
}

export default Collapser;
