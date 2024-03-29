<template>
  <div style="display: flex;padding: 20px;">
    <div style="width: 400px;border-right: 1px solid #ccc;padding-right: 20px;flex:none;">
      <el-button @click="$router.back()" style="margin-bottom: 10px;">返回</el-button>
      <div >接口名称</div>
      <el-input v-model="url"></el-input>

      <div style="margin-bottom: 20px;margin-top: 10px;">
        备注<el-input v-model="mark"></el-input>
      </div>
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="save">保存</el-button>
      </div>
      <div >关联表</div>
      <el-select
          v-model="tables"
          multiple
          filterable
          default-first-option
          @change="change"
          placeholder="请选择对应的表">
        <el-option
            v-for="item in tableOptions"
            :key="item"
            :label="item"
            :value="item">
        </el-option>
      </el-select>

      <div style="margin: 8px 0 ;">表标签</div>
      <el-select
          v-model="classAnntations"
          multiple
          filterable
          allow-create
          value-key="name"
          default-first-option
          @change="requestShowSQL"
          placeholder="请选择表标签">
        <el-option
            v-for="annotation in globalTableAnntation"
            :key="annotation.name"
            :label="annotation.name"
            :value="annotation">
          <span style="float: left">{{ annotation.name }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ annotation.label }}</span>
        </el-option>
      </el-select>

      <div v-for="item in classAnntations" style="margin-top: 8px;display: flex;align-items: center;">
        <div>
          <el-button type="primary" plain>标签</el-button>
          {{item.name}}
        </div>
        <div  style="margin-left: 8px;">
          <el-input @input="requestShowSQL" v-model="item.value"></el-input>
        </div>
      </div>

      <!--   结果   -->
      <div class="title">SQL展示</div>
      <el-input style="word-wrap: break-word;margin-top: 10px;" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" :model-value="showSQL"></el-input>
<!--      <div style="border: 1px solid #ccc;padding: 20px;word-wrap: break-word;margin-top: 10px;">{{ showSQL }}</div>-->
      <!--   模拟请求传参   -->
      <div class="title" style="padding-top: 10px;margin-top: 10px;border-top: 1px solid #ccc">
        模拟传参
        <el-button @click="requestCustom">请求</el-button>
      </div>
      <el-input
          v-model="testParams"
          type="textarea"
          :rows="6"
          @input="requestShowSQL"
          style="word-wrap: break-word;margin-top: 10px;"></el-input>
      <!--   结果   -->
      <div class="title">请求结果</div>
      <el-input style="word-wrap: break-word;margin-top: 10px;" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" :model-value="sqlRequestResult"></el-input>
    </div>

    <!-- 表单 -->
    <div v-for="(table, tableIndex) of showTableDetail" style="max-height: 800px;overflow: scroll;min-width: 300px;max-width: 400px;display: flex;flex-direction: column;margin: 0 20px;border-right: 1px solid #ccc;padding-right: 20px;">
      {{table.name}}
      <div style="color: #aaa;font-weight: bolder;text-align: center;font-size: 13px;width: 100%;">{{table.comment}}</div>

      <div style="min-height: 140px">
        <div class="title" style="font-size: 16px;margin: 10px 0;">
          表别称
          <el-input v-model="table.nickName" @input="requestShowSQL" placeholder="请输入(默认表名)"></el-input>
        </div>
        <div v-if="tableIndex != 0" class="title" @input="requestShowSQL"  style="font-size: 16px;margin: 10px 0;">
          自定义连表
          <el-input v-model="table.customAssociative" placeholder="请输入(默认全局连表)"></el-input>
        </div>
      </div>

      <div style="width: 100%;background: #ccc;height: 1px;margin: 20px 0;"></div>
      <div style="margin: 10px 0;">
        <el-button @click="clickSelectAll(table)">全选</el-button>
        <el-button @click="clickCancelAll(table)">取消选择</el-button>
        <el-button @click="clickCreate(table)">创建字段</el-button>
      </div>
      <div class="title">字段</div>
      <el-select
          v-model="table.value"
          multiple
          filterable
          allow-create
          value-key="name"
          default-first-option
          @change="changeFeild($event, table)"
          placeholder="请选择表字段">
        <el-option
            v-for="item in table.options"
            :key="item.label"
            :label="item.label"
            :value="item.value">
          <div style="float: left;margin-right: 4px">{{ item.label }}</div>
          <div style="color: #aaa;float: right;max-width: 100px"
          >{{ item.value.comment }}</div>
        </el-option>
        <el-option
            v-for="item in table.customOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value">
        </el-option>
      </el-select>

      <!-- 字段标签 -->
      <div v-for="field in table.value" style="margin-top: 20px;border: 1px solid #ccc;padding: 10px;">
        <div style="color: #337ecc;font-weight: bolder;text-align: center;font-size: 20px;">{{field.name}}</div>
        <div style="color: #ccc;font-weight: bolder;text-align: center;font-size: 16px;">{{handLineToHump(field.name)}}</div>
        <div style="color: #aaa;font-weight: bolder;text-align: center;font-size: 13px;width: 100%;">{{field.comment}}</div>
        <div style="display: flex;flex-direction: column">
          <el-select
              v-model="field.annotationAry"
              multiple
              filterable
              value-key="name"
              default-first-option
              @change="requestShowSQL"
              placeholder="请选择字段标签">
            <el-option-group v-for="(annotationGroup, index) in field.globalAnnotation" :key="index" :label="annotationGroup.groupName">
              <el-option
                  v-for="(annotation) in annotationGroup.annotationList"
                  :key="annotation.name"
                  :label="annotation.name"
                  :value="annotation"
              >
                <span style="float: left">{{ annotation.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ annotation.label }}</span>
              </el-option>
            </el-option-group>

          </el-select>
          <div v-for="item in field.annotationAry" style="margin-top: 8px;display: flex;align-items: center;flex-wrap: wrap;">
            <div style="color: #ffa60d;font-weight: bolder;font-size: 12px;">
<!--              <el-button type="primary" plain>启动</el-button>-->
              {{item.name}}
            </div>
            <div  style="margin-left: 8px;">
              <el-select multiple filterable v-if="item.name == 'SQLSelectExtend'" @change="requestShowSQL" v-model="item.value">
                <el-option
                    v-for="(extend) in SQLSelectExtend"
                    :key="extend.name"
                    :label="extend.name"
                    :value="extend.name"
                >
                  <span style="float: left">{{ extend.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ extend.annotate }}</span>
                </el-option>
              </el-select>
              <el-input
                  v-else-if="item.haveValue"
                  @input="requestShowSQL"
                  v-model="item.value"></el-input>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script >
import {format} from 'sql-formatter';

export default {


  data() {
    return {
      url: "",
      // 模拟请求
      testParams: "{\"id\":\"123\"}",
      sqlRequestResult: "",
      mark: "",
      classAnntations: [],
      SQLSelectExtend: [],
      globalTableAnntation: [
        {
          "name": "SQLEnd",
          "label": "自定义SQL结尾",
          "haveValue": true,
          "value": ""
        }
      ],
      globalAnnotation: [
        {
          groupName: "基础类标签",
          annotationList:  [
            {
              "name": "SQLIgnore",
              "label": "忽略",
              "value": ""
            },
          ]
        },
        {
          groupName: "链表类标签",
          annotationList:  [
            {
              "name": "SQLTableWhere",
              "label": "链表自定义查询",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLSelectCollection",
              "label": "应对表关系是一对多映射",
              "haveValue": true,
              "value": ""
            },
          ]
        },
        {
          groupName: "查询类标签",
          annotationList:  [
            {
              "name": "SQLSelectFieldNick",
              "label": "字段别名",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLSelectCustom",
              "label": "自定义查询字段",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLSelectExtend",
              "label": "查询字段扩展(封装方法)",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLSelectExtendVariable",
              "label": "配合上述使用,动态填入数据",
              "haveValue": true,
              "value": ""
            }
          ]
        },
        {
          groupName: "条件类标签",
          annotationList:          [
            {
              "name": "SQLUpdateWhere",
              "label": "自定义更新条件",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLWhereAllowNull",
              "label": "允许查询空或者null",
              "value": ""
            },
            {
              "name": "SQLWhereCustom",
              "label": "自定义条件字段",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLWhereCustomParams",
              "label": "上述标签参数",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLWhereEqual",
              "label": "查询条件'='",
              "value": ""
            },
            {
              "name": "SQLWhereIn",
              "label": "查询条件'in'",
              "value": ""
            },
            {
              "name": "SQLWhereNotEqual",
              "label": "查询条件'!='",
              "value": ""
            },
            {
              "name": "SQLWhereOrGroup",
              "label": "多条件or查询",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLWhereSymbol",
              "label": "自定义查询符号",
              "haveValue": true,
              "value": ""
            },
            {
              "name": "SQLWhereTimeRange",
              "label": "时间范围查询,命名格式(xxxxStart / xxxxEnd)",
              "value": ""
            },
            {
              "name": "SQLWhereRange",
              "label": "范围查询,命名格式(xxxxStart / xxxxEnd)",
              "value": ""
            }
          ]
        },
      ],
      showSQL: "",
      options: [],
      // 所有表选项
      tableOptions: [],
      // 所有表
      tables: [],
      // 展示表详细
      // 格式:
      // [{"name":"c_achievement","options":[],"customOptions":[],"value":[{"annotationAry":[{"name":"SQLTableNick","label":"引用表别名","haveValue":true,"value":""}],"name":"id","type":"String"}]}]
      showTableDetail: [
        // {
        //   "name": "c_achievement",
        //   "nickName": "",
        //   "options": [],
        //   "customOptions": [],
        //   "value": [
        //     {
        //       "annotationAry": [
        //         {
        //           "name": "SQLTableNick",
        //           "label": "引用表别名",
        //           "haveValue": true,
        //           "value": ""
        //         }
        //       ],
        //       "name": "id",
        //       "type": "String"
        //     }
        //   ]
        // }
      ],
      menuId: ""
    }
  },
  mounted() {
    const {id, menuId} = this.$route.query
    this.menuId = menuId
    this.id = id
    // this.id = 9
    if(this.id) this.requestDetail()

    this.requestGetAllTables()
    this.getSelectSQLExtends()


  },
  methods: {
    handLineToHump(name) {
      let arr = name.split('_');
      let result = '';
      let first = true;
      arr.forEach(ele => {
        if(first) {
          result = ele
          first = false
        } else {
          for(let i = 0; i < ele.length; i++) {
            let item = ele[i];
            if (i == 0) item = ele[i].toUpperCase()
            result = result + item;
          }
        }
      })
      return result;
    },
    getGlobalAnnotation(){
      return JSON.parse(JSON.stringify(this.globalAnnotation))
    },
    getSelectSQLExtends(){
      getRequest(window.baseURL + "/admin/getSelectSQLExtends").then(res => {
        this.SQLSelectExtend = res
      })
    },
    save() {
      this.requestSave()
    },
    // 表单->全选字段
    clickSelectAll(table){
      table.value = table.options.map(item=>item.value)
      this.requestShowSQL()
    },
    // 表单->取消所以字段
    clickCancelAll(table){
      table.value = []
      this.requestShowSQL()
    },
    // 表单->创建字段
    clickCreate(table){
      this.$prompt('请输入新的字段名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        $message({
          type: 'success',
          message: '你创建的是: ' + value
        });
        table.value.push({
          annotationAry: [],
          name: value,
          type: "String"
        })
        table.customOptions.push({
          label: value,
          value: {name: value}
        })
      }).catch(() => {
        $message({
          type: 'info',
          message: '取消输入'
        });
      });
    },

    // 0-1 获取详情
    requestDetail(){
      getRequest(window.baseURL + "/admin/detail/" + this.id).then(res => {
        this.url = res.url
        this.mark = res.mark
        this.testParams = res.testParams
        this.tables = JSON.parse(res.tables)
        this.showTableDetail = JSON.parse(res.tableDetail)
        if(res.classAnntations) this.classAnntations = JSON.parse(res.classAnntations)
        // 帮字段填入注解
        this.resetGlobalAnnotation()
        this.addCustomFeild()

        this.requestShowSQL()
      })
    },

    // 将字段填入注解
    resetGlobalAnnotation(){
      for(let table of this.showTableDetail){
        this.requestGetAllFieldsForTables(table)
        for(let item of table.value){
          item.globalAnnotation = this.getGlobalAnnotation()
        }
      }
    },

    // 将自定义字段填入选框列表
    addCustomFeild(){
      this.showTableDetail.forEach(table => {
        table.value.forEach(item => {
          if(item.isCustom) {
            table.options.push({
              value: item,
              label: item.name,
            })
          }
        })
      })
    },


    // 1.获取所有表格
    requestGetAllTables() {
      getRequest(window.baseURL + "/admin/getAllTables").then(res => {
        this.tableOptions = res
      })
    },

    // 2.修改关联表
    change(e) {
      // 判断是否新增表
      if (e.length > this.showTableDetail.length) {
        console.log("触发新增", e)
        let tableName = e[e.length - 1]
        let item = {
          name: tableName,
          options: [],
          customOptions: [],
          annotation: [],
          value: [],
        }
        this.showTableDetail.push(item)
        // 获取表注解
        this.getTableName(item)
        // 更新选项
        this.requestGetAllFieldsForTables(item)
      }
      // 删除
      else {
        this.showTableDetail = this.showTableDetail.filter((item) => e.includes(item.name));
      }
      this.requestShowSQL()
    },

    getTableName(item){
      getRequest(window.baseURL + "/admin/getTableCommit/" + item.name).then(res => {
        console.log(res.comment)
        item.comment = res.comment;
      })
    },

    // 3.获取表的所有字段
    requestGetAllFieldsForTables(item) {
      const params = {
        "table": item.name
      }
      postRequest(window.baseURL + "/admin/getAllFieldsForTables", params).then(res => {
        // 将表字段 转为 选项
        item.options = res.map(item => {
          let type = "String"
          switch (item.Type){
              // ID类型
            case "bigint":
              type = "bigint"
              break;
            // 布尔
            case "bit": break;
            // 时间
            case "datetime":
              type = "datetime"
              break;
              // 日期
            case "date":
              type = "date"
              break;
          }
          return {
            value: {
              annotationAry: [],
              globalAnnotation: this.getGlobalAnnotation(),
              name: item.Field,
              comment: item.COLUMN_COMMENT,
              type: type
            },
            label: item.Field,
          }
        })
        console.log("结果", item.options)
      })
    },

    // 3.1 选择字段
    changeFeild(e, table){
      console.log('字段',e, table);
      // 判断是否自定义字段
      const lastFeild = e[e.length - 1];
      if(typeof lastFeild == 'string'){
         const newFeild = {
          "isCustom": true,
          "annotationAry": [],
          "globalAnnotation": this.getGlobalAnnotation(),
          "name": lastFeild,
          "comment": "",
          "type": "String"
        }
        e[e.length - 1] = newFeild
        table.options.push({
          label: lastFeild,
          value: newFeild
        })
      }
      this.requestShowSQL();
    },

    // 4.获取生成的SQL
    requestShowSQL() {
      postRequest(window.baseURL + "/admin/show", {
        showTableDetail: this.filterData(this.showTableDetail),
        requestParams: JSON.parse(this.testParams)
      }).then(res => {
        if(typeof res == 'string'){
          this.showSQL = format(res)
        } else {
          this.showSQL = res.errorMsg
        }
      })
    },

    // 5. 发起请求
    requestCustom(){
      postRequest(window.baseURL + "/admin/simulateRequest", {
        showTableDetail: this.filterData(this.showTableDetail),
        requestParams: JSON.parse(this.testParams)
      }).then(res => {
        this.sqlRequestResult = JSON.stringify(res)
      })
    },

    // 6. 保存
    requestSave(){
      var params = {
        "url": this.url,
        "mark": this.mark,
        "testParams": this.testParams,
        "tables": JSON.stringify(this.tables),
        "tableDetail": this.filterData(this.showTableDetail),
        "classAnntations": JSON.stringify(this.classAnntations)
      }
      if(this.id) params.id = this.id;
      if(this.menuId) params.menuId = this.menuId;

      postRequest(window.baseURL + "/admin/save", params).then(res => {
        $message({
          message: '保存成功',
          type: 'success'
        });
        this.id = res
      })
    },

    filterData(showTableDetailOrg){
      let showTableDetail = JSON.parse(JSON.stringify(showTableDetailOrg))
      // debugger
      showTableDetail.forEach(table => {
        table.options = []
        // table.options.forEach(option => {
        //   option.globalAnnotation = {}
        //   option.value.globalAnnotation = {}
        // })
        table.value.forEach(item => {
          item.globalAnnotation = {}
        })
      })
      return JSON.stringify(showTableDetail)
    },


  }
}
</script>

<style>
.title{
  color: #337ecc;
  font-size:24px;
  font-weight: bolder;
}
</style>