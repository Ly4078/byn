<template>
  <div class="replenish_list mainboss">
    <div class="martop">
      <div class="topleft">
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
        <el-select
          v-model="term.goodsId"
          clearable
          filterable
          placeholder="请选择商品"
          @focus="getgoods"
        >
          <el-option
            v-for="item in goodslist"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="getreplenishOrder(1)">搜索</el-button>
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
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="goodsName" align="center" label="商品名称"></el-table-column>
      <el-table-column prop="goodsNo" align="center" label="待补货数量"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="orderDetail(scope.row)" type="primary" size="mini">补货单详情</el-button>
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
      title="酒店补货单详情"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="70%"
      center
    >
      <el-table
        :data="dialist"
        border
        style="width: 100%"
        element-loading-background="rgba(0, 0, 0, 0.5)"
        element-loading-text="数据正在加载中"
      >
        <el-table-column prop="roomNo" align="center" label="房间号"></el-table-column>
        <el-table-column prop="equipNo" align="center" label="货柜设备编号"></el-table-column>
        <el-table-column prop="channelNo" align="center" label="待补货货道"></el-table-column>
        <el-table-column prop="goodsName" align="center" label="待补货商品"></el-table-column>
        <el-table-column prop="salePrice" align="center" label="商品价格（单位：元）"></el-table-column>
        <el-table-column align="center" label="累计缺货时长">
          <template slot-scope="scope">{{scope.row.hour | filterhour}}</template>
        </el-table-column>
        <el-table-column prop="createTime" align="center" label="缺货起始时间"></el-table-column>
        <el-table-column align="center" label="销售货道">
          <template slot-scope="scope">货道{{scope.row.channelNo}}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "replenish_list",
  data() {
    return {
      total: 0,
      ptotal: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      centerDialogVisible: false,
      term: {
        goodsId: "",
        hotelId: ""
      },
      dialist: [],
      options: [],
      goodslist: [],
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
  filters: {
    filterhour(value) {
      let _day = parseInt(value / 24);
      let _hour = parseInt(value % 24);
      return _day + "天 " + _hour + "小时";
    }
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("replenishOrder/areaList").then(res => {
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
      }
    },
    handleItemChange(val) {
      this.gethotel(val[0]);
    },
    //查询酒店下拉列表
    gethotel(areaId) {
      this.$http.get("replenishOrder/hotelList/" + areaId).then(res => {
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
    //查询商品下拉列表
    getgoods() {
      if (this.goodslist.length < 1) {
        this.$http.get("replenishOrder/goods").then(res => {
          this.goodslist = res.data;
        });
      }
    },
    //获取列表数据
    getreplenishOrder(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "replenishOrder?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
      this.getreplenishOrder();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getreplenishOrder();
    },
    //订单明细
    orderDetail(obj) {
      let _Url = "replenishOrder/" + obj.hotelId + "/" + obj.goodsId;
      this.$http.get(_Url).then(res => {
        this.centerDialogVisible = !this.centerDialogVisible;
        this.dialist = res.data;
      });
    }
  },
  created() {
    this.getreplenishOrder();
  }
};
</script>

<style lang="less" scoped>
.replenish_list {
  .topleft {
    .el-select {
      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
