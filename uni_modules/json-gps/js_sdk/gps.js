// #ifdef APP-PLUS
import permision from "./wa-permission/permission.js"
// #endif
class Gps {
	constructor(arg) {
		this.lock = false //锁防止重复请求
	}
	async getLocation(param = {
		type: 'wgs84'
	}) {
		return new Promise(async (callback) => {
			if (this.lock) {
				// console.log('已锁，已有另一个请求正在执行。无需重复请求');
				callback(false);
				return false
			}
			this.lock = true //加锁防止重复的请求
			uni.getLocation({
				...param,
				success: res => {
					this.lock = false //成功后解锁
					//console.log(res);
					callback(res)
				},
				fail: async (err) => {
					uni.showToast({
						title: '定位获取失败',
						icon: 'none'
					});
					console.error(err)
					callback(false)
					
					// #ifdef APP-PLUS
					await this.checkGpsIsOpen()
					// #endif
					
					// #ifdef MP-WEIXIN
					if (err.errMsg == 'getLocation:fail auth deny') {
						uni.showModal({
							content: '应用无定位权限',
							confirmText: '前往设置',
							complete: (e) => {
								if (e.confirm) {
									uni.openSetting({
										success(res) {
											console.log(res.authSetting)
										}
									});
								}
								this.lock = false //解锁让回到界面重新获取
							}
						});
					}
					if (err.errMsg == 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF') {
						uni.showModal({
							content: '未开启定位权限，请前往手机系统设置中开启',
							showCancel: false,
							confirmText:"知道了"
						});
					}
					// #endif
				}
			});
		})
	}
	// #ifdef APP-PLUS
	async checkGpsIsOpen() {
		this.lock = true //加锁防止重复的请求
		// console.log('检查定位设置开启问题', permision.checkSystemEnableLocation());
		if (!permision.checkSystemEnableLocation()) {
			plus.nativeUI.confirm("手机定位权限没有开启，是否去开启？", (e) => {
				this.lock = false
				if (e.index == 0) {
					if (uni.getSystemInfoSync().platform == "ios") {
						plus.runtime.openURL("app-settings://");
					} else {
						var main = plus.android.runtimeMainActivity(); //获取activity
						var Intent = plus.android.importClass('android.content.Intent');
						var Settings = plus.android.importClass('android.provider.Settings');
						var intent = new Intent(Settings
						.ACTION_LOCATION_SOURCE_SETTINGS); //可设置表中所有Action字段  
						main.startActivity(intent);
					}
				} else {
					uni.showToast({
						title: '设备无定位权限',
						icon: 'none'
					});
					callback(false)
				}
			}, {
				"buttons": ["去设置", "不开启"],
				"verticalAlign": "center"
			});
			return false
		}
		let checkAppGpsRes = await this.checkAppGps()
		// console.log(checkAppGpsRes, 'checkAppGpsRes');
		if (!checkAppGpsRes) {
			plus.nativeUI.confirm("应用定位权限没有开启，是否去开启？", (e) => {
				this.lock = false
				if (e.index == 0) {
					permision.gotoAppPermissionSetting()
					callback(false)
				} else {
					uni.showToast({
						title: '应用无定位权限',
						icon: 'none'
					});
					return false
				}
			}, {
				"buttons": ["去设置", "不开启"],
				"verticalAlign": "center"
			});
		} else {
			this.lock = false
		}
	}
	async checkAppGps() {
		if (uni.getSystemInfoSync().platform == "ios" && !permision.judgeIosPermission("location")) {
			return false
		}
		if (uni.getSystemInfoSync().platform != "ios" && await permision.requestAndroidPermission(
				"android.permission.ACCESS_FINE_LOCATION") != 1) {
			return false
		}
		return true
	}
	// #endif
}
export default Gps
