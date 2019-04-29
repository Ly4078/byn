<template>
  <div class="room_list mainboss">
    <div class="martop">
      <div class="topleft">
         <el-button icon="el-icon-d-arrow-left" circle @click="toback"></el-button>
        <el-input
          v-model="term.serialNo"
          placeholder="请输入房间编号"
          @keyup.enter.native="getroomlist(1)"
          clearable
        ></el-input>
        <el-select v-model="term.type" clearable filterable placeholder="请选择类型">
          <el-option v-for="item in typelist" :key="item.id" :label="item.label" :value="item.id"></el-option>
        </el-select>
        <el-cascader
          @focus="getarea"
          :placeholder="$route.query.name?$route.query.name:'选择区域酒店'"
          :show-all-levels="false"
          :options="options"
          filterable
          clearable
          @active-item-change="handleItemChange"
          @change="handlechange"
        ></el-cascader>
        <el-button type="primary" @click="getroomlist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建房间</el-button>
      </div>
    </div>
    <el-table
      :data="roomlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="hotelName" align="center" label="所属酒店"></el-table-column>
      <el-table-column prop="serialNo" align="center" label="房间编号"></el-table-column>
      <el-table-column align="center" label="房间类型">
        <template slot-scope="scope">{{scope.row.type | fitertype}}</template>
      </el-table-column>
      <el-table-column prop="area" align="center" label="房间面积（m2）"></el-table-column>
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
            :disabled="!scope.row.status"
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
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
      :title="disval==1?'创建房间':'编辑房间'"
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
        v-if="centerDialogVisible"
      >
        <el-form-item label="酒店名称" prop="hotelId">
          <el-cascader
            @focus="getarea"
            :placeholder="actuserobj.hotelName"
            :show-all-levels="false"
            :options="options"
            filterable
            clearable
            @active-item-change="handleItemChange"
            @change="handlechange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="房间编号" prop="serialNo">
          <el-input
            v-model="ruleForm.serialNo"
            placeholder="请输入房间编号"
            oninput="if(value.length>50)value=value.slice(0,50)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="房间面积" prop="area">
          <el-input
            v-model="ruleForm.area"
            placeholder="请输入房间面积（m2）"
            type="number"
            oninput="if(value.length>16)value=value.slice(0,16)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="房间类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择房间类型">
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
            maxlength="500"
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
    callback(new Error("请输入房间编号"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("房间编号应该是不能小于0"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          callback(new Error("房间编号应该是一个正整数"));
        }
      }
    } else {
      callback(new Error("房间编号应该是一个正整数"));
    }
  }, 100);
};
var cheackNumber2 = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入房间面积"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("房间面积不应该小于0"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          value += " ";
          if (value.indexOf(".") != -1) {
            let arr = value.split(".");
            if (arr[1].length > 3) {
              callback(new Error("房间面积最多有两位小数"));
            } else {
              callback();
            }
          }
        }
      }
    } else {
      callback(new Error("房间面积应该是一个大于数的数字"));
    }
  }, 100);
};
export default {
  name: "room_list",
  data() {
    return {
      disval: 1,
      total: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      centerDialogVisible: false,
      options: [],
      roomlist: [],
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
          label: "单人间"
        },
        {
          id: 2,
          label: "标准间"
        },
        {
          id: 3,
          label: "大床间"
        },
        {
          id: 4,
          label: "三人间"
        },
        {
          id: 5,
          label: "套间"
        }
      ],
      actuserobj: {},
      term: {
        type: "",
        serialNo: "",
        hotelId: ""
      },
      ruleForm: {
        area: "",
        hotelId: "",
        id: "",
        remark: "",
        serialNo: "",
        status: "",
        type: ""
      },
      rules: {
        hotelId: [{ required: true, message: "请选择酒店", trigger: "change" }],
        serialNo: [
          { required: true,  message: "请选择房间编号",  trigger: "blur" }
        ],
        area: [{ required: true, validator: cheackNumber2, trigger: "blur" }],
        type: [
          { required: true, message: "请选择房间类型", trigger: "change" }
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }]
      }
    };
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
        return "单人间";
      } else if (val == 2) {
        return "标准间";
      } else if (val == 3) {
        return "大床间";
      } else if (val == 4) {
        return "三人间";
      } else if (val == 5) {
        return "套间";
      } else {
        return "其它";
      }
    }
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        for (let key in this.ruleForm) {
          this.ruleForm[key] = "";
        }
        this.actuserobj = {};
      }
    }
  },
  methods: {
    toback(){
      this.$router.push({path: '/hotel/list', query: {}})
    },
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("room/areaList").then(res => {
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
      this.$http.get("room/hotelList/" + areaId).then(res => {
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
    //查询列表数据
    getroomlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "room?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
        this.roomlist = _data;
        this.total = res.data.total;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getroomlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getroomlist();
    },
    //修改用户状态
    changestatus(obj) {
      let _Url = "room/status",
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
      this.getidinfo(obj.id);
      this.openDialog(2);
      this.actuserobj = obj;
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("room/" + id).then(res => {
        let obj = res.data;
        this.actuserobj.children=obj;
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
        // this.ruleForm.hotelId = this.actuserobj.hotelName;
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
      let _Url = "room",
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
            this.getroomlist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getroomlist();
          }
        });
      }
    }
  },
  created() {
    if(this.$route.query && this.$route.query.id){
      this.term.hotelId=this.$route.query.id;
    }
    this.getroomlist();
  }
};
</script>

<style lang="less">
.room_list {
  .topleft {
      .el-input {
        width: 25%;
      }
    }
}
</style>