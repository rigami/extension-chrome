import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Fade,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { sample, first, last } from 'lodash';
import clsx from 'clsx';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useLocalObservable, observer } from 'mobx-react-lite';
import MenuInfo from '@/ui/Menu/MenuInfo';

const useStyles = makeStyles((theme) => ({
    greetingContainer: {
        minHeight: '20vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },
    greeting: {
        fontSize: '3rem',
        lineHeight: 1.4,
        wordBreak: 'break-word',
    },
    input: { fontWeight: 'inherit' },
    info: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
    },
    fakeInput: {
        width: 'fit-content',
        display: 'inline',
        wordBreak: 'break-word',
        outline: 'none',
    },
    fakePlaceholder: {
        color: theme.palette.text.secondary,
        cursor: 'text',
    },
}));

function FakeInput(props) {
    const {
        className: externalClassName,
        placeholder,
        value,
        onInput,
        ...otherProps
    } = props;
    const classes = useStyles();
    const inputRef = useRef(null);
    const [defaultState, setDefaultState] = useState(value);
    const [state, setState] = useState(value);

    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setDefaultState(value);
        }

        setState(value);
    }, [value]);

    return (
        <span>
            <div
                tabIndex={0}
                role="textbox"
                ref={inputRef}
                className={clsx(classes.fakeInput, externalClassName)}
                contentEditable
                suppressContentEditableWarning
                {...otherProps}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault();
                }}
                onInput={(event) => {
                    setState(event.currentTarget.innerText);
                    if (onInput) onInput(event);
                }}
            >
                {defaultState}
            </div>
            {!state && (
                <span
                    tabIndex={0}
                    role="button"
                    className={clsx(classes.fakeInput, classes.fakePlaceholder, externalClassName)}
                    {...otherProps}
                    onClick={() => inputRef.current.focus()}
                >
                    {placeholder}
                </span>
            )}
        </span>
    );
}

function Greeting({ className: externalClassName, readOnly = false, force = false }) {
    const classes = useStyles();
    const { t, ready } = useTranslation(['greeting']);
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        firstRender: true,
        greeting: null,
        isFirstRender: true,
        editUserName: coreService.storage.persistent.userName || '',
    }));

    const hours = new Date().getHours();
    let time;

    if (hours <= 4 || hours >= 23) {
        time = 'night';
    } else if (hours <= 12) {
        time = 'morning';
    } else if (hours <= 16) {
        time = 'day';
    } else {
        time = 'evening';
    }

    useEffect(() => {
        if (store.firstRender) {
            store.firstRender = false;
            return;
        }
        store.editUserName = coreService.storage.persistent.userName;

        let greeting;

        if (typeof coreService.storage.temp.greeting === 'undefined') {
            const greetings = t([time, 'default'], {
                returnObjects: true,
                name: '[name]',
            });

            console.log(greetings, time);

            greeting = sample(Array.isArray(greetings) ? greetings : []);
        } else {
            greeting = coreService.storage.temp.greeting;
        }

        store.greeting = store.greeting || greeting;
    }, [coreService.storage.persistent.userName]);

    useEffect(() => {
        if (!ready) return () => {};

        let greeting;

        const lastShowWasRecently = coreService.storage.persistent.lastGreetingTimestamp > Date.now() - 10 * 60 * 1000;

        if (typeof coreService.storage.temp.greeting === 'undefined' && (!lastShowWasRecently || force)) {
            const greetings = t([time, 'default'], {
                returnObjects: true,
                name: '[name]',
            });

            console.log(greetings, time);

            greeting = sample(Array.isArray(greetings) ? greetings : []);

            if (!force) coreService.storage.updateTemp({ greeting: null });
        } else {
            greeting = coreService.storage.temp.greeting;
        }

        store.greeting = greeting;
        if (greeting && !force) coreService.storage.updatePersistent({ lastGreetingTimestamp: Date.now() });

        return () => {
            if (!force) coreService.storage.updatePersistent({ userName: store.editUserName });
        };
    }, [ready]);

    if (!ready || coreService.storage.persistent.userName === null) {
        return (<Box className={clsx(classes.greetingContainer, externalClassName)} />);
    }

    const { userName } = coreService.storage.persistent;

    if (!userName?.trim() && !readOnly) {
        return (
            <Fade in>
                <Box className={clsx(classes.greetingContainer, externalClassName)}>
                    <Typography variant="h1" className={classes.greeting}>
                        {`${t(time, { context: 'appeal' })}, `}
                        <span>
                            <FakeInput
                                autoFocus
                                className={clsx(classes.greeting, classes.input)}
                                value={store.editUserName}
                                placeholder={t('name', { context: 'placeholder' })}
                                onInput={(event) => {
                                    store.editUserName = event.target.innerText;
                                }}
                            />
                        </span>
                        👋!
                    </Typography>
                    <MenuInfo
                        classes={{ root: classes.info }}
                        component="div"
                        show={!store.editUserName?.trim()}
                        message={t('cancelInfo')}
                        description={t('cancelInfo', { context: 'description' })}
                        actions={[
                            <Button
                                key="cancel"
                                onClick={() => coreService.storage.updatePersistent({ userName: null })}
                            >
                                {t('cancel')}
                            </Button>,
                        ]}
                    />
                </Box>
            </Fade>
        );
    }

    if (!store.greeting) {
        return (<Box className={clsx(classes.greetingContainer, externalClassName)} />);
    }

    const greetingParts = store.greeting.split('[name]');

    return (
        <Fade in>
            <Box className={clsx(classes.greetingContainer, externalClassName)}>
                <Typography variant="h1" className={classes.greeting}>
                    <span dangerouslySetInnerHTML={{ __html: first(greetingParts) }} />
                    <span>
                        {readOnly && (userName || t('name', { context: 'stub' }))}
                        {!readOnly && (
                            <FakeInput
                                className={clsx(classes.greeting, classes.input)}
                                value={store.editUserName}
                                placeholder={t('name', { context: 'placeholder' })}
                                onInput={(event) => {
                                    store.editUserName = event.target.innerText;
                                    if (!event.target.innerText.trim()) {
                                        coreService.storage.updatePersistent({ userName: store.editUserName });
                                    }
                                }}
                            />
                        )}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: last(greetingParts) }} />
                </Typography>
            </Box>
        </Fade>
    );
}

export default observer(Greeting);
