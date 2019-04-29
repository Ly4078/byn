require("es6-promise").polyfill();
import axios from "axios";
import { Message } from "element-ui";
import router from "./../../router";

var _this = this;
export const Axios = axios.create({
  baseURL: 'http://dev.byn-kj.com/', //测试
  // BASEURL: window.location.host + "/",//生产
  // baseURL: "/api/", //开发
  timeout: 10000
});

//POST传参序列化(添加请求拦截器)
// 在发送请求之前做某件事
Axios.interceptors.request.use(
  config => {
    // 设置以 form 表单的形式提交参数，如果以 JSON 的形式提交表单，可忽略
    if (config.method === "post" || config.method === "put") {
      // if (config.data.json) {
      config.headers = {
        "Content-Type": "application/json"
      };
      // } else {
      // JSON 转换为 FormData
      // const formData = new FormData();
      // Object.keys(config.data).forEach(key =>
      //   formData.append(key, config.data[key])
      // );
      // config.data = formData;

      // }
    } else {
      config.headers = {
        "Content-Type": "application/json;charset=UTF-8"
      };
    }
    // 下面会说在什么时候存储 token
    if (localStorage.getItem("TOKEN")) {
      config.headers.Authorization = localStorage.getItem("TOKEN");
    }

    return config;
  },
  error => {
    alert("错误的传参", "fail");
    return Promise.reject(error);
  }
);

//返回状态判断(添加响应拦截器)
Axios.interceptors.response.use(
  res => {
    //对响应数据做些事
    if (res.status == 200) {
      return res;
    }
  },
  error => {
    if (error.response.status === 401 || error.response.status === 403) {
      Message({
        duration: 5000,
        showClose: true,
        message: error.response.data,
        type: "error"
      });
      router.push({
        name: "Login"
      });
    } else if (error.response.status === 400) {
      Message({
        duration: 5000,
        showClose: true,
        message: error.response.data,
        type: "error"
      });
    } else if (error.response.status === 500) {
      Message({
        duration: 5000,
        showClose: true,
        message: "系统异常，稍后重试",
        type: "error"
      });
      // Promise.reject("系统异常，稍后重试");
    } else {
      Message({
        duration: 5000,
        showClose: true,
        message: error.response.data,
        type: "error"
      });
      return error;
    }
  }
);

export default {
  install(Vue) {
    Object.defineProperty(Vue.prototype, "$http", { value: Axios });
  }
};
