<template>
  <div class="store_list mainboss">
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
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建库存</el-button>
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
      <el-table-column prop="total" align="center" label="商品总数"></el-table-column>
      <el-table-column prop="currentStock" align="center" label="当前库存"></el-table-column>
      <el-table-column prop="securityStock" align="center" label="安全库存"></el-table-column>
      <el-table-column prop="salePrice" align="center" label="销售价格"></el-table-column>
      <el-table-column align="center" label="当前状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            @change="changestatus(scope.row)"
            active-text
            inactive-text
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="remark" align="center" label="备注"></el-table-column>
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
            :disabled="!scope.row.status"
            @click="handledel(scope.row)"
            type="danger"
            size="mini"
            icon="el-icon-delete"
          >删除</el-button>
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
      :title="disval==1?'创建库存':'编辑库存'"
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
        v-show="disval==1 || disval==2"
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
        <el-form-item label="商品名称" prop="goodsId">
          <el-select
            v-model="actuserobj.goodsName"
            clearable
            filterable
            @focus="getgoodsList"
            @change="handlechangesel"
          >
            <el-option
              v-for="item in goodsList"
              :key="item.value"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="销售价格" prop="salePrice">
          <el-input
            v-model="ruleForm.salePrice"
            placeholder="请输入销售价格"
            type="number"
            oninput="if(value.length>10)value=value.slice(0,10)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="商品总数" prop="total">
          <el-input
            v-model="ruleForm.total"
            placeholder="请输入商品总数"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="当前库存" prop="currentStock">
          <el-input
            v-model="ruleForm.currentStock"
            placeholder="请输入当前库存"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="安全库存" prop="securityStock">
          <el-input
            v-model="ruleForm.securityStock"
            placeholder="请输入安全库存"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态">
            <el-option v-for="item in typelist" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="ruleForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            oninput="if(value.length>500)value=value.slice(0,500)"
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
var checkEmail = (rule, value, callback) => {
  const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  if (!value) {
    return callback(new Error("邮箱不能为空"));
  }
  setTimeout(() => {
    if (mailReg.test(value)) {
      callback();
    } else {
      callback(new Error("请输入正确的邮箱格式"));
    }
  }, 100);
};
var cheackNumber = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入一个数字"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("请输入一个大于0的数字"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          callback(new Error("请输入一个正整数"));
        }
      }
    } else {
      callback(new Error("请输入一个数字"));
    }
  }, 100);
};
var cheackNumber2 = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入销售价格"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("销售价格应该大于0"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          value += " ";
          if (value.indexOf(".") != -1) {
            let arr = value.split(".");
            if (arr[1].length > 3) {
              callback(new Error("价格最多有两位小数"));
            } else {
              callback();
            }
          }
        }
      }
    } else {
      callback(new Error("销售价格应该是一个大于0的数字"));
    }
  }, 100);
};
export default {
  name: "store_list",
  data() {
    return {
      total: 0,
      ptotal: 0,
      disval: 1,
      pageNum: 1,
      pageSize: 15,
      username: "",
      loading: false,
      centerDialogVisible: false,
      term: {
        goodsId: "",
        hotelId: ""
      },
      actuserobj: {},
      ruleForm: {
        currentStock: "",
        goodsId: "",
        hotelId: "",
        id: "",
        remark: "",
        salePrice: "",
        securityStock: "",
        status: "",
        total: ""
      },
      rules: {
        goodsId: [{ required: true, message: "请选择商品", trigger: "change" }],
        hotelId: [{ required: true, message: "请选择酒店", trigger: "change" }],
        salePrice: [
          { required: true, validator: cheackNumber2, trigger: "blur" }
        ],
        securityStock: [
          { required: true, validator: cheackNumber, trigger: "blur" }
        ],
        currentStock: [
          { required: true, validator: cheackNumber, trigger: "blur" }
        ],
        total: [{ required: true, validator: cheackNumber, trigger: "blur" }],
        email: [{ required: true, validator: checkEmail, trigger: "blur" }],
        status: [
          { required: true, message: "请选择用户类型", trigger: "change" }
        ]
      },
      rolelist: [],
      typelist: [
        {
          id: 1,
          label: "有效"
        },
        {
          id: 0,
          label: "无效"
        }
      ],
      options: [],
      hotellist: [],
      goodsList: [],
      storelist: []
    };
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
    handlechangesel(val) {
      this.ruleForm.goodsId = val;
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
      let _Url = "store?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
          this.storelist = _data;
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
    //删除某条数据
    handledel(obj) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("store/" + obj.id).then(res => {
            this.$message.success("修改成功");
            this.getstorelist();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("store/" + id).then(res => {
        let obj = res.data;
        this.actuserobj.children = obj;
        obj.remark = obj.remark ? obj.remark : "";
        // Number(obj.status)
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //修改用户状态
    changestatus(obj) {
      let _Url = "store/status",
        _parms = {
          status: "",
          id: obj.id
        };
      if (obj.status) {
        _parms.status = 1;
      } else {
        _parms.status = 2;
      }
      this.$http.put(_Url, _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("修改成功");
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
      let _Url = "store",
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
            this.getstorelist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getstorelist();
          }
        });
      }
    }
  },
  created() {
    this.getstorelist();
  }
};
</script>

