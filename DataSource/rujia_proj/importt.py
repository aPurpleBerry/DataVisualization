from py2neo import Graph

# 连接到 Neo4j 数据库
graph = Graph("http://localhost:7474/", user="neo4j", password="aaaaaaaa", name="neo4j") #更改password、name

graph.run("MATCH(N) DETACH DELETE N")

graph.run("LOAD CSV WITH HEADERS FROM 'file:///output.csv' AS line \
          MERGE (t0:name{name:line.c1})\
          MERGE (t1:tag{name:line.c2})\
          MERGE (t2:tag{name:line.c3}) \
          MERGE (t3:tag{name:line.c4})\
          MERGE (t4:tag{name:line.c5}) \
          MERGE (t5:tag{name:line.c6})\
          MERGE (t6:tag{name:line.c7}) \
          MERGE(t1)-[:belongs_to]->(t0) \
          MERGE(t2)-[:belongs_to]->(t0) \
          MERGE(t3)-[:belongs_to]->(t0) \
          MERGE(t4)-[:belongs_to]->(t0) \
          MERGE(t5)-[:belongs_to]->(t0) \
          MERGE(t6)-[:belongs_to]->(t0) ")

graph.run("MATCH(N) WHERE N.name='N' DETACH DELETE N")
print("创建成功！")