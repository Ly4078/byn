
<template>
  <div class="goods_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="name"
          placeholder="请输入商品名称"
          @keyup.enter.native="getgoodslist(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getgoodslist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建商品</el-button>
      </div>
    </div>
    <el-table
      :data="goodslist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="name" align="center" label="商品名称" maxlength="100"></el-table-column>
      <el-table-column prop="thumb" align="center" label="商品图片">
        <template slot-scope="scope">
          <img class="thumbimg" :src="$GLOBAL.API+scope.row.thumb" alt="商品图片">
        </template>
      </el-table-column>
      <el-table-column
        prop="originPrice"
        align="center"
        label="商品原价"
        type="number"
        oninput="if(value.length>10)value=value.slice(0,10)"
      ></el-table-column>
      <el-table-column
        prop="salePrice"
        align="center"
        label="销售价格"
        type="number"
        oninput="if(value.length>10)value=value.slice(0,10)"
      ></el-table-column>
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
       <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope" >
          <el-button
            :disabled="!scope.row.status"
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            :disabled="!scope.row.status"
            @click="handlebanner(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >轮播图</el-button>
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
      :title="disval==3?'编辑轮播图':disval==1?'创建商品':'编辑商品'"
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
        v-show="disval !=3"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入商品名称" maxlength="100" clearable :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="商品子标题" prop="remark">
          <el-input v-model="ruleForm.remark" placeholder="请输商品子标题" maxlength="500" clearable></el-input>
        </el-form-item>
        <el-form-item label="商品图片" prop="files">
          <el-upload
            class="upload-demo"
            action="#"
            :before-upload="onBeforeUpload"
            :on-change="onchange"
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="fileList"
            list-type="picture-card"
          >
            <el-button size="mini" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过300kb</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品原价" prop="originPrice">
          <el-input
            v-model="ruleForm.originPrice"
            placeholder="商品原价"
            type="number"
            oninput="if(value.length>10)value=value.slice(0,10)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="销售价格" prop="salePrice">
          <el-input
            v-model="ruleForm.salePrice"
            placeholder="销售价格"
            type="number"
            oninput="if(value.length>10)value=value.slice(0,10)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="商品简介">
          <el-input
            v-model="ruleForm.intro"
            type="textarea"
            :rows="2"
            placeholder="请输入商品简介"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>

      <el-button type="primary" @click="innerVisible = true" v-show="disval ==3">添加轮播图</el-button>
      <el-dialog width="30%" title="添加轮播图" :visible.sync="innerVisible" append-to-body>
        <el-form
          :model="uploadForm"
          :rules="uploadrules"
          ref="uploadForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="商品图片" prop="file">
            <el-upload
              class="upload-demo"
              action="#"
              :before-upload="onBeforeUpload"
              :on-change="onchange"
              :on-remove="handleRemove"
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="fileList"
              list-type="picture-card"
            >
              <el-button size="mini" type="primary">添加轮播图</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过300kb</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="序号" prop="sort">
            <el-input v-model="uploadForm.sort" placeholder="商品原价" type="number" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('uploadForm')">确认保存</el-button>
            <el-button @click="innerVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-table
        :data="bannerlist"
        border
        style="width: 100%"
        v-loading="loading"
        element-loading-background="rgba(0, 0, 0, 0.5)"
        element-loading-text="数据正在加载中"
        v-show="disval ==3"
      >
        <el-table-column prop="thumb" align="center" label="商品图片">
          <template slot-scope="scope">
            <img class="thumbimg" :src="$GLOBAL.API+scope.row.bannerPath" alt="商品图片">
          </template>
        </el-table-column>
        <el-table-column prop="originPrice" align="center" label="状态">
          <template slot-scope="scope">{{scope.row.id?'已上传':''}}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              @click="handlelbdel(scope.row)"
              type="primary"
              size="mini"
              icon="el-icon-edit"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
var cheackNumber = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("1请输入一个数字"));
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
      callback(new Error("2请输入一个数字"));
    }
  }, 100);
};
var cheackNumber2 = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入价格"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("价格应该大于0"));
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
      callback(new Error("价格应该是一个大于数的数字"));
    }
  }, 100);
};
export default {
  name: "goods_list",
  data() {
    return {
      disval: 1,
      total: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      innerVisible: false,
      centerDialogVisible: false,
      name: "",
      goodslist: [],
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
      fileList: [],
      bannerlist: [],
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
      uploadForm: {
        file: null,
        goodsId: "",
        sort: ""
      },
      uploadrules: {
        files: [{ required: true, message: "请选择商品图片", trigger: "blur" }],
        sort: [{ required: true, validator: cheackNumber, trigger: "blur" }]
      },
      ruleForm: {
        id: "",
        intro: "",
        name: "",
        originPrice: "",
        remark: "",
        salePrice: "",
        status: "",
        thumb: "",
        file: null
      },
      rules: {
        name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
        intro: [{ required: true, message: "请输入商品简介", trigger: "blur" }],
        originPrice: [
          { required: true, validator: cheackNumber2, trigger: "blur" }
        ],
        salePrice: [
          { required: true, validator: cheackNumber2, trigger: "blur" }
        ],
        remark: [
          { required: true, message: "请输商品子标题", trigger: "blur" }
        ],
        file: [{ required: true, message: "请选择商品图片", trigger: "blur" }]
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
      this.fileList = [];
      if (!this.centerDialogVisible) {
        if (this.ruleForm && this.ruleForm.name) {
          for (let key in this.ruleForm) {
            this.ruleForm[key] = "";
          }
          this.ruleForm.file = null;
          this.actuserobj = {};
        }
      }
    },
    innerVisible: function() {
      this.fileList = [];
      if (!this.innerVisible) {
        for (let key in this.uploadForm) {
          this.uploadForm[key] = "";
        }
        this.uploadForm.files = null;
      }
    }
  },
  methods: {
    //查询列表数据
    getgoodslist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "goods?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      if (this.name) {
        _Url += "&name=" + this.name;
      }
      this.$http.get(_Url).then(res => {
        let _data = res.data.data;
        for (let i in _data) {
          if (_data[i].status == 2) {
            _data[i].status = true;
          } else if (_data[i].status == 3) {
            _data[i].status = false;
          }
        }
        this.goodslist = _data;
        this.total = res.data.total;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getgoodslist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getgoodslist();
    },
    //修改用户状态
    changestatus(obj) {
      let _Url = "goods/status",
        _parms = {},
        newObj = {};
      newObj = JSON.parse(JSON.stringify(obj));
      newObj.status = newObj.status ? 2 : 3;
      _parms = {
        status: newObj.status,
        id: obj.id
      };
      this.$http.put(_Url, _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("修改成功");
          this.getgoodslist();
        }
      });
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = !this.centerDialogVisible;
      this.uploadData = {};
    },
    //点击编辑某条数据
    handleedit(obj) {
      this.getidinfo(obj.id);
      this.openDialog(2);
      this.actuserobj = obj;
    },
    //点击某条数据轮播图
    handlebanner(obj) {
      this.openDialog(3);
      this.actuserobj = obj;
      this.uploadForm.goodsId = obj.id;
      this.getbannerlist(obj.id);
    },
    getbannerlist(id) {
      this.$http.get("goods/banner?id=" + id).then(res => {
        res.data.sort(function(a, b) {
          if (a.sort < b.sort) {
            return -1;
          } else if (a.sort > b.sort) {
            return 1;
          }
          return 0;
        });
        this.bannerlist = res.data;
      });
    },
    //操作某个轮播图数据
    handlelbdel(obj) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("goods/banner/" + obj.id).then(res => {
            this.$message.success("修改成功");
            this.getbannerlist(this.actuserobj.id);
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
      this.$http.get("goods/" + id).then(res => {
        let obj = res.data;
        let arr = obj.thumb.split("/");
        let fileobj = {
          name: arr[arr.length - 1],
          url: this.$GLOBAL.API + obj.thumb
        };
        if (this.disval != 3) {
          this.fileList = [];
          this.fileList.push(fileobj);
        }
        obj.intro = obj.intro ? obj.intro : "";
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
          if (this.disval != 3) {
            this.savedata();
          } else {
            this.savebanner();
          }
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
        this.ruleForm.intro = "";
      }
    },
    //保存编辑
    savedata() {
      let _Url = "goods",
        _parms = {};
      for (let key in this.ruleForm) {
        if (this.ruleForm[key]) {
          _parms[key] = this.ruleForm[key];
        }
      }
      const formData = new FormData();
      Object.keys(_parms).forEach(key => formData.append(key, _parms[key]));
      _parms = formData;
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getgoodslist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getgoodslist();
          }
        });
      }
    },
    //保存上传轮播图
    savebanner() {
      let _Url = "goods/banner",
        _parms = {};
      for (let key in this.uploadForm) {
        if (this.uploadForm[key]) {
          _parms[key] = this.uploadForm[key];
        }
      }
      const formData = new FormData();
      Object.keys(_parms).forEach(key => formData.append(key, _parms[key]));
      _parms = formData;
      this.$http.post(_Url, _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("保存成功");
          this.getbannerlist(this.actuserobj.id);
          this.innerVisible = !this.innerVisible;
        }
      });
    },
    // 图片上传 start
    //文件上传之前检查文件格式和文件大小
    onBeforeUpload(file) {
      const isIMAGE = file.type === "image/jpeg" || "image/jpg" || "image/png";
      const isLt300kb = file.size / 1024 < 300;
      if (!isIMAGE) {
        this.$message.error("上传文件只能是图片格式!");
      } else if (!isLt300kb) {
        this.$message.error("上传文件大小不能超过 300kb!");
      } else {
        if (this.disval != 3) {
          this.ruleForm.file = file;
        } else {
          this.uploadForm.file = file;
        }
      }
      return isIMAGE && isLt300kb;
    },
    //当上传图片后，调用onchange方法，获取图片本地路径
    onchange(file, fileList) {
      let fileobj = {
        name: file.name,
        url: file.url,
        isupload: 1
      };
      this.fileList = [];
      this.fileList.push(fileobj);
    },
    //文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      this.fileList = [];
      if (this.disval != 3) {
        this.ruleForm.file = null;
      } else {
        this.uploadForm.file = null;
      }
    },
    //文件超出个数限制时的钩子
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    }
    // 图片上传  end
  },
  created() {
    this.getgoodslist();
  }
};
</script>

<style lang="less">
.goods_list {
  .topleft {
      .el-input {
        width: 70%;
      }
    }
  .el-pagination {
    float: left;
  }
  .thumbimg {
    width: 100px;
    height: 100px;
  }
}
</style>