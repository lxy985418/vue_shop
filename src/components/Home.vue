<template>
  <el-container class="home-container">
<!--    头部-->
    <el-header>
      <div>
        <img src  ="../assets/u=2471723103,4261647594&fm=26&gp=0.jpg" class="img-size">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
<!--    主体部分-->
    <el-container>
<!--      侧边栏-->
      <el-aside :width="isCollapse? '64px': '200px'">
        <div class="toggle-button" @click="togglaCollapse">|||</div>
<!--        侧边菜单栏-->
        <el-menu background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF" :unique-opened="true" :collapse=isCollapse
                 :collapse-transition="false" :router="true" default-active=$route.path >
<!--          :unique-opened="true" :表示变量 如果将一个Boolean改为true 也可以写成unique-opened-->
<!--          一级菜单-->
          <el-submenu :index="item.id + ' '" v-for="item in menuList" :key="item.id">
<!--            一级菜单模板区域-->
            <template slot="title">
<!--              图标-->
              <i :class="iconsObj[item.id]"></i>
<!--              文本-->
              <span>{{item.authName}}</span>
            </template>
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <template slot="title">
                  <!--              图标-->
                  <i class="el-icon-menu"></i>
                  <!--              文本-->
                  <span>{{subItem.authName}}</span>
                </template></el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>
<!--      右边主体部分-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created () {
    this.getMenuList()
  },
  data () {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false
    }
  },
  methods: {
    loginOut () {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    togglaCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang='less' scoped>
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 150px;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main{
  background-color: #EAEDF1;
}
.home-container{
  height: 100%;
}
.img-size{
  width: 56px;
  height: 56px;
  border-radius: 50%;
/*  将头像变圆*/
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background-color: #4A5064;
  font-size: 15px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
/*  字体间距*/
  cursor: pointer;
/*  鼠标变成小手*/
}
</style>
