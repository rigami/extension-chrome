import React, {
    useState,
    createRef,
    useEffect,
    useRef,
} from 'react';
import {
    Box,
    TextField,
    ClickAwayListener,
    Paper,
    Popover,
    Fade,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import ReactResizeDetector from 'react-resize-detector';
import Scrollbar from '@/ui-components/CustomScroll';
import Search from './Search';

const useStyles = makeStyles((theme) => ({
    input: { marginTop: theme.spacing(2) },
    paper: {},
    inputWrapper: {
        padding: theme.spacing(2),
        paddingTop: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: 1,
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    popoverContent: {
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        background: 'none',
    },
}));

function SearchSiteField({ url = '', marginThreshold = 24, onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const inputRef = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const secondInput = createRef();

    const store = useLocalObservable(() => ({
        url,
        popperRef: null,
        filedWidth: 0,
    }));

    const handleChange = (event) => {
        store.url = event.target.value;
        if (store.url) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (data) => {
        onSelect(data);
        setIsOpen(false);
    };

    useEffect(() => {
        store.url = url;
    }, [url]);

    return (
        <Paper elevation={8} style={{ width: store.filedWidth + 32 }} className={classes.paper}>
            <Box className={classes.inputWrapper}>
                <TextField
                    label={t('editor.bookmarkUrl')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    ref={secondInput}
                    value={store.url || ' '}
                    className={classes.input}
                    onChange={handleChange}
                    onMouseDown={() => setIsBlockEvent(true)}
                    onClick={() => {
                        if (store.url) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.nativeEvent.code === 'Enter') {
                            handleSelect({
                                url: store.url,
                                allowChangeUrl: true,
                            });
                        }
                    }}
                />
            </Box>
            <Search
                query={store.url}
                onSelect={(result) => handleSelect(result)}
            />
        </Paper>
    );
}

export default observer(SearchSiteField);
