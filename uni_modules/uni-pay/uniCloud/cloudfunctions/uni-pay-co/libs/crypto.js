/**
 * 加密模块
 */

/*
加密解密示例
const payCrypto = require('../libs/crypto.js'); // 获取加密服务（注意文件所在相对路径）
let ciphertext = { a:1,b:2 };
let encrypted = payCrypto.aes.encrypt({
	data: ciphertext, // 待加密的原文
});

let decrypted = payCrypto.aes.decrypt({
	data: encrypted, // 待解密的原文
});
// 最终解密得出 decrypted = { a:1,b:2 } 
*/

const configCenter = require("uni-config-center");
const config = configCenter({ pluginId: 'uni-pay' }).requireFile('config.js');
const crypto = require("crypto");

var util = {};
util.aes = {};
/**
 * aes加密
 * @param {Object} data 待加密的原文
 * @param {Object} key 密钥，如不传，自动取config
 * 调用示例
let encrypted = crypto.aes.encrypt({
	data: "", // 待加密的原文
});
 */
util.aes.encrypt = function(obj) {
	let {
		data, // 待加密的原文
		key, // 密钥，如不传，自动取config
	} = obj;
	if (!key) key = config.notifyKey;
	if (typeof data === "object") data = JSON.stringify(data);
	const cipher = crypto.createCipher('aes192', key);
	let encrypted = cipher.update(data, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	// encrypted 为加密后的内容
	return encrypted;
};

/**
 * aes解密
 * @param {Object} data 待解密的原文
 * @param {Object} key 密钥，如不传，自动取config
 * 调用示例
let decrypted = crypto.aes.decrypt({
	data: "", // 待解密的原文
});
 */
util.aes.decrypt = function(obj) {
	let {
		data, // 待解密的原文
		key, // 密钥，如不传，自动取config
	} = obj;
	if (typeof data === "undefined") {
		throw "待解密原文不能为空";
	}
	if (!key) key = config.notifyKey;
	// 解密
	let decrypted;
	try {
		const decipher = crypto.createDecipher('aes192', key);
		decrypted = decipher.update(data, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		try {
			decrypted = JSON.parse(decrypted);
		} catch (err) {}
	} catch (err) {
		throw "解密失败";
	}
	// decrypted 为解密后的内容，即最开始需要加密的原始数据文本data
	return decrypted;
};

module.exports = util;
