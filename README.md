# model-adapter

[![NPM version][npm-image]][npm-url] [![Build Status][ci-status-image]][ci-status-url] [![Coverage Status][coverage-status-image]][coverage-status-url] [![Known Vulnerabilities][vulnerabilities-status-image]][vulnerabilities-status-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[vulnerabilities-status-image]: https://snyk.io/test/npm/model-adapter/badge.svg
[vulnerabilities-status-url]: https://snyk.io/test/npm/model-adapter
[ci-status-image]: https://travis-ci.org/ufologist/model-adapter.svg?branch=master
[ci-status-url]: https://travis-ci.org/ufologist/model-adapter
[coverage-status-image]: https://coveralls.io/repos/github/ufologist/model-adapter/badge.svg?branch=master
[coverage-status-url]: https://coveralls.io/github/ufologist/model-adapter
[npm-image]: https://img.shields.io/npm/v/model-adapter.svg?style=flat-square
[npm-url]: https://npmjs.org/package/model-adapter
[license-image]: https://img.shields.io/github/license/ufologist/model-adapter.svg
[license-url]: https://github.com/ufologist/model-adapter/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/model-adapter/blob/master/CHANGELOG.md

[![npm-image](https://nodei.co/npm/model-adapter.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.com/package/model-adapter)

模型适配器: 后端数据与前端数据的桥梁

专注于解决前端那些老生常谈的问题(没碰到过算你赢), 如果你遇到过以下场景, 请试用一下
- 嵌套数据: 哎呀\~报错了; 哦\~访问 xxx 为空了啊
- 空数据: 咦\~怎么没有头像; 哦\~需要一个默认头像啊
- 格式化数据: 诶\~要显示年月日; 但返回的数据是时间戳啊

## 初衷

在 `Vue` 或者其他视图层框架中, 如果直接使用如下插值表达式, 当嵌套对象(通常是后端返回的数据)中的某一层级为空时就会报错 `TypeError: Cannot read property 'xxx' of undefined`, **造成整个组件都无法渲染**.

```javascript
{{a.aa.aaa}}
```

为了解决这种问题, 让前端的视图层能够容错增强代码的健壮性, 我们可能要写出如糖葫芦一般的防御性代码, 例如这样 `{{a && a.aa && a.aa.aaa}}`, 要是再多嵌套几层, 简直不忍直视啊.

舒服一些的处理方式是通过 `object path get` 之类的库事先处理好数据, 形成前端的视图层模型, 尽量避免嵌套数据, 再到视图层中使用, 例如

```javascript
// 在视图中使用: {{aaa}}
var vm = {
    aaa: _.get('a.aa.aaa')
};
```

## 核心思路

建立一个新的模型, 通过设置**默认值来补齐**源数据(模型)上可能缺少的对象嵌套层次. 这样我们就能够以访问源数据一致的方式来访问新模型上的数据.

例如要访问源数据上的 `a.aa.aaa`, 如果源数据的 `a` 为 `null`, 那么我们直接访问肯定是会报错的.

因此我们可以准备一份默认数据, 来补齐源数据上可能缺失的数据.
* 当源数据上没有数据(`undefined` 或者 `null`)时, 模型返回默认数据上的数据
* 当源数据上有数据时, 模型返回源数据上的数据

```
新模型(target)                       源数据(source)          默认值(default)
{                                   {                       {
    a: {                        <─       a: null,       <─      a: {
        aa: {                                                       aa: {
            aaa: 'default-aaa'                                            aaa: 'default-aaa'
        }                                                           }
    },                                                          },
    b: 'source-b'               <─       b: 'source-b'          b: 'default-b',
    c: 'default-c'              <─                      <─      c: 'default-c'
}                                   }                       }
```

另外一种**映射**属性的实现思路可以参考[v0.0.1](https://github.com/ufologist/model-adapter/tree/v0.0.1)版本

--------

针对格式化数据的需求, 采取的思路为将属性改写为 `setter/getter`, 以输入和输出的概念来适配新模型上的属性
* `setter` 做为输入(input), 以源数据上的值为标准来接收数据
  * 例如源数据返回的字段值为时间戳, 那么我们设置属性值时, 始终设置为时间戳: `a.aa.aaa = 1566814067549`
* `getter` 做为输出(output), 将源数据做转换后返回我们需要的格式
  * 例如将时间戳格式化为日期字符串 `a.aa.aaa // 2019-08-26`

```javascript
// setter
a.aa.aaa = 1566814067549 // 输入(input)
// getter
a.aa.aaa // 2019-08-26   // 输出(output)
```

## 示例

### 嵌套数据/空数据: 用默认值来补齐(重点是补齐嵌套对象)

```javascript
import ModelAdapter from 'model-adapter';

// 这里示例由后端接口返回的数据
var ajaxData = {
    name: null,
    age: 18,
    extData: null
};

var model = new ModelAdapter(ajaxData, {
    name: 'Guest',
    extData: {
        country: {
            name: 'China'
        }
    }
});

console.log(model.name);                 // 'Guest'
console.log(model.age);                  // 18
console.log(model.extData.country.name); // 'China'
```

### 格式化数据: 变形

```javascript
import ModelAdapter from 'model-adapter';

var ajaxData = {
    foo: {
        bar: {
            date: 1565001521464
        }
    }
};

var model = new ModelAdapter(ajaxData, null, {
    'foo.bar.date': {
        transformer: function(value, source) { // 变形器负责格式化数据
            return new Date(value).toISOString();
        }
    }
});

var restored = model.$restore();

console.log(model.foo.bar.date);    // '2019-08-05T10:38:41.464Z'
console.log(restored.foo.bar.date); // 1565001521464
```

### 数组: 在 `transformer` 中适配数组元素的模型

```javascript
import ModelAdapter from 'model-adapter';

var ajaxData = {
    users: [{
        name: null,
        age: 18,
        extData: null
    }, {
        name: 'Shine',
        age: 19,
        extData: {
            country: {
                name: 'USA'
            }
        }
    }]
};

var model = new ModelAdapter(ajaxData, null, {
    users: {
        transformer: function(value) {
            return value.map(function(item) {
                return new ModelAdapter(item, {
                    name: 'Sun',
                    extData: {
                        country: {
                            name: 'China'
                        }
                    }
                });
            });
        }
    }
});

console.log(model.users[0].name);                 // 'Sun'
console.log(model.users[0].age);                  // 18
console.log(model.users[0].extData.country.name); // 'China'

console.log(model.users[1].name);                 // 'Shine'
console.log(model.users[1].age);                  // 19
console.log(model.users[1].extData.country.name); // 'USA'
```

### 先声明模型再设置源数据

```javascript
import ModelAdapter from 'model-adapter';

// 声明模型(预先定义好 defaults 和 propertyAdapter)
var model = new ModelAdapter(null, {
    name: 'Guest',
    extData: {
        country: {
            name: 'China'
        }
    }
});

var ajaxData = {
    name: null,
    age: 18,
    extData: null
};
// 设置源数据
model.$setSource(ajaxData);

console.log(model.name);                 // 'Guest'
console.log(model.age);                  // 18
console.log(model.extData.country.name); // 'China'
```

### 声明模型类

```javascript
import ModelAdapter from 'model-adapter';

// 声明模型类(预先定义好 defaults 和 propertyAdapter)
class User extends ModelAdapter {
    constructor(source) {
        super(source, {
            name: 'Guest',
            extData: {
                country: {
                    name: 'China'
                }
            }
        });
    }
}

var ajaxData = {
    name: null,
    age: 18,
    extData: null
};

// 使用模型类时, 只需要设置源数据
var user = new User(ajaxData);

console.log(user);                      // <User>
console.log(user.name);                 // 'Guest'
console.log(user.age);                  // 18
console.log(user.extData.country.name); // 'China'
```

### 与其他框架集成

* [Vue](https://raw.githack.com/ufologist/model-adapter/master/test/vue-with-model-adapter.html)
  * [如何让 Vue 为 data 上新增的属性创建 getter/setter](https://github.com/ufologist/model-adapter/blob/master/vue-dynamic-add-property-problem.md)
* [React](https://raw.githack.com/ufologist/model-adapter/master/test/react-with-model-adapter.html)

### 建议的接入方式

* 方式一: 在前端服务层中接入
* 方式二: 在后端(`Node`)中间层中接入

例如
```javascript
// service/user.js
export function getUser() {
    return axios('/user').then(function(response) {
        return new ModelAdapter(response.data, {
            name: 'Guest',
            extData: {
                country: {
                    name: 'China'
                }
            }
        });
    });
}
```

## API 概览

* 构造函数

  ```javascript
  var model = new ModelAdapter(source, defaults, propertyAdapter);
  ```

  * `source`: 源数据
  * `defaults`: 源数据的默认值
  * `propertyAdapter`: 属性适配器

    结构为
    ```javascript
    {
        propertyPath1: <adapter>,
        propertyPath2: <adapter>,
        ...
    }
    ```

    * **属性名**为新模型的属性名, 用于指定要适配的属性的 path 路径
    * **属性值**用于配置适配器, 支持的配置方式详见 [API文档](https://doc.esdoc.org/github.com/ufologist/model-adapter/class/src/model-adapter.js~ModelAdapter.html)
* 设置源数据

  ```javascript
  model.$setSource(source);
  ```
* 获取源数据(支持通过 `propertyPath` 参数安全地获取源数据)

  ```javascript
  var source = model.$getSource(propertyPath);
  ```
* 新增/更新/删除属性适配器(当传入的适配器为 `null` 时, 删除该适配器)

  ```javascript
  model.$setAdapter(propertyPath, adapter);
  ```
* 还原数据(支持通过 `propertyPath` 参数安全地获取还原的数据)

  ```javascript
  var restored = model.$restore(propertyPath);
  ```

## 参考

* [「数据模型」是如何助力前端开发的](https://mp.weixin.qq.com/s/q6xybux0fhrUz5HE5TY0aA)

  > 场景
  > * 在这种场景下，我们在开发中就不得不写一些防御性的代码，久而久之，项目中类似代码会越来越多，**碰到层级深的，防御性代码就会写的越来越恶心**。另外还有的就是，如果服务端在这中间某个字段删掉了，那就又得特殊处理了，否则会有一些未知的非空错误报错，这种编码方式会导致前端严重依赖服务端定义的数据结构，非常不利于后期维护。
  > * 平时开发中，我们拿到了服务端返回的数据，有些不是标准格式的，是无法直接在视图上直接使用的，是需要额外**格式化处理**的，比如我司服务端返回的的价格字段单位统一是分，跟时间相关的字段统一是毫秒值，这个时候我们在组件的生命周期内，就不得不而外增加一些对数据处理的逻辑，还有就是这部分处理在很多组件都是公用的，我们就不得不频繁编写类似的代码，数据处理逻辑没有得到复用。
  > * 在用户做了一些交互后，需要将一些数据存储到服务端，这个时候我们拿到的数据往往也是非标准的，就比如你要提交个表单，其中有个价格字段，你拿到价格单位可能是百位的，而服务端需要的单位必须是分位的，这个时候**在提交数据之前，你又得对这部分数据进行处理**，还有就是有些接口的参数是json字符串形式的，可能是多级嵌套的，你还要需要特意构造这样的参数数据格式，导致开发中编写了太多与业务无关的逻辑，随着项目逐渐扩大或者维护人员更迭，项目会越来越不好维护。
  >
  > 总结
  > * 前后端数据结构没有解耦，前端在应对不定的服务端数据结构前提下，需要编写过多的保护性代码，不利于维护的同时，代码健壮性也不高。
  > * 基础数据逻辑处理没有和UI视图解耦，容易阻塞视图渲染，同时，在视图组件上存在太多的基础数据逻辑处理，没有有效复用。