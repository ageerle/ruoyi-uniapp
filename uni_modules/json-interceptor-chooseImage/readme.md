拦截器顾名思义，是在框架方法执行的各个环节（包含：拦截前触发、成功回调拦截、失败回调拦截、完成回调拦截）
插入逻辑，篡改参数或终止运行。
#### 优势
- 这种方式相当于改写了api的内部逻辑，相比语法糖他更加直观，不影响ide的代码提示。
- 将常规固定的逻辑封装到框架的api内，且支持个性化设计。如你可以在本插件路径:`/uni_modules/json-interceptor-chooseImage/js_sdk/main.js`修改弹出框元素，绘制更漂亮的样式和文字说明。

#### 使用示例，App.vue页代码如下：
```
<script>
// #ifdef APP-PLUS
import interceptorChooseImage from '@/uni_modules/json-interceptor-chooseImage/js_sdk/main.js';
// #endif
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// #ifdef APP-PLUS
			interceptorChooseImage()
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>
```

> 跳转到**应用**的权限页面 参考来源：[https://ext.dcloud.net.cn/plugin?id=594](https://ext.dcloud.net.cn/plugin?id=594) 感谢作者@DCloud_heavensoft 
