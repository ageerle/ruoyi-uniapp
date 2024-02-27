const fs = require('fs');
const path = require('path')
module.exports = {
	// 统一 - 支付回调地址,格式为 "服务空间ID":"URL化地址"
	"notifyUrl": {
		// 本地开发环境-支付回调地址
		"": "",
		// 线上正式环境-支付回调地址
		"": "",
	},
	// 支付宝相关（证书记得选java版本）
	"alipay": {
		
	}
}