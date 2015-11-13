#!/usr/bin/python3

import sys
import json
import pprint

if len(sys.argv) != 2:
	print("Usage: python3 json_prettify.py [json_file]")
	sys.exit()

with open(sys.argv[1]) as fp:
	text = fp.read()

	jsonObj = json.loads(text)
	pprint.pprint(jsonObj, width=50, indent=4)