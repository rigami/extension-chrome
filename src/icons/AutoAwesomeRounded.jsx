import React from 'react';
import { SvgIcon } from '@material-ui/core';
import Svg from './resources/auto_awesome_black_24dp.svg';

function AutoAwesomeRounded(props) {
    return (
        <SvgIcon {...props}>
            <Svg />
        </SvgIcon>
    );
}

export default AutoAwesomeRounded;
