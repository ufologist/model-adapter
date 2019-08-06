import {
    adapt,
    restore
} from './adapter-util.js';

/**
 * 模型适配器
 */
export default class ModelAdapter {
    constructor(adapters, source) {
        adapt(this, source, adapters);

        /**
         * 
         */
        this.$adapt = function(source) {
            adapt(this, source, adapters);
        };

        /**
         * 
         */
        this.$restore = function() {
            return restore(this, adapters);
        };
    }
}