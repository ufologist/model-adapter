# 如何让 `Vue` 为 `data` 上新增的属性创建 `getter/setter` 监听?

例如一开始 `data` 为

```javascript
{
    foo: {
        a: 'a'
    }
}
```

如果我后续操作 `foo.b = 'b'` 新增了 `b` 属性, 那么 `b` 属性肯定是非响应式的. 如果在视图上绑定 `b` 属性, 会发现修改 `b` 属性无法更新视图.

那么如何才能让 `foo.b` 获得 `getter/setter` 以享受到 Vue 的 [reactive 机制](https://cn.vuejs.org/v2/guide/reactivity.html)呢?

PS: 这个 `b` 属性只是示例, 可能有 N 多未知的属性需要添加, 所以使用 `$set` 方法的场景不适用.

* [重新问题的 demo](https://raw.githack.com/ufologist/model-adapter/master/test/vue-dynamic-add-property-problem.html)
* [解决问题的 demo](https://raw.githack.com/ufologist/model-adapter/master/test/vue-dynamic-add-property-solution.html)

## 解决办法: 复制出一个新的对象再赋值回去

注意如果只是 `var foo = this.foo` 来复制引用不行的

需要先新建对象复制原有的属性, 再添加属性, 最后再赋值回 `data` 上
1. 复制

   ```javascript
   var foo = Object.assign({}, this.foo);
   ```
2. 添加属性

   ```javascript
   foo.b = 'b';
   ```
3. 赋值回去

   ```javascript
   this.foo = foo;
   ```

可以将复制和添加属性合并为一步, 即
```javascript
var foo = Object.assign({}, this.foo, {
    b: 'b'
});
this.foo = foo;
```

最终可以精简为一步
```javascript
this.foo = Object.assign({}, this.foo, {
    b: 'b'
});
```