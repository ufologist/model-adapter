# CHANGELOG

* v0.0.1 2019-8-8

  * 初始版本
  
  ## 如何选择一个合适的 `object path get` 库
  * 需要有哪些必备功能
    * object/array path get
    * object path set
    * 尽可能少的依赖和新特性
  * 首选
    * https://github.com/sindresorhus/dot-prop 轻量无依赖
  * 备选
    * https://github.com/mariocasciaro/object-path 功能和 `dot-prop` 类似, 但多年未更新
    * [get-value](https://github.com/jonschlinkert/get-value) [set-value](https://github.com/jonschlinkert/set-value) 代码量稍多
    * [lodash.get](https://github.com/lodash/lodash/) [lodash.set](https://github.com/lodash/lodash/) 代码量较多
  * 不合适
    * https://github.com/azer/get-object-path 没有 set 机制
    * https://github.com/queicherius/fast-get 没有 set 机制
    * [object-at](https://github.com/gearcase/object-at) [object-set](https://github.com/gearcase/object-set) 依赖较多, 多年未更新