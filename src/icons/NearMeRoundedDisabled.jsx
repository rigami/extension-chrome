import React from 'react';
import { SvgIcon } from '@material-ui/core';
import Svg from './resources/near_me_disabled-24px.svg';

function NearMeRoundedDisabled(props) {
    return (
        <SvgIcon {...props}>
            <Svg />
        </SvgIcon>
    );
}

export default NearMeRoundedDisabled;
