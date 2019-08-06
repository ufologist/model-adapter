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

## 初衷

在 `Vue` 或者其他视图层框架中, 如果直接使用如下插值表达式, 当嵌套对象(通常是后端返回的数据)中的某一层级为空时就会报错 `TypeError: Cannot read property 'xxx' of undefined`, **造成整个组件都无法渲染**.

```javascript
{{a.aa.aaa}}
```

为了解决这种问题, 让前端的视图层能够容错增强代码的健壮性, 我们可能要写出如糖葫芦一般的防御性代码, 例如这样 `{{a && a.aa && a.aa.aaa}}`, 要是再多嵌套几层, 简直不忍直视啊.

舒服一些的处理方式是通过 `object path get` 之类的库事先处理好数据, 形成前端的视图层模型, 尽量避免嵌套数据, 再到视图层中使用, 例如

```javascript
// {{aaa}}
var vm = {
    aaa: _.get('a.aa.aaa')
};
```

## 示例

### 简单

```javascript
import ModelAdapter from 'model-adapter';

// 这里示例由后端接口返回的数据
var ajaxData = {
    a: 1,
    b: '2',
    c: {
        cc: {
            ccc: 'ccc'
        }
    }
};

var model = new ModelAdapter({
    a: 'a',
    b: 'b',
    ccc: 'c.cc.ccc'
}, ajaxData);

console.log(model.a);
console.log(model.b);
console.log(model.ccc);
```

### 随时适配数据

```javascript
model.$adapt(source);
```

### 还原数据

```javascript
var source = model.$restore();
```

## API 文档



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