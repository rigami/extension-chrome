import { assign, pick } from 'lodash';

class ContextMenuItem {
    type = 'button';
    title;
    icon;
    disabled;
    iconProps;
    onClick;
    action;

    constructor(item) {
        assign(this, pick(item, [
            'title',
            'disabled',
            'icon',
            'iconProps',
            'onClick',
            'action',
        ]));
    }
}

class ContextMenuDivider {
    type = 'divider';
}

class ContextMenuSelect extends ContextMenuItem {
    type = 'select';
    variants;
    value;
    onChange;

    constructor(item) {
        super(item);

        assign(this, pick(item, ['variants', 'value', 'onChange']));
    }
}

class ContextMenuCustomItem {
    type = 'customItem';
    render;

    constructor(item) {
        assign(this, pick(item, ['render']));
    }
}

export {
    ContextMenuItem,
    ContextMenuSelect,
    ContextMenuCustomItem,
    ContextMenuDivider,
};
