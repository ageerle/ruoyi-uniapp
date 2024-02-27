const http = uni.$u.http
const api = {

    /**
     * 登录
     */
    login(params) {
        return http.post('/login', params, {custom: {auth: false}})
    },

    /**
     * 注册
     */
    register(params) {
        return http.post('/register', params, {custom: {auth: false}})
    },

    /**
     * 发送消息
     */
    message(params) {
        return http.post('/message', params, {custom: {auth: true}})
    },

    /**
     * 消息分页
     */
    messagePage(params) {
        return http.get('/message', {params})
    },
}

export default api;
