export default [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"collector","type":"address"},{"indexed":false,"internalType":"uint256","name":"loc","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"x","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"y","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"RevealCollected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"requester","type":"address"},{"indexed":false,"internalType":"uint256","name":"loc","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"x","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"y","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"RevealRequested","type":"event"},{"inputs":[{"internalType":"uint256","name":"startIdx","type":"uint256"},{"internalType":"uint256","name":"endIdx","type":"uint256"}],"name":"bulkGetRevealRequests","outputs":[{"components":[{"internalType":"address","name":"requester","type":"address"},{"internalType":"uint256","name":"location","type":"uint256"},{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bool","name":"paid","type":"bool"}],"internalType":"struct RevealRequest[]","name":"ret","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"location","type":"uint256"}],"name":"claimReveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllRevealRequests","outputs":[{"components":[{"internalType":"address","name":"requester","type":"address"},{"internalType":"uint256","name":"location","type":"uint256"},{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bool","name":"paid","type":"bool"}],"internalType":"struct RevealRequest[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNRevealRequests","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"location","type":"uint256"}],"name":"getRevealRequest","outputs":[{"components":[{"internalType":"address","name":"requester","type":"address"},{"internalType":"uint256","name":"location","type":"uint256"},{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bool","name":"paid","type":"bool"}],"internalType":"struct RevealRequest","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_verifierAddress","type":"address"},{"internalType":"address","name":"_coreAddress","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[2]","name":"_a","type":"uint256[2]"},{"internalType":"uint256[2][2]","name":"_b","type":"uint256[2][2]"},{"internalType":"uint256[2]","name":"_c","type":"uint256[2]"},{"internalType":"uint256[9]","name":"_input","type":"uint256[9]"}],"name":"requestReveal","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_coreAddress","type":"address"}],"name":"setDarkForestCore","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_verifierAddress","type":"address"}],"name":"setVerifier","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]