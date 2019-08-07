import dotProp from 'dot-prop';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * 适配数据
 * 
 * @param {object} target 
 * @param {object} source 
 * @param {object} adapters
 * @return {object}
 */

function adapt(target, source, adapters) {
  for (var key in adapters) {
    var adapter = normalizeAdapter(adapters[key], key); // 通过 path 获取对象上的属性值

    var value = dotProp.get(source, adapter.path, adapter.defaultValue); // 先验证数据再转换数据
    // 当没有 source 时不验证数据

    if (typeof source !== 'undefined') {
      validate(value, adapter);
    } // 转换器转换数据


    if (adapter.transformer) {
      value = adapter.transformer(value, source);
    }

    target[key] = value;
  }

  return target;
}
/**
 * 还原数据
 * 
 * @param {object} source 
 * @param {object} adapters 
 * @return {object}
 */

function restore(source, adapters) {
  var target = {};

  for (var key in adapters) {
    var adapter = normalizeAdapter(adapters[key], key);
    var value = source[key]; // 先还原数据再验证数据

    if (adapter.restorer) {
      value = adapter.restorer(value, source);
    }

    validate(value, adapter);
    dotProp.set(target, adapter.path, value);
  }

  return target;
}
/**
 * 获取一对一映射属性的适配器
 * 
 * @param {*} source 
 * @return {object} adapters 
 */

function getOneToOneAdapters(source) {
  var adapters = {};

  for (var key in source) {
    adapters[key] = key;
  }

  return adapters;
}
/**
 * 规范化适配器
 * 
 * @param {object | string | function} adapter 
 * @param {string} key 
 * 
 * @return {object}
 * @property {string} path
 * @property {*} defaultValue
 * @property {function} validator
 * @property {function} transformer
 * @property {function} restorer
 */

function normalizeAdapter(adapter, key) {
  var path;
  var defaultValue;
  var validator;
  var transformer;
  var restorer;

  if (typeof adapter === 'string' || typeof adapter === 'function') {
    path = adapter;
  } else if (adapter && _typeof(adapter) === 'object') {
    path = adapter.path;
    defaultValue = adapter.defaultValue;
    validator = adapter.validator;
    transformer = adapter.transformer;
    restorer = adapter.restorer;
  }

  if (!path) {
    // 默认的 path 为属性名
    path = key;
  } else if (typeof path === 'function') {
    // TODO 传入 source, key?
    path = path();
  }

  if (typeof defaultValue === 'function') {
    defaultValue = defaultValue();
  }

  return {
    path: path,
    defaultValue: defaultValue,
    validator: validator,
    transformer: transformer,
    restorer: restorer
  };
}
/**
 * 验证数据(仅输出日志提示)
 * 
 * @param {*} value 
 * @param {object} adapter 
 */


function validate(value, adapter) {
  if (adapter.validator) {
    var valid = false;

    if (typeof adapter.validator === 'string') {
      // 数据类型
      valid = _typeof(value) === adapter.validator;
    } else if (adapter.validator instanceof RegExp) {
      // 正则检测
      valid = adapter.validator.test(value);
    } else if (typeof adapter.validator === 'function') {
      // 验证器
      try {
        valid = adapter.validator(value);
      } catch (error) {
        console.error('验证器执行异常', error);
      }
    }

    if (!valid) {
      console.warn('验证数据不通过', adapter.path, value, adapter.validator, adapter);
    }
  }
}

/**
 * 模型适配器
 */

var ModelAdapter =
/**
 * 
 * @param {object} [adapters] 属性适配器: 结构为 `{name1: <adapter>, name2: <adapter>, ...}`
 * - `属性名`为新模型的属性名
 * - `属性值`用于配置适配器, 支持以下几种方式
 *   - 当设置为 `{string}` 或者 `{function}` 类型时作为 `path` 来使用
 *   - 当设置为 `{object}` 类型时支持以下配置项
 *     - `path` `{string | function}` 访问到源数据属性的 path 路径, 常用于避免访问嵌套数据时可能引发的"空指针"错误, 默认为新模型的属性名
 *     - `defaultValue` `{* | function}` 当获取源数据上的属性值为 `undefined` 时可以指定返回一个默认值
 *     - `validator` `{string | RegExp | function}` 验证器: 验证属性是否符合要求(仅输出日志提示)
 *     - `transformer` `{function}` 变形器: 由源数据上的属性值衍生出新的值, 常用于格式化(format)数据, 例如源数据的属性值为时间戳数字, 通过变形器返回格式化的日期字符串
 *     - `restorer` {function} 还原器: 配合 `transformer` 一起使用, 能变形也要能还原回去, 例如将格式化的日期字符串还原为时间戳数字
 * @param {*} [source] 源数据模型
 * @param {boolean} [copy = true] 是否自动一对一映射源数据上的属性.
 * 默认自动 copy, 因为前端数据模型一般用于适配后端接口返回的数据模型, 后端接口字段变更的情况是较少的,
 * 因此如果全部字段都需要适配一遍就很累赘, 因为大部分字段我们是一对一映射的,
 * 再加上后端字段变更的情况又较少, 这样做显然收益不大, 反而增加了使用的门槛. 
 * 但如果需要做到前后端数据模型彻底解耦, 建议关闭 copy 功能,
 * 一个一个属性的适配, 明确声明前端模型有哪些属性.
 */
function ModelAdapter(adapters, source) {
  var copy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  _classCallCheck(this, ModelAdapter);

  var _adapters = adapters;
  var _source = source; // 如果将 $adapt 和 $restore 声明在原型上, 需要将 adapters 之类的属性挂在实例上,
  // 这样原型上的方法才能访问到这些属性, 但这样会增加与 source 上属性冲突的可能性,
  // 因此在构造函数中为每一个实例挂上 $adapt 和 $restore 方法,
  // 这样就可以将 adapters 之类的属性作为私有属性来访问了

  /**
   * @type {function} 适配数据
   * @param {object} source
   */

  this.$adapt = function (source) {
    if (copy) {
      _adapters = Object.assign(getOneToOneAdapters(source), _adapters);
    }

    adapt(this, source, _adapters);
  };
  /**
   * @type {function} 还原数据
   * @return {object}
   */


  this.$restore = function () {
    return restore(this, _adapters);
  };

  this.$adapt(_source);
};

export default ModelAdapter;
