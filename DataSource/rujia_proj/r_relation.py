import xlrd
from py2neo import Graph,Node,Relationship

# 连接到 Neo4j 数据库
#graph = Graph("http://localhost:7474/browser", user="neo4j", password="aaaaaaaa", name="neo4j") #更改password、name
#graph = Graph("http://localhost:7474/", auth=("neo4j","aaaaaaaa"), name="neo4j") #更改password、name

graph = Graph("bolt://localhost:7687/", user="neo4j", password="aaaaaaaa", name="neo4j") #更改password、name
# 解析电子表格
# 创建表对象
xls_table = xlrd.open_workbook('./data_R.xls')
# 获取第一张sheet表
sheet = xls_table.sheet_by_index(0)  # 可根据索引获取第一张表[sheet1]的表对象
# 获取表名称
table_name = sheet.name
print(table_name)          # 结果 >>>Sheet1
# 获取表的总行数，后面可用做循环输出每一行数据
rows = sheet.nrows
print(rows)                # 结果 >>>5
# 获取表的总列数
cols = sheet.ncols
print(cols)                # 结果 >>>2
# 遍历表数据
for i in range(1,rows):
    # row_values()  根据索引以列表形式返回一行数据
    # 关系：
    sheet.row_values(0)[4]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[1])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(i)[4]), t)
    graph.merge(ht)