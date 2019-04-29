<template>
  <div class="storelog_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-select
          v-model="term.goodsId"
          clearable
          filterable
          placeholder="请选择商品"
          @focus="getgoodsList"
        >
          <el-option
            v-for="item in goodsList"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          ></el-option>
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
        <el-button type="primary" @click="getstorelist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="storelist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="goodsName" align="center" label="商品名称"></el-table-column>
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="detail" align="center" label="详情"></el-table-column>
      <el-table-column prop="createTime" align="center" label="操作时间"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{scope.row.status=='0'?'添加':scope.row.status=='1'?'修改':'删除'}}</template>
      </el-table-column>
      <el-table-column prop="trueName" align="center" label="操作人"></el-table-column>
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
  </div>
</template>

<script>
export default {
  name: "storeloglist",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      term: {
        goodsId: "",
        hotelId: ""
      },
      options: [],
      goodsList: [],
      storelist: []
    };
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("store/areaList").then(res => {
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
      this.$http.get("store/hotelList/" + areaId).then(res => {
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
    getgoodsList() {
      if (this.goodsList.length < 1) {
        this.$http.get("store/goodsList").then(res => {
          this.goodsList = res.data;
        });
      }
    },
    //获取列表数据
    getstorelist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "store/logList?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
          this.storelist = [];
        } else {
          let _data = res.data.data;
          for (let i in _data) {
            if (_data[i].status == 1) {
              _data[i].status = true;
            } else {
              _data[i].status = false;
            }
          }
          this.storelist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getstorelist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getstorelist();
    }
  },
  created() {
    this.getstorelist();
  }
};
</script>


