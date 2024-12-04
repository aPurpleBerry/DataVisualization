import xlrd
from py2neo import Graph,Node,Relationship

# 连接到 Neo4j 数据库
#graph = Graph("http://localhost:7474/browser", user="neo4j", password="aaaaaaaa", name="neo4j") #更改password、name
#graph = Graph("http://localhost:7474/", auth=("neo4j","aaaaaaaa"), name="neo4j") #更改password、name

graph = Graph("bolt://localhost:7687/", user="neo4j", password="aaaaaaaa", name="neo4j") #更改password、name
# 解析电子表格
# 创建表对象
xls_table = xlrd.open_workbook('./1-100 names.xls')
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
    # 第一种关系：
    sheet.row_values(0)[1]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[1])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[1]), t)
    graph.merge(ht)

    # 第2种关系：
    sheet.row_values(0)[2]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[2])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[2]), t)
    graph.merge(ht)

    # 第3种关系：
    sheet.row_values(0)[3]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[3])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[3]), t)
    graph.merge(ht)

    # 第4种关系：
    sheet.row_values(0)[4]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[4])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[4]), t)
    graph.merge(ht)

    # 第5种关系：
    sheet.row_values(0)[5]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[5])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[5]), t)
    graph.merge(ht)

    # 第6种关系：
    sheet.row_values(0)[6]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[6])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[6]), t)
    graph.merge(ht)

    # 第7种关系：第几列：关系名称（第几列表头）：第几列
    sheet.row_values(0)[7]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[7])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[7]), t)
    graph.merge(ht)

    # 第8种关系：
    sheet.row_values(0)[8]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[8])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[8]), t)
    graph.merge(ht)

    # 第9种关系：
    sheet.row_values(0)[9]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[9])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[9]), t)
    graph.merge(ht)

    # 第10种关系：
    sheet.row_values(0)[10]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[10])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[10]), t)
    graph.merge(ht)

    # 第11种关系：
    sheet.row_values(0)[11]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[11])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[11]), t)
    graph.merge(ht)
    # 第12种关系：
    sheet.row_values(0)[12]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[12])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[12]), t)
    graph.merge(ht)
    # 第13种关系：
    sheet.row_values(0)[13]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[13])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[13]), t)
    graph.merge(ht)
    # 第14种关系：
    sheet.row_values(0)[14]
    head = str(sheet.row_values(i)[0])
    tail = str(sheet.row_values(i)[14])
    h = Node(head, name=head)
    graph.merge(h, head, 'name')
    t = Node(tail, name=tail)
    graph.merge(t, tail, 'name')
    ht = Relationship(h, str(sheet.row_values(0)[14]), t)
    graph.merge(ht)


    print(sheet.row_values(i))
