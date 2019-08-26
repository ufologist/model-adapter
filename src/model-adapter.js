import dotProp from 'dot-prop';

import {
    adapt,
    restore
} from './adapter-util.js';

import defaultsDeep from './fav-prop.defaults-deep.js';

/**
 * 模型适配器
 */
export default class ModelAdapter {
    /**
     * @param {*} [source] 源数据
     * @param {*} [defaults] 源数据的默认值
     * @param {object} [propertyAdapter] 属性适配器: 结构为 `{name1: <adapter>, name2: <adapter>, ...}`
     * - `属性名`为 `{string}` 类型, 用于指定要适配的属性的 path 路径
     * - `属性值`为 `{object}` 类型, 用于配置适配器, 支持以下配置项
     *     - `transformer` `{function}` 变形器: 由源数据上的属性值衍生出新的值, 常用于格式化(format)数据, 例如源数据的属性值为时间戳数字, 通过变形器返回格式化的日期字符串
     */
    constructor(source, defaults, propertyAdapter = {}) {
        var _propertyAdapter = propertyAdapter;
        var _source = source;
        // 用于存储 getter/setter 私有数据的寄存器
        var register = {};

        // 如果将 $getSource 和 $setSource 之类的方法声明在原型上, 需要将 source 之类的属性挂在 this 上,
        // 这样原型上的方法才能访问到这些属性, 但这样会增加与 source 上属性冲突的可能性,
        // 因此在构造函数中为每一个实例挂上 $getSource 和 $setSource 之类的方法,
        // 这样就可以将 source 之类的属性作为私有属性来访问了.
        // 通过 defineProperty 来定义这些方法属性, 是要让这些方法属性都是不可枚举的
        /**
         * @type {function} 获取源数据
         * @param {string} propertyPath
         * @return {*}
         */
        this.$getSource = function(propertyPath) {
            if (propertyPath) {
                return dotProp.get(_source, propertyPath);
            } else {
                return _source;
            }
        };

        /**
         * @type {function} 设置源数据
         * @param {*} source
         */
        this.$setSource = function(source) {
            // 重置 this 上的属性, 仅保留方法, 确保 this 是一个"空"对象
            for (var key in this) {
                if (typeof this[key] !== 'function') {
                    delete this[key];
                }
            }

            _source = source;
            register = {};
            defaultsDeep(this, _source, defaults);
            adapt(this, _propertyAdapter, register);
        };

        /**
         * @type {function} 新增/更新/删除属性适配器. 当传入适配器为 null 时, 删除该适配器
         * @param {string} propertyPath
         * @param {object} adapter
         * @param {function} adapter.transformer
         */
        this.$setAdapter = function(propertyPath, adapter) {
            if (adapter) {
                _propertyAdapter[propertyPath] = adapter;
            } else {
                delete _propertyAdapter[propertyPath];
            }

            adapt(this, _propertyAdapter, register);
        };

        /**
         * @type {function} 还原数据
         * @param {string} propertyPath
         * @return {object}
         */
        this.$restore = function(propertyPath) {
            var restored = restore(this, _propertyAdapter, register);
            if (propertyPath) {
                return dotProp.get(restored, propertyPath);
            } else {
                return restored;
            }
        };

        this.$setSource(source);
    }
}