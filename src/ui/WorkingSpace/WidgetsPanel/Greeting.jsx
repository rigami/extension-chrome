import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    Fade,
    Tooltip,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { sample, first, last } from 'lodash';
import clsx from 'clsx';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { useCoreService } from '@/stores/app/core';
import Banner from '@/ui-components/Banner';
import { SERVICE_STATE } from '@/enum';

const useStyles = makeStyles((theme) => ({
    greetingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },
    greeting: {
        fontSize: '1.5rem',
        lineHeight: 1.4,
        wordBreak: 'break-word',
    },
    input: { fontWeight: 'inherit' },
    info: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
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
    const { t } = useTranslation(['greeting']);

    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setDefaultState(value);
        }

        setState(value);
    }, [value]);

    useEffect(() => {
        inputRef.current.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertHTML', false, text);
        });
    }, []);

    return (
        <Tooltip title={t('button.edit')}>
            <span>
                <div
                    tabIndex={0}
                    role="textbox"
                    ref={inputRef}
                    className={clsx(classes.fakeInput, externalClassName)}
                    contentEditable
                    spellCheck={false}
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
        </Tooltip>
    );
}

function Greeting(props) {
    const {
        readOnly = false,
        force = false,
        className: externalClassName,
        onHide,
        onChange,
    } = props;
    const classes = useStyles();
    const { t, ready } = useTranslation(['greeting']);
    const coreService = useCoreService();
    const hours = new Date().getHours();
    const store = useLocalObservable(() => {
        let timesOfDay;

        if (hours >= 5 && hours <= 9) {
            timesOfDay = 'morning';
        } else if (hours >= 9 && hours <= 12) {
            timesOfDay = 'lateMorning';
        } else if (hours >= 12 && hours <= 15) {
            timesOfDay = 'day';
        } else if (hours >= 15 && hours <= 18) {
            timesOfDay = 'lateDay';
        } else if (hours >= 18 && hours <= 22) {
            timesOfDay = 'evening';
        } else if (hours >= 22 && hours <= 24) {
            timesOfDay = 'lateEvening';
        } else if (hours >= 24 || hours <= 2) {
            timesOfDay = 'night';
        } else {
            timesOfDay = 'lateNight';
        }

        return {
            timesOfDay,
            focus: false,
            firstRender: true,
            greeting: null,
            enabled: coreService.storage.data.userName !== null || force,
            edit: coreService.storage.data.userName === undefined
                || coreService.storage.data.userName === '',
            userName: coreService.storage.data.userName || '',
        };
    });

    useEffect(() => {
        if (store.firstRender) {
            store.firstRender = false;
            return;
        }
        store.userName = coreService.storage.data.userName;
        store.enabled = store.userName !== null || force;
        store.edit = store.edit || store.enabled;
    }, [coreService.storage.data.userName]);

    useEffect(() => {
        console.log('store.focus:', store.focus);
        if (onChange) onChange(store.userName);
        if (store.focus) {
            coreService.storage.update({ userName: store.userName || '' });
        }
    }, [store.userName]);

    useEffect(() => {
        if (!ready) return;

        let greeting;

        if (typeof coreService.tempStorage.data.greeting === 'undefined') {
            const greetings = t([`greeting.${store.timesOfDay}`, 'greeting.default'], {
                returnObjects: true,
                name: '[name]',
            });

            console.log('greetings:', greetings, store.timesOfDay);

            greeting = sample(Array.isArray(greetings) ? greetings : []);
        } else {
            greeting = coreService.tempStorage.data.greeting;
        }

        console.log('greeting:', greeting);

        store.greeting = greeting;
    }, [ready]);

    if (!ready || (coreService.storage.data.userName === null && !store.enabled) || !store.greeting) {
        return null;
    }

    const { userName } = coreService.storage.data;

    if ((!userName?.trim() || store.edit) && !readOnly) {
        return (
            <Fade in>
                <Box className={clsx(classes.greetingContainer, externalClassName)}>
                    <Typography variant="h1" className={classes.greeting}>
                        {`${t(store.timesOfDay, { context: 'appeal' })}, `}
                        <span>
                            <FakeInput
                                autoFocus
                                className={clsx(classes.greeting, classes.input)}
                                value={store.userName}
                                placeholder={t('name', { context: 'placeholder' })}
                                onFocus={() => { store.focus = true; }}
                                onBlur={() => { store.focus = false; }}
                                onInput={(event) => { store.userName = event.target.innerText; }}
                            />
                        </span>
                    </Typography>
                    <Collapse in={!store.userName?.trim()}>
                        <Banner
                            classes={{ root: classes.info }}
                            component="div"
                            message={t('cancelInfo')}
                            description={t('cancelInfo', { context: 'description' })}
                            toolbarActions={[
                                <Button
                                    key="cancel"
                                    onClick={() => {
                                        if (!force) store.enabled = false;
                                        coreService.storage.update({ userName: null });

                                        if (onHide) onHide();
                                    }}
                                >
                                    {t('cancel')}
                                </Button>,
                            ]}
                        />
                    </Collapse>
                </Box>
            </Fade>
        );
    }

    const greetingParts = store.greeting.split('[name]');

    return (
        <Fade in>
            <Box className={clsx(classes.greetingContainer, externalClassName)}>
                <Typography variant="h1" className={classes.greeting}>
                    <span dangerouslySetInnerHTML={{ __html: first(greetingParts) }} />
                    <span>
                        {readOnly && (store.userName || t('name', { context: 'stub' }))}
                        {!readOnly && (
                            <FakeInput
                                className={clsx(classes.greeting, classes.input)}
                                value={store.userName}
                                placeholder={t('name', { context: 'placeholder' })}
                                onFocus={() => { store.focus = true; }}
                                onBlur={() => { store.focus = false; }}
                                onInput={(event) => {
                                    store.userName = event.target.innerText;
                                    if (!event.target.innerText.trim()) {
                                        coreService.storage.update({ userName: store.userName });
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

const ObserverGreeting = observer(Greeting);

function GreetingContainer({ className: externalClassName, ...props }) {
    const coreService = useCoreService();
    const [state, setState] = useState(coreService.storage.state);

    useEffect(() => {
        setState(coreService.storage.state);
    }, [coreService.storage.state]);

    if (state !== SERVICE_STATE.DONE) return null;

    return (<ObserverGreeting {...props} className={externalClassName} />);
}

export default observer(GreetingContainer);
