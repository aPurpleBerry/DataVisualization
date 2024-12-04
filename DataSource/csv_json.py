import csv
import json


# 读取CSV文件
def read_csv_file(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data


# 将数据转换为JSON格式并写入文件
def write_json_file(data, output_path):
    with open(output_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=4)


# CSV文件路径和JSON输出路径
csv_file_path = 'data_to_xinhui1.csv'
json_output_path = 'data_to_xinhui.json'

# 读取CSV文件并转换为JSON格式
data = read_csv_file(csv_file_path)
write_json_file(data, json_output_path)

print(f"转换完成！JSON文件已保存为：{json_output_path}")