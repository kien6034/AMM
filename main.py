from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://bsc-dataseed1.ninicoin.io'))

w3.eth.get_block('latest')