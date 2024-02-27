export default function(){
	//当应用无访问摄像头/相册权限，引导跳到设置界面
	uni.addInterceptor('chooseImage', {
		fail(e) { // 失败回调拦截 更多拦截器用法 [详情](https://uniapp.dcloud.io/api/interceptor?id=addinterceptor)
			console.log(e);
			if (uni.getSystemInfoSync().platform == "android" && e.errMsg == 'chooseImage:fail No Permission') {
				if (e.code === 11) {
					uni.showModal({
						title: "无法访问摄像头",
						content: "当前无摄像头访问权限，建议前往设置",
						confirmText: "前往设置",
						success(e) {
							if (e.confirm) {
								gotoAppPermissionSetting()
							}
						}
					});
				} else {
					uni.showModal({
						title: "无法访问相册",
						content: "当前无系统相册访问权限，建议前往设置",
						confirmText: "前往设置",
						success(e) {
							if (e.confirm) {
								gotoAppPermissionSetting()
							}
						}
					});
				}
			} else if (e.errCode === 2&&e.errMsg == "chooseImage:fail No filming permission") {
				console.log('e.errMsg === 2  ios无法拍照权限 ');
				// 注：e.errCode === 8 ios无从相册选择图片的权限 api已内置无需自己用拦截器实现
				uni.showModal({
					title: "无法访问摄像头",
					content: "当前无摄像头访问权限，建议前往设置",
					confirmText: "前往设置",
					success(e) {
						if (e.confirm) {
							gotoAppPermissionSetting()
						}
					}
				});
			}
		}
	})
	
	//跳转到**应用**的权限页面 参考来源：https://ext.dcloud.net.cn/plugin?id=594
	function gotoAppPermissionSetting() {
		if (uni.getSystemInfoSync().platform == "ios") {
			var UIApplication = plus.ios.import("UIApplication");
			var application2 = UIApplication.sharedApplication();
			var NSURL2 = plus.ios.import("NSURL");
			var setting2 = NSURL2.URLWithString("app-settings:");
			application2.openURL(setting2);
			plus.ios.deleteObject(setting2);
			plus.ios.deleteObject(NSURL2);
			plus.ios.deleteObject(application2);
		} else {
			var Intent = plus.android.importClass("android.content.Intent");
			var Settings = plus.android.importClass("android.provider.Settings");
			var Uri = plus.android.importClass("android.net.Uri");
			var mainActivity = plus.android.runtimeMainActivity();
			var intent = new Intent();
			intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
			var uri = Uri.fromParts("package", mainActivity.getPackageName(), null);
			intent.setData(uri);
			mainActivity.startActivity(intent);
		}
	}
}