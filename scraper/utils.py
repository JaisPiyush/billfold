from Crypto.Hash import keccak

def get_keccak_256(digest: str) -> str:
    k = keccak.new(digest_bits=256)
    k.update(digest)
    return k.hexdigest()