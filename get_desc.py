import re

with open('commit_msg.txt', 'r') as f:
    text = f.read()

lines = text.split('\n')
title = lines[0]
desc = '\n'.join(lines[1:])
print(desc.strip())
