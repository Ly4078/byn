<template>
  <div class="goods_list">
    <div class="boxtop" v-if="ispay" @click="handmodel"></div>
    <div class="boxs" v-if="ispay">
      <p>提示</p>
      <p>支付完成,如3分钟内柜门未打开，请联系客服027-83598166</p>
      <p>
        <a href="tel:027-83598166">
          <button>确定</button>
        </a>
      </p>
    </div>
    <!-- <div class="newbox"></div> -->
    <marquee behavior="scroll" v-show="ismarquee" @click="ismarquee = false">亲，请务必确认货道有货后再支付哟！</marquee>
    <div class="goods_ul">
      <span v-show="goodslist.length<1">此设备没有商品或设备异常，请联系管理员</span>
      <ul>
        <li
          v-for="(item,index) in goodslist"
          :key="index"
          :class="item.actInd? 'actclass' : '' "
          @click.stop="selectItem(item,index)"
        >
          <div class="serial">{{item.channelNo}}</div>
          <img :src="$GLOBAL.API+item.thumb" alt="商品图片">
          <div class="goodsdateil">
            <div class="title">{{item.name}}</div>
            <div class="suoming">{{item.remark}}</div>
            <div class="more" @click.stop="selectItem(item,index)">
              <span class="moreleft">
                <i>￥</i>
                <em>{{item.salePrice}}</em>
              </span>
              <img class="morerigh" v-show="item.actInd" src="../../assets/image/reducing.png" alt>
              <img class="morerigh" v-show="!item.actInd" src="../../assets/image/add.png" alt>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <mt-tabbar v-model="selected">
      <mt-tab-item id="1">
        <img src="../../assets/image/gouwuche.png">
        <i class="goods_num" v-show="goodsNum>0">{{goodsNum}}</i>
        <span>
          合计：
          <i>￥</i>
          <em>{{amout}}</em>
        </span>
      </mt-tab-item>
      <mt-tab-item id="2" @click.stop="settlement">立即支付</mt-tab-item>
    </mt-tabbar>
  </div>
</template>
<script>
import Vue from "vue";
import { Tabbar, TabItem } from "mint-ui";
import { Indicator } from "mint-ui";
Vue.component(Tabbar.name, Tabbar);
Vue.component(TabItem.name, TabItem);
import { MessageBox } from "mint-ui";
export default {
  name: "goods_list",
  data() {
    return {
      ispay: false,
      amout: 0,
      goodsNum: 0,
      actInd: "",
      selected: "",
      wxback: {},
      actlist: [],
      goodslist: [],
      playtype: "", //1 微信  2 支付宝 3 其它（微信支付宝都可以）
      ismarquee: true
    };
  },
  watch: {
    selected: function() {
      if (this.selected == 2) {
        this.settlement();
      }
    }
  },
  methods: {
    //查询列表数据
    getlist(para) {
      let _para = para ? para : "865533039122167",
        _this = this;
      if (!this.wxback.code) {
        this.getplaytype(_para);
      }
      Indicator.open({
        text: "加载中...",
        spinnerType: "fading-circle"
      });
      this.$http.get("yub/list/" + _para).then(res => {
        let _data = res.data;
        for (let i in _data) {
          _data[i].actInd = false;
        }
        if (this.$store.state.actgoodslist.length > 0) {
          this.goodsNum = this.$store.state.actgoodslist.length;
          this.actlist = this.$store.state.actgoodslist;
          for (let i in this.actlist) {
            this.amout = this.calculation(
              this.amout,
              this.actlist[i].salePrice,
              1
            );
            for (let j in _data) {
              if (this.actlist[i].goodsId == _data[j].goodsId) {
                _data[j].actInd = true;
              }
            }
          }
        }
        setTimeout(() => {
          Indicator.close();
          _this.goodslist = _data;
        }, 100);
      });
    },
    //选择某个数据
    selectItem(obj, ind) {
      this.goodslist[ind].actInd = !this.goodslist[ind].actInd;
      let _salePrice = this.goodslist[ind].salePrice;
      if (this.goodslist[ind].actInd) {
        this.amout = this.calculation(this.amout, _salePrice, 1);
        this.actlist.push(obj);
        this.goodsNum++;
        // this.amout = (this.amout * 100 + _salePrice * 100) / 100;
      } else {
        this.amout = this.calculation(this.amout, _salePrice, 2);
        this.goodsNum--;
        for (let i in this.actlist) {
          if (obj.goodsId == this.actlist[i].goodsId) {
            this.actlist.splice(i, 1);
          }
        }
      }
    },
    //计算金额
    calculation(arg1, arg2, val) {
      var r1, r2, m;
      try {
        r1 = arg1.toString().split(".")[1].length;
      } catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split(".")[1].length;
      } catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2));
      if (val == 1) {
        return (arg1 * m + arg2 * m) / m;
      } else if (val == 2) {
        return (arg1 * m - arg2 * m) / m;
      }
    },
    //去结算
    settlement() {
      let _Url = "",
        _parms = {},
        _list = [];
      this.selected = 1;
      Indicator.open({
        text: "结算中...",
        spinnerType: "fading-circle"
      });
      if (this.wxback && this.wxback.code) {
        _Url = "yub/xw/" + this.wxback.code;
      } else {
        _Url = "yub/ila";
      }
      const _date = new Date();
      let _md5 = this.$md5(
        this.amout.toFixed(2).toString() +
          "liaoyibi" +
          _date.getTime().toString()
      );
      for (let i in this.actlist) {
        _list.push(this.actlist[i].channelId);
      }
      _parms = {
        channelIdList: _list,
        signature: _md5,
        timestamp: _date.getTime().toString()
      };
      this.$http.post(_Url, _parms).then(res => {
        Indicator.close();
        if (this.playtype == 2 || this.playtype == 3) {
          //支付宝环境或其它环境
          this.html = res.data;
          var form = res.data;
          const div = document.createElement("div");
          div.innerHTML = form; //此处form就是后台返回接收到的数据
          document.body.appendChild(div);
          document.forms[0].submit();
        } else {
          //微信环境
          this.wxpay(res.data); //调取支付
        }
      });
    },
    wxpay(data) {
      var vm = this;
      //下面是解决WeixinJSBridge is not defined 报错的方法
      if (typeof WeixinJSBridge == "undefined") {
        //微信浏览器内置对象。参考微信官方文档
        if (document.addEventListener) {
          document.addEventListener(
            "WeixinJSBridgeReady",
            vm.onBridgeReady(data),
            false
          );
        } else if (document.attachEvent) {
          document.attachEvent("WeixinJSBridgeReady", vm.onBridgeReady(data));
          document.attachEvent("onWeixinJSBridgeReady", vm.onBridgeReady(data));
        }
      } else {
        vm.onBridgeReady(data);
      }
    },
    onBridgeReady: function(data) {
      let packageValue = data.package;
      let arr = packageValue.split("=");
      var vm = this;
      WeixinJSBridge.invoke(
        "getBrandWCPayRequest",
        {
          //下面参数内容都是后台返回的
          debug: true,
          appId: data.appId, //公众号名称，由商户传入
          timeStamp: data.timeStamp, //时间戳
          nonceStr: data.nonceStr, //随机串
          package: data.package, //预支付id
          signType: data.signType, //微信签名方式
          paySign: data.paySign //微信签名
        },
        function(res) {
          // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          alert(JSON.stringify(res))
          if (res.err_msg == "get_brand_wcpay_request:ok") {
            // vm.$router.push("/successPay");
            vm.ispay = true;
            // MessageBox.alert(
            //   "支付完成,如3分钟内柜门未打开，请联系客服027-83598166"
            // ).then(action => {
            //   window.location.href = "tel:027-83598166";
            // });
          } else {
            MessageBox("提示", "支付失败");
            vm.$router.push("/");
            //alert("支付失败,请跳转页面"+res.err_msg);
          }
        }
      );
    },
    //支付环境判断
    getplaytype(_para) {
      if (/MicroMessenger/.test(window.navigator.userAgent)) {
        this.playtype = 1;
        window.location.href =
          "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4c3213fb7c381a0&redirect_uri=http://dev.byn-kj.com/mobile/index.html&response_type=code&scope=snsapi_base&state=" +
          _para +
          "#wechat_redirect";
        // alert("微信客户端");
      } else if (/AlipayClient/.test(window.navigator.userAgent)) {
        this.playtype = 2;
        // alert("支付宝客户端");
      } else {
        this.playtype = 3;
        // alert("其他浏览器");
      }
    },
    handmodel(){
      this.ispay= false;
      this.amout= 0;
      this.goodsNum= 0;
      this.actInd= "";
      this.selected= "";
      this.actlist= [];
      for(let i in this.getlist){
        this.goodslist[i].actInd = false;
      }
    }
  },
  created() {
    //  this.getlist();

    let astr = window.location.href,
      aobj = {};
    if (astr.indexOf("code") != -1) {
      let anum = astr.indexOf("?");
      astr = astr.substr(anum + 1);
      let aarr = astr.split("&");
      for (let i = 0; i < aarr.length; i++) {
        let barr = aarr[i].split("=");
        aobj[barr[0]] = barr[1];
      }
      this.wxback = aobj;
      this.getlist(aobj.state);
    } else {
      let url = document.location.toString();
      let arrUrl = url.split("?"),ujh=0;
      if(arrUrl[1].indexOf("#")!=-1){
         ujh = arrUrl[1].indexOf("#");
      }
      const _code = arrUrl[1].substr(0, ujh);
      this.getlist(_code);
    }
  }
};
</script>
<style lang="less">
.goods_list {
  // position: fixed;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background: #fdfae4;
  .newbox {
    height: 1500px;
    background: red;
    width: 40%;
  }
  .boxs {
    position: fixed;
    top: 30%;
    left: 10%;
    z-index: 9999;
    width: 70%;
    padding: 5%;
    background: #fff;
    p {
      margin: 10px;
    }
    p:nth-child(1) {
      color: #000;
      font-size: 30px;
    }
    p:nth-child(2) {
      color: #999;
      font-size: 26px;
    }
    p:nth-child(3) {
      margin-top: 20px;
      button {
        padding: 6px 15px;
      }
      font-size: 35px;
    }
  }
  .boxtop {
    position: fixed;
    z-index: 9998;
    width: 100%;
    height: 100%;
    background: rgb(32, 29, 29);
    opacity: 0.6;
  }
  marquee {
    position: fixed;
    top: 0;
    left: 0;
    color: red;
    img {
      width: 15px;
      height: 15px;
    }
  }
  .goods_ul {
    width: 93.6%;
    height: 100%;
    padding: 3.2%;
    padding-bottom: 110px;
    overflow-y: auto;
    ul {
      li {
        width: 340px;
        height: 510px;
        float: left;
        margin-bottom: 22px;
        background: #fff;
        .serial {
          width: 32px;
          height: 32px;
          background: #fdd808;
          border-radius: 4px 0px 0px 0px;
          position: absolute;
          font-size: 30px;
          font-family: "DIN-Bold";
          color: #151515;
          line-height: 32px;
        }
        img {
          width: 98%;
          padding: 2% 1%;
          height: 340px;
          border-radius: 4px;
        }
        .goodsdateil {
          padding: 12px 8px 10px 13px;
          .title,
          .suoming {
            font-size: 30px;
            color: #2c2c2c;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
          }
          .suoming {
            font-size: 24px;
            color: #a3a3a3;
          }
          .more {
            padding: 0 7px;
            .moreleft {
              float: left;
              i {
                font-size: 30px;
              }
              em {
                font-size: 44px;
              }
            }
            .morerigh {
              width: 40px;
              height: 40px;
              display: block;
              font-size: 26px;
              border-radius: 50%;
              font-weight: 800;
              float: right;
            }
          }
        }
      }
      li:nth-child(2n) {
        // background: blue;
      }
      li:nth-child(2n-1) {
        // background: red;
        margin-right: 22px;
      }
      .actclass {
        background: #fdd808;
      }
    }
  }
  .mint-tabbar {
    background: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    height: 100px;
    .is-selected {
      color: none;
    }
    a {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    & > a:nth-child(1) {
      background: #fff;
      img {
        width: 54px;
        height: 54px;
      }
      span {
        font-size: 32px;
      }
      i {
        font-size: 24px;
      }
      em {
        font-size: 40px;
      }
      .goods_num {
        position: relative;
        font-size: 24px;
        top: -35px;
        left: -20px;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        padding: 3px;
        background: #fdd808;
        border-radius: 50%;
      }
    }
    & > a:nth-child(2) {
      background: #fdd808;
      font-size: 36px;
    }
  }
}
</style>
