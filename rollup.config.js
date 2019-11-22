import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {
    uglify
} from 'rollup-plugin-uglify';

var input = 'src/model-adapter.js';
var babelPlugin = babel({
    // is-obj 模块使用了箭头函数, 如果开启排除, plugin-uglify 会执行失败
    // exclude: 'node_modules/**'
});

export default [{
    input: input,
    output: {
        file: 'dist/model-adapter.js',
        format: 'umd',
        name: 'ModelAdapter'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        babelPlugin,
        uglify()
    ]
}/* 由于依赖的库用到了 ES2015 的语法, 如果直接使用, 会有兼容性问题, 因此暂时不使用
,{
    input: input,
    output: {
        file: 'dist/model-adapter.common.js',
        format: 'cjs'
    },
    plugins: [
        babelPlugin
    ]
}, {
    input: input,
    output: {
        file: 'dist/model-adapter.esm.js',
        format: 'esm'
    },
    plugins: [
        babelPlugin
    ]
}*/];