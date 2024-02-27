'use strict';
/**
 * 此处建议只改下订单状态，保证能及时返回给第三方支付服务器成功状态
 * 限制4秒内必须执行完全部的异步回调逻辑，建议将消息发送、返佣、业绩结算等业务逻辑异步处理（如用定时任务去处理这些异步逻辑）
 */
module.exports = async (obj) => {
	let user_order_success = true;
	let { data = {} } = obj;
	let {
		order_no,
		out_trade_no,
		total_fee,
		custom = {}
	} = data; // uni-pay-orders 表内的数据均可获取到

	// 此处写你自己的支付成功逻辑开始-----------------------------------------------------------
	// 方式一：直接写数据库操作
	// 此处只是简单演示下，实际数据库语句会更复杂一点。
	const db = uniCloud.database();
	const _ = db.command;
	let res = await db.collection("uni-id-users").doc(custom.user_id).update({
	  balance: _.inc(custom.recharge_balance)
	});
	if (res && res.updated) {
		user_order_success = true; // 通知插件我的自定义回调逻辑执行成功
	} else {
		user_order_success = false; // 通知插件我的自定义回调逻辑执行失败
	}
	// 此处写你自己的支付成功逻辑结束-----------------------------------------------------------
	return user_order_success;
};