'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var dotProp = _interopDefault(require('dot-prop'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// @fav/prop.defaults-deep@1.0.1 有点不符合我的需求

var enumOwnProps = require('@fav/prop.enum-own-props');

var isPlainObject = require('@fav/type.is-plain-object');

function defaultsDeep(dest
/* , ...src */
) {
  //   if (!isPlainObject(dest)) {
  //     dest = {};
  //   }
  for (var i = 1, n = arguments.length; i < n; i++) {
    defaultsDeepEach(dest, arguments[i]);
  }

  return dest;
}

function defaultsDeepEach(dest, src) {
  var props = enumOwnProps(src);

  for (var i = 0, n = props.length; i < n; i++) {
    var prop = props[i];
    var srcProp = src[prop];
    var destProp = dest[prop];

    if (isPlainObject(srcProp)) {
      if (destProp == null) {
        dest[prop] = destProp = {};
      } else if (!isPlainObject(destProp)) {
        continue;
      }

      defaultsDeepEach(destProp, srcProp);
      continue;
    }

    if (destProp != null) {
      continue;
    } // if (srcProp == null) {
    //   continue;
    // }


    try {
      dest[prop] = srcProp;
    } catch (e) {// If a property is read only, TypeError is thrown,
      // but this function ignore it.
    }
  }
}

/**
 * 获取 path 分组
 * 
 * @param {string} path 
 * @return {Array<string>}
 * @see https://github.com/sindresorhus/dot-prop
 */

function getPathSegments(path) {
  var pathArray = path.split('.');
  var parts = [];

  for (var i = 0; i < pathArray.length; i++) {
    var p = pathArray[i];

    while (p[p.length - 1] === '\\' && pathArray[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.';
      p += pathArray[++i];
    }

    parts.push(p);
  }

  return parts;
}
/**
 * 根据 path 获取父级对象
 * 
 * 例如 path 为: a.b.c
 * 我们需要先拿到 a.b 这个目标对象
 * 
 * @param {object} target 
 * @param {string} propertyPath
 * @return {object}
 */


function getParentObject(target, propertyPath) {
  var parentObject = null;
  var pathArray = getPathSegments(propertyPath);

  if (pathArray.length === 1) {
    parentObject = target;
  } else {
    var parentPropertyPath = pathArray.slice(0, pathArray.length - 1).join('.');
    parentObject = dotProp.get(target, parentPropertyPath);

    if (typeof parentObject === 'undefined' || parentObject === null) {
      parentObject = {};
      dotProp.set(target, parentPropertyPath, parentObject);
    }
  }

  return parentObject;
}
/**
 * 适配数据
 * 
 * @param {object} target 
 * @param {object} propertyAdapter
 * @param {object} register
 * @return {object}
 */


function adapt(target, propertyAdapter, register) {
  for (var propertyPath in propertyAdapter) {
    var adapter = propertyAdapter[propertyPath] || {}; // 通过 getter/setter 实现转换器转换数据

    if (adapter.transformer) {
      var pathArray = getPathSegments(propertyPath);
      var propertyName = pathArray[pathArray.length - 1];
      var definePropertyTarget = getParentObject(target, propertyPath);
      var propertyValue = dotProp.get(target, propertyPath);
      dotProp.set(register, propertyPath, propertyValue); // 将原属性改写为 getter/setter, 属性值保存到寄存器上

      Object.defineProperty(definePropertyTarget, propertyName, {
        get: function get() {
          // TODO 如果要适配的属性本身是一个 getter/setter 呢?
          // 从寄存器上获取属性值
          var original = dotProp.get(register, propertyPath);
          return adapter.transformer(original, target);
        },
        set: function set(value) {
          // 将属性值保存到寄存器上
          dotProp.set(register, propertyPath, value);
        },
        configurable: true,
        enumerable: true
      });
    }
  }

  return target;
}
/**
 * 还原数据
 * 
 * @param {object} target 
 * @param {object} propertyAdapter 
 * @param {object} register 
 * @return {object}
 */

function restore(target, propertyAdapter, register) {
  var source = defaultsDeep({}, target);

  for (var propertyPath in propertyAdapter) {
    var adapter = propertyAdapter[propertyPath] || {}; // 去除 getter/setter 转换器, 还原为原始值

    if (adapter.transformer) {
      var pathArray = getPathSegments(propertyPath);
      var propertyName = pathArray[pathArray.length - 1]; // 原始值在寄存器上

      var propertyValue = dotProp.get(register, propertyPath);
      var definePropertyTarget = getParentObject(source, propertyPath);
      Object.defineProperty(definePropertyTarget, propertyName, {
        value: propertyValue,
        configurable: true,
        enumerable: true,
        writable: true
      });
    }
  }

  return source;
}

/**
 * 模型适配器
 */

var ModelAdapter =
/**
 * @param {*} [source] 源数据
 * @param {*} [defaults] 源数据的默认值
 * @param {object} [propertyAdapter] 属性适配器: 结构为 `{name1: <adapter>, name2: <adapter>, ...}`
 * - `属性名`为 `{string}` 类型, 用于指定要适配的属性的 path 路径
 * - `属性值`为 `{object}` 类型, 用于配置适配器, 支持以下配置项
 *     - `transformer` `{function}` 变形器: 由源数据上的属性值衍生出新的值, 常用于格式化(format)数据, 例如源数据的属性值为时间戳数字, 通过变形器返回格式化的日期字符串
 */
function ModelAdapter(source, defaults) {
  var propertyAdapter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  _classCallCheck(this, ModelAdapter);

  var _propertyAdapter = propertyAdapter;
  var _source = source; // 用于存储 getter/setter 私有数据的寄存器

  var register = {}; // 如果将 $getSource 和 $setSource 之类的方法声明在原型上, 需要将 source 之类的属性挂在 this 上,
  // 这样原型上的方法才能访问到这些属性, 但这样会增加与 source 上属性冲突的可能性,
  // 因此在构造函数中为每一个实例挂上 $getSource 和 $setSource 之类的方法,
  // 这样就可以将 source 之类的属性作为私有属性来访问了.
  // 通过 defineProperty 来定义这些方法属性, 是要让这些方法属性都是不可枚举的

  /**
   * @type {function} 获取源数据
   * @param {string} propertyPath
   * @return {*}
   */

  Object.defineProperty(this, '$getSource', {
    value: function value(propertyPath) {
      if (propertyPath) {
        return dotProp.get(_source, propertyPath);
      } else {
        return _source;
      }
    }
  });
  /**
   * @type {function} 设置源数据
   * @param {*} source
   */

  Object.defineProperty(this, '$setSource', {
    value: function value(source) {
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
    }
  });
  /**
   * @type {function} 新增/更新/删除属性适配器. 当传入适配器为 null 时, 删除该适配器
   * @param {string} propertyPath
   * @param {object} adapter
   * @param {function} adapter.transformer
   */

  Object.defineProperty(this, '$setAdapter', {
    value: function value(propertyPath, adapter) {
      if (adapter) {
        _propertyAdapter[propertyPath] = adapter;
      } else {
        delete _propertyAdapter[propertyPath];
      }

      adapt(this, _propertyAdapter, register);
    }
  });
  /**
   * @type {function} 还原数据
   * @param {string} propertyPath
   * @return {object}
   */

  Object.defineProperty(this, '$restore', {
    value: function value(propertyPath) {
      var restored = restore(this, _propertyAdapter, register);

      if (propertyPath) {
        return dotProp.get(restored, propertyPath);
      } else {
        return restored;
      }
    }
  });
  this.$setSource(source);
};

module.exports = ModelAdapter;
