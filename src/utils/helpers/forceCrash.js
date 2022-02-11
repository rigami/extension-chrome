import localEventBus from '@/utils/localEventBus';

export default (error) => {
    localEventBus.call('system.forceCrash', error);
};
