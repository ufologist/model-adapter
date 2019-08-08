import {
    adapt,
    restore,
    getOneToOnePropertyAdapter
} from './adapter-util.js';

/**
 * 模型适配器
 */
export default class ModelAdapter {
    /**
     * 
     * @param {object} [propertyAdapter] 属性适配器: 结构为 `{name1: <adapter>, name2: <adapter>, ...}`
     * - `属性名`为新模型的属性名
     * - `属性值`用于配置适配器, 支持以下几种方式
     *   - 当设置为 `{string}` 或者 `{function}` 类型时作为 `path` 来使用
     *   - 当设置为 `{object}` 类型时支持以下配置项
     *     - `path` `{string | function}` 访问到源数据属性的 path 路径, 常用于避免访问嵌套数据时可能引发的"空指针"错误, 默认为新模型的属性名
     *     - `defaultValue` `{* | function}` 当获取源数据上的属性值为 `undefined` 或者 `null` 时可以指定返回一个默认值
     *     - `validator` `{string | RegExp | function}` 验证器: 验证属性是否符合要求(仅输出日志提示)
     *     - `transformer` `{function}` 变形器: 由源数据上的属性值衍生出新的值, 常用于格式化(format)数据, 例如源数据的属性值为时间戳数字, 通过变形器返回格式化的日期字符串
     *     - `restorer` {function} 还原器: 配合 `transformer` 一起使用, 能变形也要能还原回去, 例如将格式化的日期字符串还原为时间戳数字
     * @param {*} [source] 源数据
     * @param {boolean} [copy = true] 是否自动一对一映射源数据上的属性.
     * 默认自动 copy, 因为前端数据模型一般用于适配后端接口返回的数据模型, 后端接口字段变更的情况是较少的,
     * 因此如果全部字段都需要适配一遍就很累赘, 因为大部分字段我们是一对一映射的,
     * 再加上后端字段变更的情况又较少, 这样做显然收益不大, 反而增加了使用的门槛. 
     * 但如果需要做到前后端数据模型彻底解耦, 建议关闭 copy 功能,
     * 一个一个属性的适配, 明确声明前端模型有哪些属性.
     */
    constructor(propertyAdapter, source, copy = true) {
        var _propertyAdapter = propertyAdapter;
        var _source = source;

        // 如果将 $adapt 和 $restore 声明在原型上, 需要将 source 之类的属性挂在实例上,
        // 这样原型上的方法才能访问到这些属性, 但这样会增加与 source 上属性冲突的可能性,
        // 因此在构造函数中为每一个实例挂上 $adapt 和 $restore 方法,
        // 这样就可以将 source 之类的属性作为私有属性来访问了
        /**
         * @type {function} 适配数据
         * @param {object} source
         */
        this.$adapt = function(source) {
            if (copy) {
                _propertyAdapter = Object.assign(getOneToOnePropertyAdapter(source), _propertyAdapter);
            }

            adapt(this, source, _propertyAdapter);
        };

        /**
         * @type {function} 还原数据
         * @return {object}
         */
        this.$restore = function() {
            return restore(this, _propertyAdapter);
        };

        this.$adapt(_source);
    }
}