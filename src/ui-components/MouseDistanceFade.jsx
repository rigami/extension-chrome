import React, { useEffect, useRef } from 'react';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useLocalObservable, Observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { useForkRef } from '@material-ui/core/utils';
import { max, values } from 'lodash';
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

const MouseDistanceFade = React.forwardRef(function MouseDistanceFade({ children }, ref) {
    const classes = useStyles();
    const rootAl = useRef();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        hideTimer: null,
        smooth: false,
        id: Date.now(),
    }));

    const handleRef = useForkRef(children.ref, rootAl);

    const moveMouseHandler = action((e) => {
        if (!rootAl.current) return;

        store.smooth = false;
        clearTimeout(store.hideTimer);

        const { x, y, height, width } = rootAl.current.getBoundingClientRect();
        const a = Math.abs((x + width * 0.5) - e.pageX);
        const b = Math.abs((y + height * 0.5) - e.pageY);
        let dist = 0.96 * Math.max(a, b) + 0.4 * Math.min(a, b);

        if (dist > 300) {
            dist = 300;
        } else if (dist < 90) {
            dist = 90;
        }

        dist -= 90;

        items[store.id] = 1 - dist / 210;

        const calcOpacity = max(values(items));

        coreService.localEventBus.call('system/interfaceOpacity', { opacity: calcOpacity });

        if (rootAl.current) rootAl.current.style.opacity = calcOpacity;

        store.hideTimer = setTimeout(action(() => {
            if (e.path.indexOf(rootAl.current) !== -1 || e.path.indexOf(rootAl.current) !== -1) return;

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

    console.log('clsx', clsx(children.props.className, store.smooth && classes.smooth))

    return (
        <Observer>
            {() => React.cloneElement(children, {
                ref: handleRef,
                className: clsx(children.props.className, store.smooth && classes.smooth),
            })}
        </Observer>
    );
});

export default MouseDistanceFade;
