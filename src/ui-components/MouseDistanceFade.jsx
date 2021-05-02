import React, { useEffect, useRef } from 'react';
import { useLocalObservable, Observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { useForkRef } from '@material-ui/core/utils';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { max, values } from 'lodash';

const useStyles = makeStyles((theme) => ({
    smooth: {
        transition: theme.transitions.create(['opacity'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.complex,
        }),
    },
}));

const itemsByUnionKey = {};
const hoverItemsByUnionKey = {};

function MouseDistanceFade(props) {
    const {
        unionKey,
        show = undefined,
        children,
        distanceMax = 750,
        distanceMin = 300,
    } = props;
    const classes = useStyles();
    const rootAl = useRef();
    const store = useLocalObservable(() => ({
        preHideTimer: null,
        hideTimer: null,
        smooth: false,
        id: `item-${Math.random().toString().substring(2)}`,
        distanceMax,
        distanceMin,
        show,
        lastPageY: null,
        lastPageX: null,
        isHover: false,
        unionKey: unionKey || `item-${Math.random().toString().substring(2)}`,
    }));

    const handleRef = useForkRef(children.ref, rootAl);

    const calcOpacity = () => {
        if (!rootAl.current) return;

        store.smooth = false;
        clearTimeout(store.preHideTimer);
        clearTimeout(store.hideTimer);

        if (typeof store.show !== 'undefined') {
            itemsByUnionKey[store.unionKey][store.id] = store.show ? 1 : 0;
            if (rootAl.current) rootAl.current.style.opacity = itemsByUnionKey[store.unionKey][store.id];

            return;
        }

        const { x, y, height, width } = rootAl.current.getBoundingClientRect();

        let xMultiplicator = 1;
        let yMultiplicator = 1;

        if (store.lastPageX < x) {
            xMultiplicator = Math.abs(x - store.lastPageX);
        } else if (store.lastPageX > x + width) {
            xMultiplicator = Math.abs(x + width - store.lastPageX);
        }

        if (store.lastPageY < y) {
            yMultiplicator = Math.abs(y - store.lastPageY);
        } else if (store.lastPageY > y + height) {
            yMultiplicator = Math.abs(y + height - store.lastPageY);
        }

        let dist = 0.96 * Math.max(xMultiplicator, yMultiplicator) + 0.4 * Math.min(xMultiplicator, yMultiplicator);

        if (dist > store.distanceMax) {
            dist = store.distanceMax;
        } else if (dist < store.distanceMin) {
            dist = store.distanceMin;
        }

        dist -= store.distanceMin;

        itemsByUnionKey[store.unionKey][store.id] = 1 - dist / (store.distanceMax - store.distanceMin);

        if (rootAl.current) rootAl.current.style.opacity = max(values(itemsByUnionKey[store.unionKey]));

        store.preHideTimer = setTimeout(action(() => {
            const path = document.elementsFromPoint(store.lastPageX, store.lastPageY);

            hoverItemsByUnionKey[store.unionKey][store.id] = path.includes(rootAl.current);
        }), 2950);
        store.hideTimer = setTimeout(action(() => {
            if (values(hoverItemsByUnionKey[store.unionKey]).includes(true)) return;

            store.smooth = true;
            if (rootAl.current) rootAl.current.style.opacity = 0;
        }), 3000);
    };

    const moveMouseHandler = action((e) => {
        store.lastPageY = e.pageY;
        store.lastPageX = e.pageX;
        calcOpacity();
    });

    useEffect(() => {
        itemsByUnionKey[store.unionKey] = {
            ...(itemsByUnionKey[store.unionKey] || {}),
            [store.id]: 0,
        };
        hoverItemsByUnionKey[store.unionKey] = {
            ...(hoverItemsByUnionKey[store.unionKey] || {}),
            [store.id]: false,
        };
        if (rootAl.current) rootAl.current.style.opacity = 0;
        window.addEventListener('mousemove', moveMouseHandler);

        return () => {
            window.removeEventListener('mousemove', moveMouseHandler);

            delete itemsByUnionKey[store.unionKey][store.id];
        };
    }, []);

    useEffect(() => {
        store.distanceMax = distanceMax;
        store.distanceMin = distanceMin;
        store.show = show;
        calcOpacity();
    }, [distanceMax, distanceMin, show]);

    return (
        <Observer>
            {() => React.cloneElement(children, {
                ref: handleRef,
                className: clsx(children.props.className, store.smooth && classes.smooth),
            })}
        </Observer>
    );
}

export default MouseDistanceFade;
