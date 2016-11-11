# import csv
# fields=['first','second','third']
# with open(r'name', 'a') as f:
#                 writer = csv.writer(f)
#                 writer.writerow(fields)

output_file = open('output.csv', 'w')
for i in range(1,27):
    filename = 'out'+str(i)+'.csv'
    with open(filename) as lines:
        for line in lines:
            if line[0] != "b":
                line = line.rstrip('\n')
                print(line + ',' + str(i), file=output_file)