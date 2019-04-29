
<template>
  <div class="apply_warning mainboss">
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
        <el-button type="primary" @click="getreplenishWarn(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="replenisherlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="roomeNo" align="center" label="房间号码"></el-table-column>
      <el-table-column prop="equipNo" align="center" label="设备编号"></el-table-column>
      <el-table-column align="center" label="缺货时长">
        <template slot-scope="scope">{{scope.row.hour | fiterdate}}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="handlebut(scope.row)" type="primary" size="mini" icon="el-icon-menu">详情</el-button>
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
      title="预警详情"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="50%"
      center
    >
      <el-table
        :data="detailslist"
        border
        style="width: 100%"
        v-loading="loading"
        element-loading-background="rgba(0, 0, 0, 0.5)"
        element-loading-text="数据正在加载中"
      >
        <el-table-column prop="channelNo" align="center" label="货道号"></el-table-column>
        <el-table-column prop="goodsName" align="center" label="商品名称"></el-table-column>
        <el-table-column align="center" label="缺货时长">
          <template slot-scope="scope">{{scope.row.hour | fiterdate}}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "apply_warning",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      centerDialogVisible: false,
      term: {
        hotelId: ""
      },
      options: [],
      detailslist: [],
      replenisherlist: []
    };
  },
  filters: {
    fiterdate(value) {
      let _day = parseInt(value / 24);
      let _hour = parseInt(value % 24);
      return _day ? _day + "天" + _hour + "小时" : _hour + "小时";
    }
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("replenishWarn/areaList").then(res => {
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
      this.$http.get("replenishWarn/hotelList/" + areaId).then(res => {
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
    getreplenishWarn(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "/replenishWarn/list?pageNum=" +
        this.pageNum +
        "&pageSize=" +
        this.pageSize;
      for (let key in this.term) {
        if (this.term[key] || this.term[key] == "0") {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到数据信息");
          this.replenisherlist = [];
        } else {
          let _data = res.data.data;
          this.replenisherlist = _data;
        }
      });
    },
    getdetails(id) {
      this.$http.get("replenishWarn/details?equipId=" + id).then(res => {
        let _data = res.data;
        _data = _data.sort(this.compare("channelNo"));
        this.detailslist = _data;
      });
    },
    compare(property) {
      return function(a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
      };
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getreplenishWarn();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getreplenishWarn();
    },
    //打开编辑弹框
    openDialog(val) {
      this.centerDialogVisible = true;
    },
    //点击预警详情
    handlebut(obj) {
      this.getdetails(obj.equipId);
      this.centerDialogVisible = true;
    }
  },
  created() {
    this.getreplenishWarn();
  }
};
</script>

<style lang="less">
.apply_warning {
  .topleft {
    .el-input {
      width: 25%;
    }
  }
}
</style>

