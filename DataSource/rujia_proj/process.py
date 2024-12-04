import csv

input_file = '1-100 names.csv'
output_file = 'output.csv'

with open(input_file, mode='r', encoding='utf-8') as infile:
    reader = csv.reader(infile)
    rows = list(reader)

# 创建新的行列表
new_rows = []

# 遍历每一行
for row in rows:
    if len(row) > 1 and '、' in row[1]:
        # 分割第二列的内容
        parts = row[1].split('、')
        new_row = [row[0]] + parts
        new_rows.append(new_row)
    else:
        new_rows.append([row[0], row[1]])

# 写入新的CSV文件
with open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    writer = csv.writer(outfile)
    writer.writerows(new_rows)