### 插件简介：
支持在onShow生命周期，使用的集成权限判断和引导开启（包括设备权限和应用权限）的地理位置获取方法

### 插件背景：
实现获取用户地理位置，当手机未开启定位模块或应用无定位权限时，引导用户前往手机系统或应用权限设置页面。设置完回到应用界面自动重新获取。
为了实现该效果，开发者把获取定位权限放在onShow生命周期，然而即使是原生开发，调用判断设备权限操作也会触发onShow生命周期，直接使用会导致死循环。因此本插件，二次封装用锁的方式控制该问题。

### 使用方式
```js
import Gps from '@/uni_modules/json-gps/js_sdk/gps.js';
const gps = new Gps()
export default {
	async onShow() {
		uni.showLoading({
			title:"获取定位中"
		});
		let location = await gps.getLocation()
		console.log(location);
		if(location){
			uni.showToast({
				title: JSON.stringify(location),
				icon: 'none'
			});
		}
		uni.hideLoading()
	}
}
```

>本插件基于第三方插件：[App权限判断和提示](https://ext.dcloud.net.cn/plugin?id=594)二次封装而成