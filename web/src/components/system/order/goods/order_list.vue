<template>
  <div class="order_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="term.serialNo"
          placeholder="请输入订单编号"
          @keyup.enter.native="getorderlist(1)"
          clearable
        ></el-input>
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
        <el-select v-model="term.status" clearable filterable placeholder="请选择状态">
          <el-option
            v-for="item in statuslist"
            :key="item.value"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-select v-model="term.payway" clearable filterable placeholder="请选择支付方式">
          <el-option
            v-for="item in paywaylist"
            :key="item.value"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="getorderlist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="orderlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="serialNo" align="center" label="订单编号"></el-table-column>
      <el-table-column prop="equipNo" align="center" label="销售设备"></el-table-column>
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="roomNo" align="center" label="房间号"></el-table-column>
      <el-table-column prop="amount" align="center" label="总金额"></el-table-column>
      <el-table-column prop="orderTime" align="center" label="下单时间"></el-table-column>
      <el-table-column align="center" label="支付方式">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.payway === '1' ? 'success' : 'primary'"
            disable-transitions
          >{{scope.row.payway === '1' ? '微信支付' : '支付宝支付'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="payTime" align="center" label="支付时间"></el-table-column>
      <el-table-column prop="status" align="center" label="状态">
        <template
          slot-scope="scope"
        >{{scope.row.status === '1' ? '待支付' : scope.row.status === '2' ? '已支付' : '作废'}}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="orderDetail(scope.row)" type="primary" size="mini">订单明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <span class="pagein">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="15"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </span>

    <el-dialog
      title="订单详情"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="50%"
      center
    >
      <el-table
        :data="dialist"
        border
        style="width: 100%"
        element-loading-background="rgba(0, 0, 0, 0.5)"
        element-loading-text="数据正在加载中"
      >
        <el-table-column prop="goodsName" align="center" label="商品名称"></el-table-column>
        <el-table-column prop="salePrice" align="center" label="销售价格"></el-table-column>
        <el-table-column align="center" label="销售货道">
          <template slot-scope="scope">货道{{scope.row.channelNo}}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "order_list",
  data() {
    return {
      total: 0,
      ptotal: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      centerDialogVisible: false,
      term: {
        serialNo: "",
        hotelId: "",
        status: "",
        payway: ""
      },
      options: [],
      dialist: [],
      statuslist: [
        {
          id: 1,
          label: "待支付"
        },
        {
          id: 2,
          label: "已支付"
        },
        {
          id: 3,
          label: "作废"
        }
      ],
      paywaylist: [
        {
          id: 1,
          label: "微信支付"
        },
        {
          id: 2,
          label: "支付宝支付"
        }
      ],
      orderlist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        this.dialist = [];
      }
    }
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      this.$http.get("order/areaList").then(res => {
        let _data = [];
        for (let i in res.data) {
          let _ob = {};
          _ob.value = res.data[i].id;
          _ob.label = res.data[i].name;
          _ob.children = [];
          _data.push(_ob);
        }
        this.options = _data;
      });
    },
    handleItemChange(val) {
      this.gethotel(val[0]);
    },
    //查询酒店下拉列表
    gethotel(areaId) {
      this.$http.get("order/hotelList/" + areaId).then(res => {
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
      console.log("val:", val);
      this.term.hotelId = val[1];
    },
    //获取列表数据
    getorderlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "order?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key]) {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.orderlist = [];
        } else {
          this.orderlist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getorderlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getorderlist();
    },
    //订单明细
    orderDetail(obj) {
      this.$http.get("order/" + obj.id).then(res => {
        this.centerDialogVisible = !this.centerDialogVisible;
        this.dialist = res.data;
      });
    }
  },
  created() {
    this.getorderlist();
  }
};
</script>
<style lang="less">
.order_list {
  .topleft {
    .el-input {
      width: 20%;
    }
  }
}
</style>
