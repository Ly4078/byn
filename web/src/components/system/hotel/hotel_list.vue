<template>
  <div class="hotel_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="term.name"
          placeholder="请输入酒店名称"
          @keyup.enter.native="gethotellist(1)"
          clearable
        ></el-input>
        <el-select v-model="term.type" clearable filterable placeholder="请选择类型">
          <el-option v-for="item in typelist" :key="item.id" :label="item.label" :value="item.id"></el-option>
        </el-select>
        <el-select v-model="term.status" clearable filterable placeholder="请选择类型">
          <el-option
            v-for="item in statuslist"
            :key="item.name"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="gethotellist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建酒店</el-button>
      </div>
    </div>
    <el-table
      :data="hotellist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="name" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="address" align="center" label="酒店地址"></el-table-column>
      <el-table-column prop="roomNo" align="center" label="房间数"></el-table-column>
      <el-table-column prop="contactName" align="center" label="联系人"></el-table-column>
      <el-table-column prop="contactTel" align="center" label="联系电话"></el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">{{scope.row.type | fitertype}}</template>
      </el-table-column>
      <el-table-column prop="serviceTel" align="center" label="客服电话"></el-table-column>
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
      <el-table-column fixed="right" label="操作" align="center" width="190">
        <template slot-scope="scope">
          <el-button
            :disabled="!scope.row.status"
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            @click="handleroom(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-menu"
          >房间</el-button>
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
      :title="disval==1?'创建酒店':'编辑酒店'"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      top="3%"
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
        <el-form-item label="酒店名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入酒店名称" maxlength="100" clearable></el-input>
        </el-form-item>
        <el-form-item label="酒店地址" prop="address">
          <el-input v-model="ruleForm.address" placeholder="请输入酒店地址" maxlength="200" clearable></el-input>
        </el-form-item>
        <el-form-item label="房间数" prop="roomNo">
          <el-input
            v-model="ruleForm.roomNo"
            placeholder="请输入房间数"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="ruleForm.contactName" placeholder="请输入联系人" maxlength="10" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactTel">
          <el-input
            v-model="ruleForm.contactTel"
            placeholder="请输入联系电话"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="客服电话" prop="serviceTel">
          <el-input
            v-model="ruleForm.serviceTel"
            placeholder="请输入"
            type="number"
            oninput="if(value.length>20)value=value.slice(0,20)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="所属区域" prop="areaId">
          <el-select v-model="ruleForm.areaId" clearable filterable placeholder="请选择所属区域">
            <el-option v-for="item in arealist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="酒店类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择酒店类型">
            <el-option v-for="item in typelist" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statuslist"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="ruleForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            clearable
          ></el-input>
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
var cheackNumber = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入房间数"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("房间数不应该是小于0"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          callback(new Error("房间数应该是一个正整数"));
        }
      }
    } else {
      callback(new Error("房间数应该是一个正整数"));
    }
  }, 100);
};

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
  name: "hotel_list",
  data() {
    return {
      disval: 1,
      total: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      centerDialogVisible: false,
      term: {
        type: "",
        name: "",
        status: ""
      },
      arealist: [],
      hotellist: [],
      statuslist: [
        {
          id: 1,
          label: "有效"
        },
        {
          id: 2,
          label: "作废"
        }
      ],
      typelist: [
        {
          id: 1,
          label: "学生"
        },
        {
          id: 2,
          label: "商务"
        },
        {
          id: 3,
          label: "情趣"
        },
        {
          id: 4,
          label: "主题"
        }
      ],
      ruleForm: {
        address: "",
        areaId: "",
        contactName: "",
        contactTel: "",
        id: "",
        name: "",
        remark: "",
        // replenishList: [],
        roomNo: "",
        serviceTel: "",
        status: "",
        type: ""
      },
      rules: {
        name: [{ required: true, message: "请输入酒店名称", trigger: "blur" }],
        address: [
          { required: true, message: "请输入酒店地址", trigger: "blur" }
        ],
        roomNo: [{ required: true, validator: cheackNumber, trigger: "blur" }],
        contactName: [
          { required: true, message: "请输入联系人", trigger: "blur" }
        ],
        contactTel: [
          { required: true, validator: checkPhone, trigger: "blur" }
        ],
        serviceTel: [
          { required: true, validator: checkPhone, trigger: "blur" }
        ],
        areaId: [
          { required: true, message: "请选择所属区域", trigger: "change" }
        ],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        status: [{ required: true, message: "请选择状态", trigger: "change" }]
      }
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        for (let key in this.ruleForm) {
          if (this.ruleForm[key]) {
            this.ruleForm[key] = "";
          }
        }
        this.actuserobj = {};
      }
    }
  },
  filters: {
    fiterstatus: function(val) {
      if (val == 1) {
        return "有效";
      } else {
        return "无效";
      }
    },
    fitertype: function(val) {
      if (val == 1) {
        return "学生";
      } else if (val == 2) {
        return "商务";
      } else if (val == 3) {
        return "情趣";
      } else if (val == 4) {
        return "主题";
      } else {
        return "其它";
      }
    }
  },
  methods: {
    //查询区域下拉列表
    getarealist() {
      this.$http.get("hotel/area").then(res => {
        this.arealist = res.data;
      });
    },
    //
    //查询列表数据
    gethotellist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "hotel?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key]) {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.$http.get(_Url).then(res => {
        let _data = res.data.data;
        for (let i in _data) {
          if (_data[i].status == 1) {
            _data[i].status = true;
          } else {
            _data[i].status = false;
          }
        }
        this.hotellist = _data;
        this.total = res.data.total;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.gethotellist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.gethotellist();
    },
    //修改状态
    changestatus(obj) {
      let _Url = "hotel/status",
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
          this.$message.success("修改成功");
        }
      });
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = !this.centerDialogVisible;
    },
    //点击编辑某条数据
    handleedit(obj) {
      if (this.arealist.length < 1) {
        this.getarealist();
      }
      this.getidinfo(obj.id);
      this.openDialog(2);
      this.actuserobj = obj;
    },
    //点击房间，进行某酒店房间列表
    handleroom(obj){
       this.$router.push({path: '/hotel/room/list', query: obj});
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("hotel/" + id).then(res => {
        let obj = res.data;
        obj.type = Number(obj.type);
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //保存
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.savedata();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //重置
    resetForm(formName) {
      if (this.actuserobj && this.actuserobj.id) {
        this.getidinfo(this.actuserobj.id);
      } else {
        this.$refs[formName].resetFields();
        this.ruleForm.remark = "";
      }
    },
    //保存编辑
    savedata() {
      let _Url = "hotel",
        _parms = {};
      for (let key in this.ruleForm) {
        if (this.ruleForm[key]) {
          _parms[key] = this.ruleForm[key];
        }
      }
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.gethotellist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.gethotellist();
          }
        });
      }
    }
  },
  created() {
    this.gethotellist();
  }
};
</script>

<style lang="less">
.hotel_list {
  .topleft {
      .el-input {
        width: 25%;
      }
    }
}
</style>