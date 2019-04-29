
<template>
  <div class="area_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="areaName"
          placeholder="请输入区域名称"
          @keyup.enter.native="getarea(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getarea(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建区域</el-button>
      </div>
    </div>
    <el-table
      :data="arealist"
      :height="this.$store.state.tableHeight"
      border
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
      style="width: 100%"
    >
      <el-table-column prop="name" align="center" label="区域名称"></el-table-column>
      <!-- <el-table-column prop="seq" align="center" label="排序"></el-table-column> -->
      <el-table-column prop="hotelNo" align="center" label="酒店数量"></el-table-column>
      <el-table-column prop="roomNo" align="center" label="房间数量"></el-table-column>
      <!-- <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{scope.row.status | filterstatus}}</template>
      </el-table-column>-->
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
      <el-table-column fixed="right" label="操作" align="center" width="200">
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
      :title="disval==1?'创建区域':'编辑区域'"
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
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入区域名称" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item label="上级区域" prop="parentId">
          <el-select v-model="ruleForm.parentId" clearable filterable placeholder="请选择上级区域">
            <el-option
              v-for="item in parentmenulist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="seq">
          <el-input
            v-model="ruleForm.seq"
            placeholder="请输入排序序号"
            type="number"
            oninput="if(value.length>11)value=value.slice(0,11)"
            clearable
          ></el-input>
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
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            v-model="ruleForm.remark"
            maxlength="100"
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
export default {
  name: "perlist",
  data() {
    return {
      total: 0,
      disval: 1,
      pageNum: 1,
      pageSize: 15,
      areaName: "",
      loading: false,
      centerDialogVisible: false,
      checkList: [],
      arealist: [],
      arealist: [],
      actuserobj: {},
      statuslist: [
        {
          id: 1,
          label: "有效"
        },
        {
          id: 2,
          label: "无效"
        }
      ],
      parentmenulist: [],
      ruleobj: {},
      ruleForm: {
        name: "",
        parentId: "",
        remark: "",
        seq: "",
        status: ""
      },
      rules: {
        name: [{ required: true, message: "请输入区域名称", trigger: "blur" }],
        parentId: [
          { required: true, message: "请输入角色code", trigger: "blur" }
        ],
        seq: [{ required: true, message: "请输入角色code", trigger: "blur" }],
        status: [{ required: true, message: "请输入角色code", trigger: "blur" }]
      }
    };
  },
  filters: {
    filterstatus(val) {
      if (val == 1) {
        return "有效";
      } else {
        return "无效";
      }
    }
  },
  watch: {
    centerDialogVisible: function() {
      if (this.centerDialogVisible) {
        this.CurrentChange(1);
      } else {
        for (let key in this.ruleForm) {
          this.ruleForm[key] = "";
        }
        this.actuserobj = {};
      }
    }
  },
  methods: {
    //获取列表数据
    getarea(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "area?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      if (this.areaName) {
        _Url += "&name=" + this.areaName;
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.areaName = "";
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.arealist = [];
        } else {
          let _data = res.data.data;
          for (let i in _data) {
            if (_data[i].status == 1) {
              _data[i].status = true;
            } else {
              _data[i].status = false;
            }
          }
          this.arealist = _data;
        }
      });
    },
    //模态框翻页
    CurrentChange(val) {
      let _Url = "area/parent?pageNum=" + val + "&pageSize=10";
      this.$http.get(_Url).then(res => {
        this.parentmenulist = res.data;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getarea();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getarea();
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = true;
    },
    //点击编辑某条数据
    handleedit(obj) {
      // this.ruleForm = obj;
      for (let key in obj) {
        if (obj[key]) {
          this.ruleForm[key] = obj[key];
        }
      }
      this.actuserobj = obj;
      this.getidinfo(obj.id);
      this.openDialog(2);
    },
    //修改用户状态
    changestatus(obj) {
      let _Url = "area/status",
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
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("area/" + id).then(res => {
        let obj = res.data;
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
      let _Url = "area",
        _parms = {};
      for (let key in this.ruleForm) {
        // if (this.ruleForm[key]) {
        _parms[key] = this.ruleForm[key];
        // }
      }
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getarea();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getarea();
          }
        });
      }
    }
  },
  created() {
    this.getarea();
  }
};
</script>
<style lang="less" scoped>
.area_list {
  .topleft {
    .el-input {
      width: 70%;
    }
  }
}
</style>

