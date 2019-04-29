<template>
  <div class="queryOrderSummary mainboss">
    <div class="martop">
      <div class="topleft">
        <el-select v-model="term.areaId" clearable filterable placeholder="请选择区域" @focus="getarea">
          <el-option v-for="item in arealist" :key="item.value" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-cascader
          placeholder="选择区域酒店"
          :show-all-levels="false"
          :options="options"
          filterable
          clearable
          @active-item-change="handleItemChange"
          @change="handlechange"
          @focus="getarea"
        ></el-cascader>
        <el-date-picker v-model="term.startDate" type="datetime" placeholder="开始时间" align="right"></el-date-picker>
        <el-date-picker v-model="term.endDate" type="datetime" placeholder="结束时间" align="right"></el-date-picker>
        <el-button type="primary" @click="getsales(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="saleslist"
      :height="this.$store.state.tableHeight"
      border
      stripe
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="name" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="quantity" align="center" label="销售量(个/件)"></el-table-column>
      <el-table-column prop="amount" align="center" label="销售额(元)"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: "queryOrderSummary",
  data() {
    return {
      total: 0,
      ptotal: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      term: {
        areaId: "",
        hotelId: "",
        startDate: "",
        endDate: ""
      },
      options: [],
      arealist: [],
      saleslist: []
    };
  },
  methods: {
    //时间格式转换
    changDage(value) {
      if (value) {
        let _value =
          value.getFullYear() +
          "-" +
          (value.getMonth() + 1) +
          "-" +
          value.getDate() +
          " " +
          value.getHours() +
          ":" +
          value.getMinutes() +
          ":" +
          value.getSeconds();
        return _value;
      }
    },
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("sales/areaList").then(res => {
          let _data = [];
          this.arealist = res.data;
          for (let i in res.data) {
            let _ob = {};
            _ob.value = res.data[i].id;
            _ob.label = res.data[i].name;
            _ob.children = [];
            _data.push(_ob);
          }
          this.options = _data;
        });
      }
    },
    handleItemChange(val) {
      this.gethotel(val[0]);
    },
    //查询酒店下拉列表
    gethotel(areaId) {
      this.$http.get("sales/hotelList/" + areaId).then(res => {
        let _datas = [];
        for (let i in this.options) {
          if (areaId == this.options[i].value) {
            for (let j in res.data) {
              let _obj = {};
              _obj.value = res.data[j].id;
              _obj.label = res.data[j].name;
              _datas.push(_obj);
            }
            this.options[i].children = _datas;
          }
        }
      });
    },
    handlechange(val) {
      this.term.hotelId = val[1];
    },
    //获取列表数据
    getsales(val) {
      let _parms = {},
        _Url = "",
        _this = this;
      if (val == 1) {
        this.pageNum = 1;
      }
      if (this.term.startDate && this.term.endDate) {
        let _startDate = Number(this.term.startDate.getTime());
        let _endDate = Number(this.term.endDate.getTime());
        if (_startDate > _endDate) {
          this.term.endDate = "";
          this.$message.error("开始时间不得大于结束时间");
          return;
        } else if (_endDate - _startDate > 86400000 * 90) {
          this.term.endDate = "";
          this.$message.error("开始时间与结束时间间隔不得大于90天");
          return;
        }
      } else {
        this.$message("请选择时间");
        return;
      }

      if (this.term.startDate) {
        _parms.startDate = this.changDage(this.term.startDate);
      }
      if (this.term.endDate) {
        _parms.endDate = this.changDage(this.term.endDate);
      }
      _parms.areaId = this.term.areaId;
      _parms.hotelId = this.term.hotelId;
      _Url = "sales?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in _parms) {
        if (_parms[key]) {
          _Url += "&" + key + "=" + _parms[key];
        }
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.saleslist = [];
        } else {
          let obj = {
            amount: 0,
            name: "本页合计",
            quantity: 0
          };
          for (let i = 0; i < res.data.length; i++) {
            obj.amount = obj.amount + res.data[i].amount * 100;
            obj.quantity += res.data[i].quantity;
          }
          obj.amount = obj.amount / 100;
          setTimeout(() => {
            res.data.unshift(obj);
            _this.saleslist = res.data;
          }, 200);
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getsales();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getsales();
    }
  },
  created() {
    const startDate = new Date();
    startDate.setTime(startDate.getTime() - 3600 * 1000 * 24 * 90);
    this.term.startDate = startDate;

    const endDate = new Date();
    endDate.setTime(endDate.getTime());
    this.term.endDate = endDate;
    this.getsales();
  }
};
</script>
<style lang="less">
.queryOrderSummary {
  .topleft {
    .el-input {
      width: 20%;
    }
  }
}
</style>
