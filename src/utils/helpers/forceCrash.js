import localEventBus from '@/stores/app/localEventBus';

export default (error) => {
    localEventBus.call('system.forceCrash', error);
};
