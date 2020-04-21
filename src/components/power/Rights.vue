<template>
 <div>
   <!--  面包屑导航区域-->
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>权限管理</el-breadcrumb-item>
     <el-breadcrumb-item>权限列表</el-breadcrumb-item>
   </el-breadcrumb>
   <el-card>
     <el-table :data="rightList" border stripe>
     <el-table-column type="index" label="序号" width="50"></el-table-column>
     <el-table-column label="权限名称" prop="authName"></el-table-column>
     <el-table-column label="路径" prop="path"></el-table-column>
     <el-table-column label="权限等级" prop="level">
       <template slot-scope="scope">
         <el-tag v-if="scope.row.level === '0'">一级</el-tag>
         <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
         <el-tag type="danger"  v-if="scope.row.level === '2'">三级</el-tag>
       </template>
     </el-table-column>
     </el-table>
   </el-card>
 </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightList: []
    }
  },
  created () {
    this.getRightList()
  },
  methods: {
    async getRightList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) this.$message.error('获取权限列表失败')
      this.$message.success('获取权限列表成功')
      this.rightList = res.data
    //  返回数据中已经返回已更新的数据状态
    }
  }
}
</script>

<style lang="less" scoped>

</style>
