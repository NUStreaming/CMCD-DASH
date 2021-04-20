import os
import json

metrics = ["averageBitrate", "numSwitches", "stallDurationMs", "numStalls", "averageBufferLength", "averageLatency", "averagePlaybackRate"]
summaryResults = {}

folder = input("Enter test folder ('XXXXX_multiple_clients' folders only): ")

summaryFile = os.path.join(folder, "summary.txt")
if os.path.exists(summaryFile):
    os.remove(summaryFile)	# to replace previously generated file
                     
def printToConsoleAndFile(msg):
    print(msg)
    with open(summaryFile, "a+") as f:
        f.write(msg + "\n")

for root, dirs, files in os.walk(folder):
    for name in files:
        if "metrics-overall.json" in name:
            _file = os.path.join(root, name)
            with open(_file) as json_file:
                 data = json.load(json_file)
                 printToConsoleAndFile("")
                 printToConsoleAndFile("------------------------------------------------------")
                 printToConsoleAndFile(_file)
                 printToConsoleAndFile("-------------------------------------------------------")
                 for metric in  metrics:
                     printToConsoleAndFile(metric + ": " + str(data[metric]))
                     if metric not in summaryResults:
                         summaryResults[metric] = {
                             "sum": 0,
                             "count": 0,
                             "min": None,
                             "max": None
                         }
                     summaryResults[metric]["sum"] += data[metric]
                     summaryResults[metric]["count"] += 1
                     if summaryResults[metric]["min"] == None or data[metric] < summaryResults[metric]["min"]:
                         summaryResults[metric]["min"] = data[metric]
                     if summaryResults[metric]["max"] == None or data[metric] > summaryResults[metric]["max"]:
                         summaryResults[metric]["max"] = data[metric]

spacedLine=""
printToConsoleAndFile("")
printToConsoleAndFile("------------------------------------------------------")
printToConsoleAndFile("SUMMARY")
printToConsoleAndFile("-------------------------------------------------------")
for metric, obj in summaryResults.items():
     printToConsoleAndFile(metric + ": ")
     printToConsoleAndFile("- average: " + str(summaryResults[metric]["sum"] / summaryResults[metric]["count"]))
     for key, value in obj.items():
        printToConsoleAndFile("- " + key + ": " + str(value))
     spacedLine+=str(summaryResults[metric]["sum"] / summaryResults[metric]["count"]) + ", "
     spacedLine+=str(summaryResults[metric]["min"]) + ", " + str(summaryResults[metric]["max"]) + ", "

#easier to paste to csv
headers=""
for metric in metrics:
    headers+=metric+"_average, "+metric+"_min, "+metric+"_max, "
print("")
print(headers)
print(spacedLine)

 
comments = None

for root, dirs, files in os.walk(folder):
    for name in files:
        if "evaluate.json" in name and comments == None:
            _file = os.path.join(root, name)
            with open(_file) as json_file:
                data = json.load(json_file)
                comments = data["comments"]
                printToConsoleAndFile("")
                printToConsoleAndFile("# Comments for run: " + comments)
                break
