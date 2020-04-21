<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域-->
    <el-card class="box-card">
      <el-row :gutter="40">
        <el-col :span="5">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query" clearable
                    @clear="getList">
            <el-button slot="append" icon="el-icon-search" @click="searchOrder"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <div>
        <el-table :data="ordersList" border stripe>
          <el-table-column type="index" width="80px"></el-table-column>
          <el-table-column label="订单编号" prop="order_number"></el-table-column>
          <el-table-column label="订单价格(元)" prop="order_price" width="95px"></el-table-column>
          <el-table-column label="是否付款" prop="order_pay" width="100px">
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send" width="100px"></el-table-column>
          <el-table-column label="创建时间" prop="create_time" width="160px">
            <template slot-scope="scope">
              {{scope.row.create_time | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
            <template slot-scope="">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
              <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--   current-page当前展示第几页 -->
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="30%"
    @close="editDialogVisibleClose">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      ordersList: [],
      // 总数据条数
      total: 0,
      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getList()
  },
  methods: {
    async getList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.$message.success('获取订单列表成功')
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getList()
    },
    searchOrder () {
      this.queryInfo.pagenum = 1
      this.getList()
    },
    showBox () {
      this.editDialogVisible = true
    },
    editDialogVisibleClose () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }

      this.progressInfo = res.data

      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>

<style scoped>
  @import '../../plugins/timeline/timeline.css';
  @import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
