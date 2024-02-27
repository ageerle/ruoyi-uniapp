/**
 * 支付宝相关函数
 */
const common = require('./common');
const crypto = require('crypto');

const ALIPAY_ALGORITHM_MAPPING = {
	RSA: 'RSA-SHA1',
	RSA2: 'RSA-SHA256'
}

var alipay = {
	/**
	 * 获取openid
	 */
	async getOpenid(data) {
		let {
			config={},
			code,
		} = data;
		if (!config.appId) throw new Error("uni-pay配置alipay.mp节点下的appId不能为空");
		if (!config.privateKey) throw new Error("uni-pay配置alipay.mp节点下的privateKey不能为空");
		let timestamp = common.timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
		let method = "alipay.system.oauth.token";
		let params = {
			timestamp,
			code,
			grant_type: "authorization_code"
		};
		let signData = this._getSign(method, params, config);
		// 格式化url和请求参数
		const { url, execParams } = this._formatUrl(signData);
		let res = await uniCloud.httpclient.request(url, {
			method: 'POST',
			data: execParams,
			dataType: 'text',
		});
		const result = JSON.parse(res.data)
		let response = result.alipay_system_oauth_token_response;
		if (res.status === 200 && response.user_id) {
			return {
				errCode: 0,
				errMsg: 'ok',
				openid: response.user_id,
				user_id: response.user_id,
			}
		} else {
			return {
				errCode: -1,
				errMsg: result.error_response.sub_msg
			}
		}
	},

	/**
	 * 签名
	 * @param {String} method 方法名
	 * @param {Object} params 参数
	 * @param {Object} config 配置
	 */
	_getSign(method, params, config) {
		let signParams = Object.assign({
			method,
			app_id: config.appId,
			charset: config.charset || "utf-8",
			version: config.version || "1.0",
			sign_type: config.signType || "RSA2",
		}, params);
		if (config.appCertSn && config.alipayRootCertSn) {
			signParams = Object.assign({
				app_cert_sn: config.appCertSn,
				alipay_root_cert_sn: config.alipayRootCertSn,
			}, signParams);
		}
		const bizContent = params.biz_content;
		if (bizContent) {
			signParams.biz_content = JSON.stringify(bizContent);
		}
		// 排序
		const decamelizeParams = this._sortObj(signParams);
		// 拼接url参数
		let signStr = this._objectToUrl(decamelizeParams);

		let keyType = config.keyType || 'PKCS8';
		const privateKeyType = keyType === 'PKCS8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY'
		let privateKey = this._formatKey(config.privateKey, privateKeyType);
		// 计算签名
		const sign = crypto.createSign(ALIPAY_ALGORITHM_MAPPING[signParams.sign_type])
			.update(signStr, 'utf8').sign(privateKey, 'base64');
		return Object.assign(decamelizeParams, { sign });
	},

	_formatKey(key, type) {
		return `-----BEGIN ${type}-----\n${key}\n-----END ${type}-----`
	},
	_sortObj(params) {
		let keysArr = Object.keys(params).sort();
		let sortObj = {};
		for (let i in keysArr) {
			sortObj[keysArr[i]] = (params[keysArr[i]]);
		}
		return sortObj;
	},
	_objectToUrl(obj) {
		let str = "";
		for (let key in obj) {
			if (obj[key]) {
				str += `&${key}=${obj[key]}`;
			}
		}
		if (str) str = str.substring(1);
		return str;
	},
	_formatUrl(params, url = "https://openapi.alipay.com/gateway.do") {
		let requestUrl = url;
		// 需要放在 url 中的参数列表
		const urlArgs = [
			'app_id',
			'method',
			'format',
			'charset',
			'sign_type',
			'sign',
			'timestamp',
			'version',
			'notify_url',
			'return_url',
			'auth_token',
			'app_auth_token'
		]

		for (const key in params) {
			if (urlArgs.indexOf(key) > -1) {
				const val = encodeURIComponent(params[key])
				requestUrl = `${requestUrl}${requestUrl.includes('?') ? '&' : '?'
		      }${key}=${val}`
				// 删除 postData 中对应的数据
				delete params[key]
			}
		}

		return { execParams: params, url: requestUrl }
	}
};
module.exports = alipay;
