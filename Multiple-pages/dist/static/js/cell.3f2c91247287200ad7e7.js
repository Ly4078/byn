webpackJsonp([4],{

/***/ 103:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"app"}},[_c('cell')],1)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),

/***/ 105:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v(" this is cell page")])}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);

/***/ }),

/***/ 29:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_components_cell_vue__ = __webpack_require__(37);
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'app',
  components: { cell: __WEBPACK_IMPORTED_MODULE_0_components_cell_vue__["a" /* default */] }
});

/***/ }),

/***/ 37:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_13_7_3_vue_loader_lib_template_compiler_index_id_data_v_ae095922_hasScoped_false_transformToRequire_video_src_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_template_index_0_cell_vue__ = __webpack_require__(105);
var normalizeComponent = __webpack_require__(8)
/* script */
var __vue_script__ = null
/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_13_7_3_vue_loader_lib_template_compiler_index_id_data_v_ae095922_hasScoped_false_transformToRequire_video_src_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_template_index_0_cell_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 38:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_cell__ = __webpack_require__(37);



__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]({
  routes: [{
    path: '/',
    name: 'cell',
    component: __WEBPACK_IMPORTED_MODULE_2__components_cell__["a" /* default */]
  }]
}));

/***/ }),

/***/ 39:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(3);


__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */].Store({
  state: {
    count: 0
  },
  mutations: {
    increment: state => state.count++,
    decrement: state => state.count--
  }
}));

/***/ }),

/***/ 4:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_axios__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_axios__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_mint_ui__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_mint_ui___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_mint_ui__);
__webpack_require__(13).polyfill();



var _this = this;
const Axios = __WEBPACK_IMPORTED_MODULE_0_axios___default.a.create({
  // baseURL:  'http://192.168.88.200:8080/mobile/',//开发
  baseURL: 'http://dev.byn-kj.com/mobile/' //测试
  // BASEURL: window.location.host + "/",//生产
  // baseURL: "/api/", //开发
  // timeout: 10000
});
/* unused harmony export Axios */


//POST传参序列化(添加请求拦截器)
// 在发送请求之前做某件事
Axios.interceptors.request.use(config => {
  // 设置以 form 表单的形式提交参数，如果以 JSON 的形式提交表单，可忽略
  console.log("config.data:", config.data);
  if (config.method === "post") {
    config.headers = {
      "Content-Type": "application/json"
      // "Content-Type": "application/x-www-form-urlencoded"
    };

    // JSON 转换为 FormData
    // const formData = new FormData();
    // Object.keys(config.data).forEach(key =>
    //   formData.append(key, config.data[key])
    // );
    // config.data = formData;
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
}, error => {
  alert("错误的传参", "fail");
  return Promise.reject(error);
});

//返回状态判断(添加响应拦截器)
Axios.interceptors.response.use(res => {
  if (res.status == 200) {
    return res;
  }
}, error => {
  // alert(error.response.status)
  if (error.response.data) {
    console.log('error.response.data:', error.response.data);
    // alert(error.response.data)
  }
  if (error.response.status === 401 || error.response.status === 403) {

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_mint_ui__["Toast"])({
      message: error.response.data,
      position: 'bottom',
      duration: 5000
    });
  } else if (error.response.status === 400) {
    // Toast({
    //   message: error.response.data,
    //   position: 'bottom',
    //   duration: 5000
    // });
    __WEBPACK_IMPORTED_MODULE_1_mint_ui__["MessageBox"].alert(error.response.data + "，请联系客服027-83598166").then(action => {
      window.location.href = "tel:027-83598166";
    });
  } else if (error.response.status === 500) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_mint_ui__["Toast"])({
      message: error.response.data,
      position: 'bottom',
      duration: 5000
    });
    // Promise.reject("系统异常，稍后重试");
  } else {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_mint_ui__["Toast"])({
      message: error.response.data,
      position: 'bottom',
      duration: 5000
    });
    return error;
  }
});

/* harmony default export */ __webpack_exports__["a"] = ({
  install(Vue) {
    Object.defineProperty(Vue.prototype, "$http", { value: Axios });
  }
});

/***/ }),

/***/ 47:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_script_index_0_cell_vue__ = __webpack_require__(29);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_13_7_3_vue_loader_lib_template_compiler_index_id_data_v_60b6aad3_hasScoped_false_transformToRequire_video_src_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_template_index_0_cell_vue__ = __webpack_require__(103);
function injectStyle (ssrContext) {
  __webpack_require__(79)
}
var normalizeComponent = __webpack_require__(8)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_script_index_0_cell_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_13_7_3_vue_loader_lib_template_compiler_index_id_data_v_60b6aad3_hasScoped_false_transformToRequire_video_src_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_13_7_3_vue_loader_lib_selector_type_template_index_0_cell_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 5:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// const BASEURL = "http://192.168.88.200:8080";  //测试服务器
const BASEURL = "http://dev.byn-kj.com"; //生产服务器
const QRBASEURL = "http://dev.byn-kj.com/index.html?"; //二维码
const config = {
  API: BASEURL,
  qrAPI: QRBASEURL
};
/* harmony default export */ __webpack_exports__["a"] = (config);
// module.exports = config;

/***/ }),

/***/ 6:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 69:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__cell_vue__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__router__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vuex__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__store_store__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__assets_js_AxiosPlugin__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_js_config__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_lib_flexible__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_lib_flexible___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_lib_flexible__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_js_md5__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_js_md5___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_js_md5__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_mint_ui_lib_style_css__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_mint_ui_lib_style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_mint_ui_lib_style_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__assets_css_reset_css__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__assets_css_reset_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__assets_css_reset_css__);

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.





__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_3_vuex__["a" /* default */]);



__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_5__assets_js_AxiosPlugin__["a" /* default */]);


__WEBPACK_IMPORTED_MODULE_0_vue__["default"].prototype.$GLOBAL = __WEBPACK_IMPORTED_MODULE_6__assets_js_config__["a" /* default */];




__WEBPACK_IMPORTED_MODULE_0_vue__["default"].prototype.$md5 = __WEBPACK_IMPORTED_MODULE_8_js_md5___default.a;




__WEBPACK_IMPORTED_MODULE_0_vue__["default"].config.productionTip = false;

/* eslint-disable no-new */
new __WEBPACK_IMPORTED_MODULE_0_vue__["default"]({
  el: '#app',
  router: __WEBPACK_IMPORTED_MODULE_2__router__["a" /* default */],
  store: __WEBPACK_IMPORTED_MODULE_4__store_store__["a" /* default */],
  template: '<App/>',
  components: { App: __WEBPACK_IMPORTED_MODULE_1__cell_vue__["a" /* default */] }
});

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 79:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[69]);
//# sourceMappingURL=cell.3f2c91247287200ad7e7.js.map