import store from '../store'
import setting from './config'

async function request(service, method = 'GET', data = {}, header = {
	'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
}, relogin = true) {
	let token = uni.getStorageSync('token');
	let key= "Authorization" //key的名称
	header[key] = "Bearer "+token
	var [err, res] = await uni.request({
		url: setting.base_url + service,
		method: method,
		data: {
			...data
		},
		header: header,
		timeout: 65000
	})
	return new Promise(function(resolve, reject) {
		if (err) {
			console.log(err)
			if (err.errMsg) {
				reject(err.errMsg)
			} else {
				reject('未知错误')
			}
		} else {
			if (res.data.status == 101 || res.data.status == 102) {
				// if(relogin){
				//       uni.reLaunch({
				//         url:"/pages/login/login"
				//       })
				// 	reject("请登录以继续")
				// }
				// #ifndef MP-WEIXIN
				uni.showModal({
					title: "提示",
					content: res.data.msg,
					success() {
						uni.reLaunch({
							url: "/pages/login/login"
						})
					}
				})
				// #endif

				// uni.hideLoading()
				reject("请登录以继续")
			} else if (res.data.status == 501) {

				uni.showModal({
					title: "提示",
					content: res.data.msg,
					success() {
						uni.reLaunch({
							url: "/pages/login/login"
						})
					}
				})
				reject(res.data)
			}
			resolve(res.data)
		}
	})
}

function formatTime(timeStamp) {
	var date = new Date()
	date.setTime(timeStamp * 1000)
	var y = date.getFullYear()
	var m = date.getMonth() + 1
	m = m < 10 ? ('0' + m) : m
	var d = date.getDate()
	d = d < 10 ? ('0' + d) : d
	var h = date.getHours()
	h = h < 10 ? ('0' + h) : h
	var minute = date.getMinutes()
	var second = date.getSeconds()
	minute = minute < 10 ? ('0' + minute) : minute
	second = second < 10 ? ('0' + second) : second
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
};

function checkAuth(mobile = true, auth = true) {
	if (!store.state.token) {
		uni.showModal({
			title: '提示',
			content: "尚未登录，请先登录！",
			confirmText: "去登录",
			success: (res) => {
				if (res.confirm) {
					let url = "../login/login"
					// #ifdef MP
					url = "../login/login?quickLogin=1"
					// #endif
					uni.navigateTo({
						url: url
					})
				} else {
					uni.navigateBack({
						delta: 1
					})
				}
			}
		})
		return false
	}
	if (!store.state.userInfo.mobile && mobile) {
		uni.showModal({
			title: '提示',
			content: "请先绑定手机",
			confirmText: "去绑定",
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: "../regiester/regiester?bindMob=1"
					})
				} else {
					uni.navigateBack({
						delta: 1
					})
				}
			}
		})
		return false
	}
	if (!store.state.userInfo.is_auth && store.state.config.need_auth == '1' && auth) {
		uni.showModal({
			title: '提示',
			content: "请先进行实名认证才能发布信息",
			confirmText: "去认证",
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: "/pages/auth/user_auth"
					})
				} else {
					uni.navigateBack({
						delta: 1
					})
				}
			}
		})
		return false
	} else {
		return true
	}
}

function isWeChat() {
	//window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
	var ua = window.navigator.userAgent.toLowerCase();
	//通过正则表达式匹配ua中是否含有MicroMessenger字符串
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}

function jsApiCall(data, callback_succ_func, callback_error_func) {
	uni.showLoading()
	//使用原生的，避免初始化appid问题  
	WeixinJSBridge.invoke('getBrandWCPayRequest', {
			appId: data['appId'],
			timeStamp: data['timestamp'],
			nonceStr: data['nonceStr'], // 支付签名随机串，不长于 32 位  
			package: data['package'], // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）  
			signType: data['signType'], // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'  
			paySign: data['paySign'], // 支付签名  
		},
		function(res) {
			var msg = res.err_msg ? res.err_msg : res.errMsg;
			// uni.hideLoading()
			//WeixinJSBridge.log(msg);  
			switch (msg) {
				case 'get_brand_wcpay_request:ok': //支付成功时  
					if (callback_succ_func) {
						callback_succ_func(res);
					} else {
						uni.showLoading({
							title: '支付成功，跳转中...'
						})
						setTimeout(function() {
							// uni.hideLoading()
							uni.switchTab({
								url: '/pages/tab/order'
							})
						}, 200);
					}
					break;
				default: //支付失败时  
					WeixinJSBridge.log('支付失败!' + msg + ',请返回重试.');
					if (callback_error_func) {
						callback_error_func({
							msg: msg
						});
					}
					break;
			}
		})
}

function wxJsapiPay(data, callback_succ_func, callback_error_func) {
	if (!isWeChat()) {
		return;
	}
	if (typeof WeixinJSBridge == "undefined") {
		if (document.addEventListener) {
			document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
		} else if (document.attachEvent) {
			document.attachEvent('WeixinJSBridgeReady', jsApiCall);
			document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
		}
	} else {
		jsApiCall(data, callback_succ_func, callback_error_func);
	}
}

export {
	request,
	formatTime,
	checkAuth,
	isWeChat,
	wxJsapiPay
}