
<template>
  <div class="apply_part mainboss">
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
        <el-input
          v-model="term.trueName"
          placeholder="请输入姓名"
          @keyup.enter.native="getreplenisherlist(1)"
          clearable
        ></el-input>
        <el-input
          v-model="term.username"
          placeholder="请输入联系方式"
          @keyup.enter.native="getreplenisherlist(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getreplenisherlist(1)">搜索</el-button>
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
      <el-table-column prop="trueName" align="center" label="姓名"></el-table-column>
      <el-table-column prop="username" align="center" label="联系电话"></el-table-column>
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="createTime" align="center" label="创建时间"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            @change="changestatus(scope.row)"
            active-text
            inactive-text
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            @click="handlebut(scope.row)"
            :disabled="!scope.row.status"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >酒店分配</el-button>
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
      title="分配酒店"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="50%"
      center
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="姓名">
          <el-input v-model="ruleForm.trueName" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="ruleForm.createTime" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item label="酒店名称" v-show="ruleForm.hotelName">
          <el-input v-model="ruleForm.hotelName" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item label="新绑定酒店" prop="hotelId">
          <!-- <el-select v-model="ruleForm.hotelId" clearable filterable placeholder="请选择酒店">
            <el-option v-for="item in hotellist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select> -->
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
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="ruleForm.createTime" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
var checkPhone = (rule, value, callback) => {
  const tel = /^0\d{2,3}-?\d{7,8}$/;
  const phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  if (!value) {
    return callback(new Error("电话号码不能为空"));
  }
  setTimeout(() => {
    if (!Number.isInteger(+value)) {
      callback(new Error("请输入数字值"));
    } else {
      if (tel.test(value)) {
        callback();
      } else if (phone.test(value)) {
        callback();
      } else {
        callback(new Error("电话号码格式不正确"));
      }
    }
  }, 100);
};
export default {
  name: "apply_part",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      supplierName: "",
      centerDialogVisible: false,
      ruleForm: {
        hotelId: ""
      },
      rules: {
        hotelId: [{ required: true, message: "请选择酒店", trigger: "change" }]
      },
      term: {
        hotelId: "",
        username: "",
        trueName: "",
        status: "1"
      },
      replenisherlist: [],
      options:[],
      hotellist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        this.ruleForm.hotelId = "";
      }
    }
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
      if (this.centerDialogVisible) {
        this.ruleForm.hotelId = val[1];
      } else {
        this.term.hotelId = val[1];
      }
    },
    //获取列表数据
    getreplenisherlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "/replenisher?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
          for (let i in _data) {
            if (_data[i].status == 1) {
              _data[i].status = true;
            } else {
              _data[i].status = false;
            }
          }
          this.replenisherlist = _data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getreplenisherlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getreplenisherlist();
    },
    //修改状态
    changestatus(obj) {
      let _Url = "replenisher/status",
        _parms = {
          status: "",
          id: obj.id
        };
      if (obj.status) {
        _parms.status = 1;
      } else {
        _parms.status = 0;
      }
      this.$http.put(_Url, _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("操作成功");
        }
      });
    },
    //打开编辑弹框
    openDialog(val) {
      this.centerDialogVisible = true;
    },
    //点击分配酒店
    handlebut(obj) {
      for (let key in obj) {
        this.ruleForm[key] = obj[key];
      }
      this.centerDialogVisible = true;
    },
    //分配酒店
    handleby() {
      let _Url = "replenisher/update",
        _parms = { id: this.ruleForm.id };
      if (this.ruleForm.hotelId) {
        _parms.hotelId = this.ruleForm.hotelId;
      }
      this.$http.put(_Url, _parms).then(res => {
        this.$message.success("操作成功");
        this.getreplenisherlist();
        this.centerDialogVisible = false;
      });
    },
    //点击确认按钮，表单校验
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.handleby();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //重置
    resetForm(formName) {
      this.ruleForm.hotelId = "";
      //   this.$refs[formName].resetFields();
    }
  },
  created() {
    this.getreplenisherlist();
  }
};
</script>

<style lang="less">
.apply_part {
  .topleft {
      .el-input {
        width: 25%;
      }
    }
}
</style>

