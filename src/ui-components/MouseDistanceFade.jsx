import React, { useEffect, useRef } from 'react';
import { useLocalObservable, Observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { useForkRef } from '@material-ui/core/utils';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    smooth: {
        transition: theme.transitions.create(['opacity'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.complex,
        }),
    },
}));

const items = {};

function MouseDistanceFade(props) {
    const {
        children,
        distanceMax = 750,
        distanceMin = 300,
    } = props;
    const classes = useStyles();
    const rootAl = useRef();
    const store = useLocalObservable(() => ({
        hideTimer: null,
        smooth: false,
        id: `item-${Math.random().toString().substring(2)}`,
    }));

    const handleRef = useForkRef(children.ref, rootAl);

    const moveMouseHandler = action((e) => {
        if (!rootAl.current) return;

        store.smooth = false;
        clearTimeout(store.hideTimer);

        const { x, y, height, width } = rootAl.current.getBoundingClientRect();

        const a = (e.pageX < x) ? Math.abs(x - e.pageX) : (e.pageX > x + width) ? Math.abs(x + width - e.pageX) : 1;
        const b = (e.pageY < y) ? Math.abs(y - e.pageY) : (e.pageY > y + height) ? Math.abs(y + height - e.pageY) : 1;
        let dist = 0.96 * Math.max(a, b) + 0.4 * Math.min(a, b);

        if (dist > distanceMax) {
            dist = distanceMax;
        } else if (dist < distanceMin) {
            dist = distanceMin;
        }

        dist -= distanceMin;

        items[store.id] = 1 - dist / (distanceMax - distanceMin);

        const calcOpacity = items[store.id]; // max(values(items));

        if (rootAl.current) rootAl.current.style.opacity = calcOpacity;

        store.hideTimer = setTimeout(action(() => {
            if (e.path.indexOf(rootAl.current) !== -1) return;

            store.smooth = true;
            if (rootAl.current) rootAl.current.style.opacity = 0;
        }), 3000);
    });

    useEffect(() => {
        items[store.id] = 0;
        if (rootAl.current) rootAl.current.style.opacity = 0;
        window.addEventListener('mousemove', moveMouseHandler);

        return () => {
            window.removeEventListener('mousemove', moveMouseHandler);

            delete items[store.id];
        };
    }, []);

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
