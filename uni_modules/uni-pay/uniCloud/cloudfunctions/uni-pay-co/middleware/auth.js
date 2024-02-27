module.exports = async function(key = true) {
	if (this.authInfo) { // 多次执行auth时如果第一次成功后续不再执行
		return;
	}
	const token = this.getUniIdToken();
	const payload = await this.uniIdCommon.checkToken(token);
	if (payload.errCode) {
		if (key) {
			throw payload;
		} else {
			return;
		}
	}
	this.authInfo = payload;
	if (payload.token && typeof this.response === "object") {
		this.response.newToken = {
			token: payload.token,
			tokenExpired: payload.tokenExpired
		}
	}
}
