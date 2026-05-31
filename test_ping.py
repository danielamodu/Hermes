import os
import sys

# add backend dir to path
sys.path.append('/home/xbt/Hermes/backend')

from chain import ChainClient

client = ChainClient()
res = client.ping_network({})
print("RESULT:", res)
