/**
 * uni-pay-co 统一支付服务实现
 */

const crypto = require("crypto");

const uniPay = require("uni-pay");

const configCenter = require("uni-config-center");

const config = configCenter({ pluginId: 'uni-pay' }).requireFile('config.js');

const dao = require('../dao');

const libs = require('../libs');

const { UniCloudError, isUniPayError, ERROR } = require('../common/error')

const db = uniCloud.database();
const _ = db.command;

const notifyPath = "/payNotify/";

class service {
	constructor(obj) {

	}

	/**
	 * 获取支付插件的完整配置
	 */
	getConfig() {
		return config;
	}
	/**
	 * 支付成功 - 异步通知
	 */
	async paymentNotify(data = {}) {
		let {
			httpInfo,
			clientInfo,
			cloudInfo
		} = data;
		let path = httpInfo.path;
		let pay_type = path.substring(notifyPath.length);
		let provider = pay_type.split("-")[0]; // 获取支付供应商
		let provider_pay_type = pay_type.split("-")[1]; // 获取支付方式
		let original_data = libs.common.getNotifyData({ httpInfo, provider }); // 获取原始回调数据
		// 初始化uniPayInstance
		let uniPayInstance = await this.initUniPayInstance({ provider, provider_pay_type });
		let notifyType = await uniPayInstance.checkNotifyType(httpInfo);
		if (notifyType !== "payment") {
			// 由于支付宝部分退款会触发支付成功的回调，但同时签名验证是算未通过的，为了避免支付宝重复推送，这里可以直接返回成功告知支付宝服务器，不用再推送过来了。
			return libs.common.returnNotifySUCCESS({ provider, provider_pay_type });
		}
		let verifyResult = await uniPayInstance.verifyPaymentNotify(httpInfo);
		if (!verifyResult) {
			console.log('---------!签名验证未通过!---------');
			console.log('---------!签名验证未通过!---------');
			console.log('---------!签名验证未通过!---------');
			return {}
		}
		console.log('---------!签名验证通过!---------');
		verifyResult = JSON.parse(JSON.stringify(verifyResult)); // 这一句代码有用，请勿删除。
		let {
			outTradeNo,
			totalFee,
			transactionId,
			resultCode, // 微信支付v2和支付宝支付判断成功的字段
			openid,
			appId,
			tradeState, // 微信支付v3判断支付成功的字段
		} = verifyResult;
		//console.log('verifyResult: ', verifyResult)

		if (resultCode == "SUCCESS" || tradeState === "SUCCESS") {
			let time = Date.now();
			let payOrderInfo = await dao.uniPayOrders.updateAndReturn({
				whereJson: {
					status: 0, // status:0 为必须条件，防止重复推送时的错误
					out_trade_no: outTradeNo, // 商户订单号
				},
				dataJson: {
					status: 1, // 设置为已付款
					transaction_id: transactionId, // 第三方支付单号
					pay_date: time,
					notify_date: time,
					openid,
					original_data,
				}
			});
			//console.log('payOrderInfo: ', payOrderInfo)
			if (payOrderInfo) {
				// 只有首次推送才执行用户自己的逻辑处理。
				// 用户自己的逻辑处理 开始-----------------------------------------------------------
				let userOrderSuccess = false;
				let orderPaySuccess;
				try {
					// 加载自定义异步回调函数
					orderPaySuccess = require(`../notify/${payOrderInfo.type}`);
				} catch (err) {
					console.log(err);
				}
				if (typeof orderPaySuccess === "function") {
					console.log('用户自己的回调逻辑 - 开始执行');
					userOrderSuccess = await orderPaySuccess({
						verifyResult,
						data: payOrderInfo,
						clientInfo,
						cloudInfo
					});
					console.log('用户自己的回调逻辑 - 执行完成');
				}
				console.log('userOrderSuccess', userOrderSuccess);
				// 用户自己的逻辑处理 结束-----------------------------------------------------------

				await dao.uniPayOrders.updateAndReturn({
					whereJson: {
						status: 1,
						out_trade_no: outTradeNo,
					},
					dataJson: {
						user_order_success: userOrderSuccess,
					}
				});

			} else {
				console.log('---------！注意：本次回调非首次回调，已被插件拦截，插件不会执行你的回调函数！---------');
				console.log('---------！注意：本次回调非首次回调，已被插件拦截，插件不会执行你的回调函数！---------');
				console.log('---------！注意：本次回调非首次回调，已被插件拦截，插件不会执行你的回调函数！---------');
				console.log('verifyResult:', verifyResult);
			}
		} else {
			console.log('verifyResult:', verifyResult);
		}

		return libs.common.returnNotifySUCCESS({ provider, provider_pay_type });
	}

	/**
	 * 统一支付 - 创建支付订单
	 */
	async createOrder(data = {}) {
		let {
			provider, // 支付供应商
			total_fee, // 支付金额
			user_id, // 用户user_id（统计需要）
			openid, // 用户openid
			order_no, // 订单号
			out_trade_no, // 支付插件订单号
			description, // 订单描述
			type, // 回调类型
			qr_code, // 是否强制使用扫码支付
			clientInfo, // 客户端信息
			cloudInfo, // 云端信息

			custom, // 自定义参数（不会发送给第三方支付服务器）
			other, // 其他请求参数（会发送给第三方支付服务器）
		} = data;
		let subject = description;
		let body = description;
		if (!out_trade_no) out_trade_no = libs.common.createOrderNo();
		if (!order_no || typeof order_no !== "string") {
			throw { errCode: ERROR[51003] };
		}
		if (!type || typeof type !== "string") {
			throw { errCode: ERROR[51004] };
		}
		if (typeof total_fee !== "number" || total_fee <= 0 || total_fee % 1 !== 0) {
			throw { errCode: ERROR[51005] };
		}
		if (!description || typeof description !== "string") {
			throw { errCode: ERROR[51006] };
		}
		if (!provider || typeof provider !== "string") {
			throw { errCode: ERROR[51007] };
		}
		if (!clientInfo) {
			throw { errCode: ERROR[51008] };
		}
		if (!cloudInfo) {
			throw { errCode: ERROR[51009] };
		}
		let res = { errCode: 0, errMsg: 'ok', order_no, out_trade_no, provider };

		let {
			clientIP: client_ip,
			userAgent: ua,
			appId: appid,
			deviceId: device_id,
			platform
		} = clientInfo;
		let {
			spaceId, // 服务空间ID
		} = cloudInfo;
		let {
			notifyUrl = {}
		} = config;
		// 业务逻辑开始-----------------------------------------------------------
		// 以下代码是为了兼容公测版迁移到正式版的空间
		let notifySpaceId = spaceId;
		if (!notifyUrl[notifySpaceId]) {
			if (notifySpaceId.indexOf("mp-") === 0) {
				notifySpaceId = notifySpaceId.substring(3);
			} else {
				notifySpaceId = `mp-${notifySpaceId}`
			}
		}
		// 以上代码是为了兼容公测版迁移到正式版的空间
		let currentNotifyUrl = notifyUrl[notifySpaceId] || notifyUrl["default"]; // 异步回调地址
		if (!currentNotifyUrl || currentNotifyUrl.indexOf("http") !== 0) {
			throw { errCode: ERROR[52002] };
		}
		platform = libs.common.getPlatform(platform);
		// 如果需要二维码支付模式，则清空下openid
		if (qr_code) {
			openid = undefined;
			res.qr_code = qr_code;
		}
		// 获取并自动匹配支付供应商的支付类型
		let provider_pay_type = libs.common.getProviderPayType({
			platform,
			provider,
			ua,
			qr_code
		});
		res.provider_pay_type = provider_pay_type;
		// 拼接实际异步回调地址
		let finalNotifyUrl = `${currentNotifyUrl}${notifyPath}${provider}-${provider_pay_type}`;

		// 获取uniPay交易类型
		let tradeType = libs.common.getTradeType({ provider, provider_pay_type });

		let uniPayConifg = await this.getUniPayConfig({ provider, provider_pay_type });
		// 初始化uniPayInstance
		let uniPayInstance = await this.initUniPayInstance({ provider, provider_pay_type });

		// 获取支付信息
		let getOrderInfoParam = {
			openid: openid,
			subject: subject,
			body: body,
			outTradeNo: out_trade_no,
			totalFee: total_fee,
			notifyUrl: finalNotifyUrl,
			tradeType: tradeType
		};
		if (provider === "wxpay" && provider_pay_type === "mweb") {
			getOrderInfoParam.spbillCreateIp = client_ip;
			if (uniPayConifg.version !== 3) {
				// v2版本
				getOrderInfoParam.sceneInfo = uniPayConifg.sceneInfo;
			} else {
				// v3版本特殊处理
				getOrderInfoParam.sceneInfo = JSON.parse(JSON.stringify(uniPayConifg.sceneInfo));
				if (getOrderInfoParam.sceneInfo.h5_info.wap_url) {
					getOrderInfoParam.sceneInfo.h5_info.app_url = getOrderInfoParam.sceneInfo.h5_info.wap_url;
					delete getOrderInfoParam.sceneInfo.h5_info.wap_url;
				}
				if (getOrderInfoParam.sceneInfo.h5_info.wap_name) {
					getOrderInfoParam.sceneInfo.h5_info.app_name = getOrderInfoParam.sceneInfo.h5_info.wap_name;
					delete getOrderInfoParam.sceneInfo.h5_info.wap_name;
				}
			}
		}
		try {
			// 如果是苹果内购，不需要执行uniPayInstance.getOrderInfo等操作
			if (provider !== "appleiap") {
				// 第三方支付服务器返回的订单信息
				let orderInfo;
				if (other) {
					// other 内的键名转驼峰
					other = libs.common.snake2camelJson(other);
					getOrderInfoParam = Object.assign(getOrderInfoParam, other);
				}
				getOrderInfoParam = JSON.parse(JSON.stringify(getOrderInfoParam)); // 此为去除undefined的参数
				orderInfo = await uniPayInstance.getOrderInfo(getOrderInfoParam);
				if (qr_code && orderInfo.codeUrl) {
					res.qr_code_image = await libs.qrcode.toDataURL(orderInfo.codeUrl, {
						type: "image/png",
						width: 200,
						margin: 1,
						scale: 1,
						color: {
							dark: "#000000",
							light: "#ffffff",
						},
						errorCorrectionLevel: "Q",
						quality: 1
					});
				}
				// 支付宝支付参数特殊处理
				if (provider === "alipay") {
					if (typeof orderInfo === "object" && orderInfo.code && orderInfo.code !== "10000") {
						res.errCode = orderInfo.code;
						res.errMsg = orderInfo.subMsg;
					}
				}
				res.order = orderInfo;
			}
		} catch (err) {
			let errMsg = err.errorMessage || err.message;
			console.error("data: ", data);
			console.error("getOrderInfoParam: ", getOrderInfoParam);
			console.error("err: ", err);
			console.error("errMsg: ", errMsg);
			throw { errCode: ERROR[53001], errMsg };
		}
		// 尝试获取下订单信息
		let payOrderInfo = await dao.uniPayOrders.find({
			order_no,
			out_trade_no
		});
		let create_date = Date.now();
		// 如果订单不存在，则添加
		if (!payOrderInfo) {
			// 添加数据库(数据库的out_trade_no字段需设置为唯一索引)
			let stat_platform = clientInfo.platform;
			if (stat_platform === "app") {
				stat_platform = clientInfo.os;
			}
			let nickname;
			if (user_id) {
				// 获取nickname（冗余昵称）
				let userInfo = await dao.uniIdUsers.findById(user_id);
				if (userInfo) nickname = userInfo.nickname;
			}
			await dao.uniPayOrders.add({
				provider,
				provider_pay_type,
				uni_platform: platform,
				status: 0,
				type,
				order_no,
				out_trade_no,
				user_id,
				nickname,
				device_id,
				client_ip,
				openid,
				description,
				total_fee,
				refund_fee: 0,
				refund_count: 0,
				provider_appid: uniPayConifg.appId,
				appid,
				custom,
				create_date,
				stat_data: {
					platform: stat_platform,
					app_version: clientInfo.appVersion,
					app_version_code: clientInfo.appVersionCode,
					app_wgt_version: clientInfo.appWgtVersion,
					os: clientInfo.os,
					ua: clientInfo.ua,
					channel: clientInfo.channel ? clientInfo.channel : String(clientInfo.scene),
					scene: clientInfo.scene
				}
			});
		} else {
			// 如果订单已经存在，则修改下支付方式（用户可能先点微信支付，未付款，又点了支付宝支付）
			await dao.uniPayOrders.updateById(payOrderInfo._id, {
				provider,
				provider_pay_type,
			});
		}
		// 自动删除3天前的订单（未付款订单）
		// await dao.uniPayOrders.deleteExpPayOrders();
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
	/**
	 * 统一支付结果查询
	 * @description 根据商户订单号或者平台订单号查询订单信息，主要用于未接收到支付通知时可以使用此接口进行支付结果验证
	 */
	async getOrder(data = {}) {
		let {
			out_trade_no, // 支付插件订单号
			transaction_id, // 支付平台的交易单号
			await_notify = false, // 是否需要等待异步通知执行完成才返回前端支付结果
		} = data;
		let res = { errCode: 0, errMsg: 'ok' };
		// 业务逻辑开始-----------------------------------------------------------
		if (!out_trade_no && !transaction_id) {
			throw { errCode: ERROR[51010] };
		}
		let payOrderInfo;
		if (transaction_id) {
			payOrderInfo = await dao.uniPayOrders.find({
				transaction_id
			});
		} else if (out_trade_no) {
			payOrderInfo = await dao.uniPayOrders.find({
				out_trade_no
			});
		} 
		if (!payOrderInfo) {
			throw { errCode: ERROR[52001] };
		}
		// 初始化uniPayInstance
		let uniPayInstance = await this.initUniPayInstance(payOrderInfo);
		let orderQueryJson = {};
		if (out_trade_no) {
			orderQueryJson.outTradeNo = out_trade_no;
		} else {
			orderQueryJson.transactionId = transaction_id;
		}
		let queryRes = await uniPayInstance.orderQuery(orderQueryJson);
		if (queryRes.tradeState === 'SUCCESS' || queryRes.tradeState === 'FINISHED') {
			if (typeof payOrderInfo.user_order_success == "undefined" && await_notify) {
				let whileTime = 0; // 当前循环已执行的时间（毫秒）
				let whileInterval = 500; // 每次循环间隔时间（毫秒）
				let maxTime = 5000; // 循环执行时间超过此值则退出循环（毫秒）
				while (typeof payOrderInfo.user_order_success == "undefined" && whileTime <= maxTime) {
					await libs.common.sleep(whileInterval);
					whileTime += whileInterval;
					payOrderInfo = await dao.uniPayOrders.find({
						out_trade_no
					});
				}
			}
			res = {
				errCode: 0,
				errMsg: "ok",
				has_paid: true, // 标记用户是否已付款成功（此参数只能表示用户确实付款了，但系统的异步回调逻辑可能还未执行完成）
				out_trade_no, // 支付插件订单号
				transaction_id, // 支付平台订单号
				status: payOrderInfo.status, // 标记当前支付订单状态 -1：已关闭 0：未支付 1：已支付 2：已部分退款 3：已全额退款
				user_order_success: payOrderInfo.user_order_success, // 用户异步通知逻辑是否全部执行完成，且无异常（建议前端通过此参数是否为true来判断是否支付成功）
				pay_order: payOrderInfo,
			}
		} else {
			let errMsg = queryRes.tradeStateDesc || "未支付或已退款";
			if (errMsg.indexOf("订单发生过退款") > -1) {
				errMsg = "订单已退款";
			}
			res = {
				errCode: -1,
				errMsg: errMsg,
				has_paid: false,
				out_trade_no, // 支付插件订单号
				transaction_id, // 支付平台订单号
			}
		}
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

	/**
	 * 统一退款
	 * @description 当交易发生之后一段时间内，由于买家或者卖家的原因需要退款时，卖家可以通过退款接口将支付款退还给买家。
	 */
	async refund(data = {}) {
		let {
			out_trade_no, // 插件支付单号
			out_refund_no, // 退款单号（若不传，则自动生成）
			refund_desc = "用户申请退款",
			refund_fee: myRefundFee,
			refund_fee_type = "CNY"
		} = data;

		let res = { errCode: 0, errMsg: 'ok' };
		// 业务逻辑开始-----------------------------------------------------------
		if (!out_trade_no) {
			throw { errCode: ERROR[51001] };
		}
		let payOrderInfo = await dao.uniPayOrders.find({
			out_trade_no
		});
		if (!payOrderInfo) {
			throw { errCode: ERROR[52001] };
		}
		let refund_count = payOrderInfo.refund_count || 0;
		refund_count++;
		// 生成退款订单号
		let outRefundNo = out_refund_no ? out_refund_no : `${out_trade_no}-${refund_count}`;
		// 订单总金额
		let totalFee = payOrderInfo.total_fee;
		// 退款总金额
		let refundFee = myRefundFee || totalFee;
		let provider = payOrderInfo.provider;
		let uniPayConifg = await this.getUniPayConfig(payOrderInfo);
		let uniPayInstance = await this.initUniPayInstance(payOrderInfo);

		console.log(`---- ${out_trade_no} -- ${outRefundNo} -- ${totalFee/100} -- ${refundFee/100}`)
		// 退款操作
		try {
			res.result = await uniPayInstance.refund({
				outTradeNo: out_trade_no,
				outRefundNo,
				totalFee,
				refundFee,
				refundDesc: refund_desc,
				refundFeeType: refund_fee_type
			});
		} catch (err) {
			console.error(err);
			let errMsg = err.message;
			if (errMsg && errMsg.indexOf("verify failure") > -1) {
				throw { errCode: ERROR[53005] };
			}
			return { errCode: -1, errMsg: errMsg, err }
		}
		if (res.result.refundFee) {
			res.errCode = 0;
			res.errMsg = "ok";
			// 修改数据库
			try {
				// 修改订单状态
				payOrderInfo = await dao.uniPayOrders.updateAndReturn({
					whereJson: {
						_id: payOrderInfo._id
					},
					dataJson: {
						status: 2,
						refund_fee: _.inc(refundFee),
						refund_count: refund_count,
						// 记录每次的退款详情
						refund_list: _.unshift({
							refund_date: Date.now(),
							refund_fee: refundFee,
							out_refund_no: outRefundNo,
							refund_desc
						})
					}
				});
				if (payOrderInfo && payOrderInfo.refund_fee >= payOrderInfo.total_fee) {
					// 修改订单状态为已全额退款
					await dao.uniPayOrders.updateById(payOrderInfo._id, {
						status: 3,
						refund_fee: payOrderInfo.total_fee,
					});
				}

			} catch (err) {
				console.error(err);
			}
		} else {
			throw { errCode: ERROR[53002] };
		}
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}

	/**
	 * 查询退款（查询退款情况）
	 * @description 提交退款申请后，通过调用该接口查询退款状态。
	 */
	async getRefund(data = {}) {
		let {
			out_trade_no, // 插件支付单号
		} = data;
		if (!out_trade_no) {
			throw { errCode: ERROR[51001] };
		}
		let payOrderInfo = await dao.uniPayOrders.find({
			out_trade_no
		});
		if (!payOrderInfo) {
			throw { errCode: ERROR[52001] };
		}
		let provider = payOrderInfo.provider;
		let uniPayInstance = await this.initUniPayInstance(payOrderInfo);
		let queryRes;
		try {
			let refundQueryJson = {
				outTradeNo: out_trade_no,
				outRefundNo: payOrderInfo.refund_list[0].out_refund_no
			};
			queryRes = await uniPayInstance.refundQuery(refundQueryJson);
		} catch (err) {
			throw { errCode: ERROR[53003], errMsg: err.errMsg };
		}
		let orderInfo = {
			total_fee: payOrderInfo.total_fee,
			refund_fee: payOrderInfo.refund_fee,
			refund_count: payOrderInfo.refund_count,
			refund_list: payOrderInfo.refund_list,
			provider: payOrderInfo.provider,
			provider_pay_type: payOrderInfo.provider_pay_type,
			status: payOrderInfo.status,
			type: payOrderInfo.type,
			out_trade_no: payOrderInfo.out_trade_no,
			transaction_id: payOrderInfo.transaction_id,
		};
		if (queryRes.refundFee > 0) {
			let msg = "ok";
			if (payOrderInfo.refund_list && payOrderInfo.refund_list.length > 0) {
				msg = `合计退款 ${payOrderInfo.refund_fee/100}\r\n`;
				for (let i in payOrderInfo.refund_list) {
					let item = payOrderInfo.refund_list[i];
					let index = Number(i) + 1;
					let timeStr = libs.common.timeFormat(item.refund_date, "yyyy-MM-dd hh:mm:ss");
					msg += `${index}、 ${timeStr} \r\n退款 ${item.refund_fee/100} \r\n`;
				}
			}
			return {
				errCode: 0,
				errMsg: msg,
				pay_order: orderInfo,
				result: queryRes
			}
		} else {
			throw { errCode: ERROR[53003] };
		}
	}

	/**
	 * 关闭订单
	 * @description 用于交易创建后，用户在一定时间内未进行支付，可调用该接口直接将未付款的交易进行关闭，避免重复支付。
	 * 注意
	 * 微信支付：订单生成后不能马上调用关单接口，最短调用时间间隔为 5 分钟。
	 */
	async closeOrder(data = {}) {
		let {
			out_trade_no, // 插件支付单号
		} = data;
		if (!out_trade_no) {
			throw { errCode: ERROR[51001] };
		}
		let payOrderInfo = await dao.uniPayOrders.find({
			out_trade_no
		});
		if (!payOrderInfo) {
			throw { errCode: ERROR[52001] };
		}
		let { provider } = payOrderInfo;
		let uniPayInstance = await this.initUniPayInstance(payOrderInfo);
		let closeOrderRes = await uniPayInstance.closeOrder({
			outTradeNo: out_trade_no
		});
		if ((provider === "wxpay" && closeOrderRes.resultCode === "SUCCESS") || (provider === "alipay" && closeOrderRes.code ===
				"10000")) {
			// 修改订单状态为已取消
			await dao.uniPayOrders.update({
				whereJson: {
					_id: payOrderInfo._id,
					status: 0
				},
				dataJson: {
					status: -1,
					cancel_date: Date.now()
				}
			});
			return {
				errCode: 0,
				errMsg: "订单关闭成功",
				result: closeOrderRes
			}
		} else {
			throw { errCode: ERROR[53004] };
		}
	}

	/**
	 * 根据code获取openid
	 */
	async getOpenid(data = {}) {
		let {
			provider, // 支付供应商
			code, // 用户登录获取的code
			clientInfo, // 客户端环境
		} = data;
		if (!code) {
			throw { errCode: ERROR[51002] };
		}
		let { platform, ua } = clientInfo;
		// 获取并自动匹配支付供应商的支付类型
		let provider_pay_type = libs.common.getProviderPayType({
			provider,
			platform,
			ua
		});
		let uniPayConifg = await this.getUniPayConfig({ provider, provider_pay_type });
		if (provider === "wxpay") {
			return await libs.wxpay.getOpenid({
				config: uniPayConifg,
				code,
				provider_pay_type,
			});
		} else if (provider === "alipay") {
			return await libs.alipay.getOpenid({
				config: uniPayConifg,
				code,
			});
		}
	}


	/**
	 * 获取支持的支付方式
	 * let payTypes = await service.pay.getPayProviderFromCloud();
	 */
	async getPayProviderFromCloud() {
		let wxpay = config.wxpay && config.wxpay.enable ? true : false;
		let alipay = config.alipay && config.alipay.enable ? true : false;
		let provider = [];
		if (wxpay) provider.push("wxpay");
		if (alipay) provider.push("alipay");
		return {
			errCode: 0,
			errMsg: "ok",
			wxpay,
			alipay,
			provider
		};
	}

	/**
	 * 验证iosIap苹果内购支付凭据
	 * let payTypes = await service.pay.verifyReceiptFromAppleiap();
	 */
	async verifyReceiptFromAppleiap(data) {
		let {
			out_trade_no,
			transaction_receipt,
			transaction_identifier,
		} = data;
		if (!out_trade_no) {
			throw { errCode: ERROR[51001] };
		}
		// 初始化uniPayInstance
		let uniPayInstance = await this.initUniPayInstance({ provider: "appleiap", provider_pay_type: "app" });
		let verifyReceiptRes = await uniPayInstance.verifyReceipt({
			receiptData: transaction_receipt
		});
		let transaction_id;
		let userOrderSuccess = false;
		let pay_date;
		if (verifyReceiptRes.tradeState !== "SUCCESS") {
			return {
				errCode: -1,
				errMsg: "未支付"
			};
		}
		// 支付成功
		pay_date = verifyReceiptRes.receipt.receipt_creation_date_ms;
		let inApp = verifyReceiptRes.receipt.in_app[0];
		let quantity = inApp.quantity; // 购买数量
		let product_id = inApp.product_id; // 对应的内购产品id
		transaction_id = inApp.transaction_id; // 本次交易id
		if (transaction_identifier !== transaction_id) {
			// 校验不通过
			return {
				errCode: -1,
				errMsg: "ios内购凭据校验不通过"
			};
		}
		if ((Date.now() - 1000 * 3600 * 24) > pay_date) {
			// 订单已超24小时，不做处理，通知前端直接关闭订单。
			return {
				errCode: 0,
				errMsg: "ok"
			};
		}
		// 查询该transaction_id是否使用过，如果已使用，则不做处理，通知前端直接关闭订单。
		let findOrderInfo = await dao.uniPayOrders.find({
			transaction_id,
		});
		if (findOrderInfo) {
			return {
				errCode: 0,
				errMsg: "ok"
			};
		}
		// 否则，执行用户回调
		// 用户自己的逻辑处理 开始-----------------------------------------------------------
		let orderPaySuccess;
		let payOrderInfo;
		try {
			// 加载自定义异步回调函数
			orderPaySuccess = require(`../notify/appleiap`);
		} catch (err) {
			console.log(err);
		}
		if (typeof orderPaySuccess === "function") {
			payOrderInfo = await dao.uniPayOrders.updateAndReturn({
				whereJson: {
					status: 0, // status:0 为必须条件，防止重复推送时的错误
					out_trade_no: out_trade_no, // 商户订单号
				},
				dataJson: {
					status: 1, // 设置为已付款
					transaction_id: transaction_id, // 第三方支付单号
					pay_date: pay_date,
					notify_date: pay_date,
					original_data: verifyReceiptRes
				}
			});
			console.log('用户自己的回调逻辑 - 开始执行');
			userOrderSuccess = await orderPaySuccess({
				verifyResult: verifyReceiptRes,
				data: payOrderInfo,
			});
			console.log('用户自己的回调逻辑 - 执行完成');
			await dao.uniPayOrders.updateAndReturn({
				whereJson: {
					status: 1,
					out_trade_no,
				},
				dataJson: {
					user_order_success: userOrderSuccess,
				}
			});
		} else {
			payOrderInfo = await dao.uniPayOrders.find({
				out_trade_no,
			});
		}
		console.log('userOrderSuccess', userOrderSuccess);
		// 用户自己的逻辑处理 结束-----------------------------------------------------------

		//console.log('verifyReceiptRes: ', verifyReceiptRes);
		return {
			errCode: 0,
			errMsg: "ok",
			has_paid: true, // 标记用户是否已付款成功（此参数只能表示用户确实付款了，但系统的异步回调逻辑可能还未执行完成）
			out_trade_no, // 支付插件订单号
			transaction_id, // 支付平台订单号
			status: payOrderInfo.status, // 标记当前支付订单状态 -1：已关闭 0：未支付 1：已支付 2：已部分退款 3：已全额退款
			user_order_success: payOrderInfo.user_order_success, // 用户异步通知逻辑是否全部执行完成，且无异常（建议前端通过此参数是否为true来判断是否支付成功）
			pay_order: payOrderInfo,
		};
	}


	/**
	 * 获取对应支付配置
	 * let uniPayConifg = await this.getUniPayConfig({ provider, provider_pay_type });
	 */
	async getUniPayConfig(data = {}) {
		let {
			provider,
			provider_pay_type,
		} = data;
		if (config && config[provider] && config[provider][provider_pay_type]) {
			let uniPayConfig = config[provider][provider_pay_type];
			if (!uniPayConfig.appId && provider !== "appleiap") {
				throw new Error(`uni-pay配置${provider}.${provider_pay_type}节点下的appId不能为空`);
			}
			return uniPayConfig;
		} else {
			throw new Error(`${provider}_${provider_pay_type} : 商户支付配置错误`);
		}
	}

	/**
	 * 初始化uniPayInstance
	 * let uniPayInstance = await service.pay.initUniPayInstance({ provider, provider_pay_type });
	 */
	async initUniPayInstance(data = {}) {
		let {
			provider,
		} = data;
		let uniPayConifg = await this.getUniPayConfig(data);
		let uniPayInstance;
		if (provider === "wxpay") {
			// 微信
			if (uniPayConifg.version === 3) {
				uniPayInstance = uniPay.initWeixinV3(uniPayConifg);
			} else {
				uniPayInstance = uniPay.initWeixin(uniPayConifg);
			}
		} else if (provider === "alipay") {
			// 支付宝
			uniPayInstance = uniPay.initAlipay(uniPayConifg);
		} else if (provider === "appleiap") {
			// ios内购
			uniPayInstance = uniPay.initAppleIapPayment(uniPayConifg);
		} else {
			throw new Error(`${pay_type} : 不支持的支付方式`);
		}
		return uniPayInstance;
	}

}


module.exports = new service();
