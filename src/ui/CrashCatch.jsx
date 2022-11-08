import React from 'react';
import { alpha, withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Stub from '@/ui-components/Stub';
import localEventBus from '@/utils/localEventBus';

const styles = (theme) => ({
    stub: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
    },
    emoticon: {
        fontSize: '10rem',
        color: alpha(theme.palette.text.secondary, 0.06),
        fontWeight: 700,
    },
    error: {
        position: 'absolute',
        bottom: 0,
        margin: 'auto',
        width: '100%',
        left: 0,
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

class CrashCatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };

        localEventBus.on('system.forceCrash', (error) => {
            this.setState({
                hasError: true,
                error,
            });
        });
    }

    static getDerivedStateFromError(error) {
        document.title = 'Rigami down :(';
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('APP DOWN ERROR:', error, errorInfo);
    }

    render() {
        const { state: { hasError, error }, props: { children, classes } } = this;

        if (hasError) {
            return (
                <Stub
                    message="(ᗒᗣᗕ)՞"
                    description="Ooops... Something went wrong, and rigami down"
                    classes={{
                        root: classes.stub,
                        title: classes.emoticon,
                        description: classes.message,
                    }}
                >
                    <Typography variant="caption" className={classes.error}>{error.toString()}</Typography>
                </Stub>
            );
        }

        return children;
    }
}

export default withStyles(styles)(CrashCatch);
